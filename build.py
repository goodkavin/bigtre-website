#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.10"
# dependencies = ["markdown", "pyyaml"]
# ///
"""Static-page generator for bigtre.business.

content/<lang>/<slug>.md + content/facts.yml  ->  <lang>/<slug>.html, <lang>/<slug>.md,
sitemap.xml, llms.txt, llms-full.txt, and the JSON-LD block of index.html.

  uv run build.py            write files
  uv run build.py --check    build in memory, exit 1 if anything on disk differs
  uv run build.py --root DIR use DIR as the repo root (tests)

The output is committed. Never edit the generated files by hand.
"""
from __future__ import annotations

import argparse
import datetime
import html as htmllib
import json
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

import markdown
import yaml

LANGS = ("en", "th")
SCHEMAS = ("hub", "about", "service", "work", "compare", "faq", "article")
LANDING_LASTMOD = "2026-05-20"  # fallback when sitemap.xml has no lastmod for "/"
REQUIRED_KEYS = ("title", "description", "schema", "updated", "order", "nav")

STR = {
    "en": {"updated": "Updated", "home": "Home", "switch": "ภาษาไทย", "switch_lang": "th",
           "nav": "Pages", "locale": "en_US", "health": "Free AI Readiness Health Check"},
    "th": {"updated": "อัปเดตล่าสุด", "home": "หน้าแรก", "switch": "English", "switch_lang": "en",
           "nav": "หน้าทั้งหมด", "locale": "th_TH", "health": "ตรวจความพร้อม AI ฟรี"},
}


class BuildError(Exception):
    pass


# ---------------------------------------------------------------- helpers

def slugify(value: str, separator: str = "-") -> str:
    """Heading id that keeps Thai (python-markdown's default drops non-ASCII)."""
    out = []
    for ch in unicodedata.normalize("NFC", value.strip().lower()):
        cat = unicodedata.category(ch)
        if ch.isspace() or ch in "-_":
            out.append(separator)
        elif cat[0] in "LNM":  # letters, numbers, combining marks (Thai vowels and tone marks)
            out.append(ch)
    s = re.sub(re.escape(separator) + "+", separator, "".join(out)).strip(separator)
    return s or "section"


class _Text(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def plain_text(fragment_html: str) -> str:
    p = _Text()
    p.feed(fragment_html)
    return re.sub(r"\s+", " ", " ".join(p.parts)).strip()


def canonical(facts: dict, lang: str, slug: str) -> str:
    base = facts["url"].rstrip("/")
    return f"{base}/{lang}" if slug == "index" else f"{base}/{lang}/{slug}"


def twin_url(facts: dict, lang: str, slug: str) -> str:
    return f"{facts['url'].rstrip('/')}/{lang}/{slug}.md"


def local_path(lang: str, slug: str) -> str:
    return f"/{lang}" if slug == "index" else f"/{lang}/{slug}"


def fence_aware_lines(text: str):
    """Yield (line, in_code) for each line."""
    in_code = False
    for line in text.split("\n"):
        if re.match(r"^\s*(```|~~~)", line):
            in_code = not in_code
            yield line, True
            continue
        yield line, in_code


# ---------------------------------------------------------------- loading

class Page:
    def __init__(self, lang: str, slug: str, meta: dict, body: str, src: str):
        self.lang, self.slug, self.meta, self.body, self.src = lang, slug, meta, body, src
        self.title: str = meta["title"]
        self.description: str = meta["description"]
        self.schema: str = meta["schema"]
        self.updated: str = meta["updated"]
        self.order: int = meta["order"]
        self.nav: str = meta["nav"]
        self.h1 = ""
        self.html_body = ""


def load_facts(root: Path) -> dict:
    facts = yaml.safe_load((root / "content" / "facts.yml").read_text(encoding="utf-8"))
    if not isinstance(facts, dict):
        raise BuildError("content/facts.yml must be a mapping")
    miss = [k for k in ("name", "url", "legal_name_en", "legal_name_th", "email", "city_en", "city_th", "country_en", "country_th", "country_code") if k not in facts]
    if miss:
        raise BuildError("content/facts.yml missing keys: " + ", ".join(miss))
    return stringify_dates(facts)


def stringify_dates(v):
    if isinstance(v, dict):
        return {k: stringify_dates(x) for k, x in v.items()}
    if isinstance(v, list):
        return [stringify_dates(x) for x in v]
    return v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else v


def lookup(facts: dict, key: str):
    """Dotted access: 'name', 'founders.0.name_en'. Raises KeyError."""
    cur = facts
    for part in key.split("."):
        if isinstance(cur, dict):
            cur = cur[part]
        elif isinstance(cur, list):
            cur = cur[int(part)]
        else:
            raise KeyError(key)
    return cur


def resolve(text: str, facts: dict, where: str) -> str:
    def sub(m: re.Match) -> str:
        key = m.group(1)
        try:
            v = lookup(facts, key)
        except (KeyError, IndexError, ValueError):
            raise BuildError(f"{where}: unknown placeholder {{{{{key}}}}}")
        if isinstance(v, (list, dict)):
            raise BuildError(f"{where}: placeholder {{{{{key}}}}} is not a scalar")
        return "" if v is None else str(v)
    return re.sub(r"\{\{\s*([A-Za-z0-9_.]+)\s*\}\}", sub, text)


def parse_page(path: Path, lang: str, slug: str, facts: dict, errors: list[str]) -> Page | None:
    where = f"content/{lang}/{slug}.md"
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"\A---\n(.*?)\n---\n?(.*)\Z", raw, re.S)
    if not m:
        errors.append(f"{where}: missing YAML frontmatter")
        return None
    try:
        meta = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        errors.append(f"{where}: bad frontmatter: {e}")
        return None
    miss = [k for k in REQUIRED_KEYS if k not in meta]
    if miss:
        errors.append(f"{where}: frontmatter missing {', '.join(miss)}")
        return None
    try:
        meta = {k: (resolve(v, facts, where) if isinstance(v, str) else v) for k, v in meta.items()}
        body = resolve(m.group(2), facts, where).strip("\n") + "\n"
    except BuildError as e:
        errors.append(str(e))
        return None
    meta["updated"] = str(meta["updated"])
    if meta["schema"] not in SCHEMAS:
        errors.append(f"{where}: schema must be one of {', '.join(SCHEMAS)}")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", meta["updated"]):
        errors.append(f"{where}: updated must be YYYY-MM-DD")
    if not isinstance(meta["order"], int):
        errors.append(f"{where}: order must be an int")
    if meta["schema"] == "service" and not meta.get("service_type"):
        errors.append(f"{where}: schema service needs service_type")
    if (slug == "index") != (meta["schema"] == "hub"):
        errors.append(f"{where}: index must be schema hub and only index")
    h1s = [l for l, code in fence_aware_lines(body) if not code and re.match(r"^# \S", l)]
    if len(h1s) != 1:
        errors.append(f"{where}: needs exactly one '# ' H1 (found {len(h1s)})")
        return None
    page = Page(lang, slug, meta, body, where)
    page.h1 = h1s[0][2:].strip()
    return page


def load_pages(root: Path, facts: dict) -> dict[tuple[str, str], Page]:
    errors: list[str] = []
    pages: dict[tuple[str, str], Page] = {}
    found: dict[str, set[str]] = {}
    for lang in LANGS:
        d = root / "content" / lang
        found[lang] = {p.stem for p in d.glob("*.md")} if d.is_dir() else set()
    if "index" not in found["en"] or "index" not in found["th"]:
        errors.append("content/<lang>/index.md is required in both en and th")
    for lang in LANGS:
        other = LANGS[1 - LANGS.index(lang)]
        for slug in sorted(found[lang] - found[other]):
            errors.append(f"content/{lang}/{slug}.md has no content/{other}/{slug}.md")
    for lang in LANGS:
        d = root / "content" / lang
        for slug in sorted(found[lang]):
            if slug in found[LANGS[1 - LANGS.index(lang)]]:
                pg = parse_page(d / f"{slug}.md", lang, slug, facts, errors)
                if pg:
                    pages[(lang, slug)] = pg
    if errors:
        raise BuildError("\n".join(errors))
    # internal links must resolve, and are normalised to extensionless, no trailing slash
    known = {local_path(l, s) for (l, s) in pages}
    for pg in pages.values():
        def fix(m: re.Match) -> str:
            target, frag = m.group(2), m.group(3) or ""
            norm = re.sub(r"\.md$", "", target.rstrip("/")) or target
            if norm in ("/en", "/th") or norm.startswith(("/en/", "/th/")):
                if norm not in known:
                    errors.append(f"{pg.src}: link to unknown page {target}")
                return f"{m.group(1)}{norm}{frag})"
            return m.group(0)
        out = []
        for line, code in fence_aware_lines(pg.body):
            out.append(line if code else re.sub(r"(\]\()(/(?:en|th)(?:/[^)#\s]*)?)(#[^)\s]*)?\)", fix, line))
        pg.body = "\n".join(out)
    if errors:
        raise BuildError("\n".join(errors))
    return pages


def ordered(pages: dict, lang: str) -> list[Page]:
    return sorted((p for (l, _), p in pages.items() if l == lang), key=lambda p: (p.order, p.slug))


# ---------------------------------------------------------------- rendering

def render_markdown(body: str) -> str:
    md = markdown.Markdown(
        extensions=["tables", "attr_list", "sane_lists", "toc"],
        extension_configs={"toc": {"slugify": slugify, "permalink": False}},
    )
    out = md.convert(body)
    return re.sub(r"<table>(.*?)</table>", r'<div class="table-wrap"><table>\1</table></div>', out, flags=re.S)


def twin_markdown(page: Page, facts: dict) -> str:
    base = facts["url"].rstrip("/")
    lines = []
    done = False
    for line, code in fence_aware_lines(page.body):
        if not code:
            line = re.sub(r"(\]\()(/(?:en|th|assets|ai-readiness|privacy)[^)\s]*)", lambda m: m.group(1) + base + m.group(2), line)
        lines.append(line)
        if not done and not code and re.match(r"^# \S", line):
            lines += ["", f"Canonical: {canonical(facts, page.lang, page.slug)}  ",
                      f"Updated: {page.updated}"]
            done = True
    return "\n".join(lines).rstrip("\n") + "\n"


def faq_items(body: str) -> list[tuple[str, str]]:
    items: list[tuple[str, list[str]]] = []
    cur: tuple[str, list[str]] | None = None
    for line, code in fence_aware_lines(body):
        if not code and re.match(r"^#{1,6} ", line):
            cur = None
            if re.match(r"^### ", line):
                cur = (line[4:].strip(), [])
                items.append(cur)
            continue
        if cur is not None:
            cur[1].append(line)
    out = []
    for q, ans in items:
        text = plain_text(render_markdown("\n".join(ans)))
        if text:
            out.append((plain_text(render_markdown(q)), text))
    return out


# ---------------------------------------------------------------- JSON-LD

def prune(v):
    """Drop empty strings, lists, dicts and None, recursively."""
    if isinstance(v, dict):
        out = {k: prune(x) for k, x in v.items()}
        return {k: x for k, x in out.items() if x not in ("", None, [], {})}
    if isinstance(v, list):
        return [x for x in (prune(i) for i in v) if x not in ("", None, [], {})]
    return v


def founders_of(facts: dict) -> list[dict]:
    return [f for f in (facts.get("founders") or []) if isinstance(f, dict) and f.get("id")]


def org_node(facts: dict, lang: str) -> dict:
    base = facts["url"].rstrip("/")
    alt = list(facts.get("alternate_names") or []) + [facts.get("legal_name_th")]
    return prune({
        "@type": ["Organization", "ProfessionalService"],
        "@id": f"{base}/#org",
        "name": facts["name"],
        "legalName": facts.get("legal_name_en") or facts.get("legal_name_th"),
        "alternateName": alt,
        "url": f"{base}/",
        "logo": facts.get("logo"),
        "email": facts.get("email"),
        "telephone": facts.get("telephone"),
        "foundingDate": facts.get("founded"),
        "founder": [{"@id": f"{base}/#founder-{f['id']}"} for f in founders_of(facts)],
        "address": {"@type": "PostalAddress", "streetAddress": facts.get(f"street_{lang}"),
                    "addressLocality": facts.get(f"city_{lang}"), "postalCode": facts.get("postal_code"),
                    "addressCountry": facts.get("country_code")},
        "areaServed": facts.get("country_code"),
        "sameAs": list(facts.get("same_as") or []),
        "taxID": facts.get("registration_no"),
        "knowsLanguage": ["en", "th"],
        "slogan": facts.get("slogan"),
        "description": facts.get(f"description_{lang}"),
    })


def website_node(facts: dict) -> dict:
    base = facts["url"].rstrip("/")
    return {"@type": "WebSite", "@id": f"{base}/#website", "url": f"{base}/", "name": facts["name"],
            "inLanguage": ["en", "th"], "publisher": {"@id": f"{base}/#org"}}


def person_nodes(facts: dict, lang: str, full: bool) -> list[dict]:
    base = facts["url"].rstrip("/")
    out = []
    for f in founders_of(facts):
        node = {"@type": "Person", "@id": f"{base}/#founder-{f['id']}", "name": f.get("name_en"),
                "alternateName": f.get("name_th")}
        if full:
            node["jobTitle"] = f.get(f"title_{lang}")
            node["description"] = f.get(f"bio_{lang}")
            node["sameAs"] = list(f.get("same_as") or [])
            node["worksFor"] = {"@id": f"{base}/#org"}
        out.append(prune(node))
    return out


def jsonld_for(page: Page, facts: dict, pages: dict) -> dict:
    base = facts["url"].rstrip("/")
    lang = page.lang
    url = canonical(facts, lang, page.slug)
    wtype = {"hub": "CollectionPage", "about": "AboutPage"}.get(page.schema, "WebPage")
    webpage = {
        "@type": wtype, "@id": url, "url": url, "name": page.h1, "description": page.description,
        "inLanguage": lang, "dateModified": page.updated,
        "isPartOf": {"@id": f"{base}/#website"}, "about": {"@id": f"{base}/#org"},
    }
    hub = pages[(lang, "index")]
    crumbs = [(STR[lang]["home"], f"{base}/"), (hub.nav, canonical(facts, lang, "index"))]
    if page.slug != "index":
        crumbs.append((page.nav, url))
    breadcrumb = {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]}
    graph = [org_node(facts, lang), website_node(facts), *person_nodes(facts, lang, page.schema == "about"),
             webpage, breadcrumb]
    if page.schema == "service":
        graph.append({
            "@type": "Service", "@id": f"{url}#service", "name": page.h1,
            "serviceType": page.meta["service_type"], "description": page.description,
            "provider": {"@id": f"{base}/#org"}, "areaServed": facts.get("country_code"),
            "availableLanguage": ["en", "th"], "url": url,
        })
    if page.schema == "faq":
        graph.append({
            "@type": "FAQPage", "@id": f"{url}#faq", "url": url, "inLanguage": lang,
            "mainEntity": [{"@type": "Question", "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq_items(page.body)],
        })
    return {"@context": "https://schema.org", "@graph": prune(graph)}


def ld_json(obj: dict) -> str:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


# ---------------------------------------------------------------- HTML

CSS = """
:root{--bg:#F2EEE5;--paper:#FBF8F1;--ink:#14110D;--ink-soft:#2A2620;--ink-mute:#6B645A;--rule:#14111022;--accent:#0E5C3B;--accent-soft:#D6E6DC;--head:"Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",sans-serif;--sans:"Geist",system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"Geist Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace;--gut:clamp(20px,4vw,40px)}
html[lang=th]{--head:"IBM Plex Sans Thai","Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",sans-serif;--sans:"IBM Plex Sans Thai","Geist",system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"IBM Plex Sans Thai","Geist Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace}
*{box-sizing:border-box}
html{background:var(--bg);color-scheme:light;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink-soft);font-family:var(--sans);font-weight:400;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-wrap:break-word}
html[lang=th] body{line-height:1.8}
@media(min-width:900px){body{font-size:17px}}
::selection{background:var(--accent-soft);color:var(--ink)}
a{color:var(--accent);text-decoration:underline;text-underline-offset:.2em;text-decoration-thickness:1px}
a:hover{text-decoration-thickness:2px}
a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.wrap{max-width:calc(72ch + 2 * var(--gut));margin:0 auto;padding:0 var(--gut)}
header.top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 24px;padding-block:14px;border-bottom:1px solid var(--rule);font-family:var(--mono);font-size:13px}
.brand{display:inline-flex;align-items:center;gap:2px;min-height:44px;text-decoration:none;color:var(--ink);font-family:var(--head);font-weight:600;font-size:20px;letter-spacing:-.01em}
.brand .mark{color:var(--accent);font-weight:500}
html[lang=th] .brand{font-family:var(--head)}
.lang{display:inline-flex;align-items:center;min-height:44px;color:var(--ink-mute);text-decoration:none;border-bottom:1px solid var(--rule)}
.lang:hover{color:var(--accent)}
nav.pages{padding-block:8px;line-height:1.4;border-bottom:1px solid var(--rule);font-family:var(--mono);font-size:13px}
nav.pages ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0 22px}
nav.pages a{display:inline-block;padding-block:8px;color:var(--ink-mute);text-decoration:none}
nav.pages a:hover,nav.pages a[aria-current]{color:var(--accent);text-decoration:underline}
main{padding-block:clamp(28px,6vw,56px) 24px}
h1,h2,h3{font-family:var(--head);font-weight:600;color:var(--ink);line-height:1.2;letter-spacing:-.01em}
html[lang=th] h1,html[lang=th] h2,html[lang=th] h3{line-height:1.45;letter-spacing:0}
h1{font-size:clamp(28px,5.6vw,42px);margin:0 0 .5em}
h2{font-size:clamp(21px,3.6vw,26px);margin:2.2em 0 .6em;padding-top:1.1em;border-top:1px solid var(--rule)}
h3{font-size:clamp(17px,2.8vw,20px);margin:1.8em 0 .4em;font-weight:500}
p,ul,ol,table{margin:0 0 1.1em}
ul,ol{padding-left:1.4em}
li{margin-bottom:.35em}
strong{color:var(--ink);font-weight:500}
code{font-family:"Geist Mono",ui-monospace,Menlo,Consolas,monospace;font-size:.9em;background:var(--paper);padding:.1em .3em}
.updated{margin:0 0 2em;color:var(--ink-mute);font-family:var(--mono);font-size:13px}
.table-wrap{overflow-x:auto;margin:0 0 1.4em;-webkit-overflow-scrolling:touch}
table{border-collapse:collapse;width:100%;min-width:34em;font-size:.94em;line-height:1.5;margin:0}
th,td{text-align:left;vertical-align:top;padding:.6em 1em .6em 0;border-bottom:1px solid var(--rule)}
th{font-family:var(--mono);font-weight:500;color:var(--ink);font-size:.9em}
footer.foot{padding-block:24px 40px;border-top:1px solid var(--rule);color:var(--ink-mute);font-family:var(--mono);font-size:13px;line-height:1.7}
footer.foot p{margin:0 0 .3em}
footer.foot a{color:var(--ink-mute)}
footer.foot a:hover{color:var(--accent)}
"""


def render_html(page: Page, facts: dict, pages: dict) -> str:
    base = facts["url"].rstrip("/")
    lang, slug = page.lang, page.slug
    other = STR[lang]["switch_lang"]
    url = canonical(facts, lang, slug)
    esc = htmllib.escape
    s = STR[lang]
    fonts = "family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600&family=Geist:wght@400;500&family=Geist+Mono:wght@400;500"
    if lang == "th":
        fonts += "&family=IBM+Plex+Sans+Thai:wght@400;500;600"
    fonts += "&display=swap"

    article = render_markdown(page.body)
    updated = (f'<p class="updated">{s["updated"]} <time datetime="{page.updated}">{page.updated}</time></p>')
    article = re.sub(r"</h1>", "</h1>\n" + updated, article, count=1)

    cur = ' aria-current="page"'
    nav_items = "\n".join(
        f'<li><a href="{local_path(lang, p.slug)}"{cur if p.slug == slug else ""}>{esc(p.nav)}</a></li>'
        for p in ordered(pages, lang))
    hreflangs = "\n".join(
        f'<link rel="alternate" hreflang="{h}" href="{canonical(facts, l, slug)}">'
        for h, l in (("en", "en"), ("th", "th"), ("x-default", "en")))
    foot_name = (facts["legal_name_en"] if lang == "en" else "") or facts["legal_name_th"]
    foot_city = f'{facts[f"city_{lang}"]}, {facts[f"country_{lang}"]}'
    contact = [f'<a href="mailto:{esc(facts["email"])}">{esc(facts["email"])}</a>' if facts.get("email") else "",
               f'<a href="tel:{esc(str(facts["telephone"]))}">{esc(str(facts.get("telephone_display_" + lang) or facts.get("telephone_display") or facts["telephone"]))}</a>' if facts.get("telephone") else ""]
    contact_line = " · ".join(c for c in contact if c)
    title = esc(page.title)
    desc = esc(page.description, quote=True)

    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#F2EEE5">
<link rel="canonical" href="{url}">
{hreflangs}
<link rel="alternate" type="text/markdown" href="/{lang}/{slug}.md">
<meta property="og:type" content="{"website" if slug == "index" else "article"}">
<meta property="og:site_name" content="{esc(facts['name'])}">
<meta property="og:locale" content="{s['locale']}">
<meta property="og:locale:alternate" content="{STR[other]['locale']}">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{base}/favicon.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{base}/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fonts}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>{CSS}</style>
<script type="application/ld+json">{ld_json(jsonld_for(page, facts, pages))}</script>
</head>
<body>
<div class="wrap">
<header class="top">
<a class="brand" href="/">{esc(facts['name'])}<span class="mark" aria-hidden="true">↟</span></a>
<a class="lang" href="{local_path(other, slug)}" hreflang="{other}" lang="{other}">{s['switch']}</a>
</header>
<nav class="pages" aria-label="{s['nav']}">
<ul>
{nav_items}
</ul>
</nav>
<main>
<article>
{article}
</article>
</main>
<footer class="foot">
<p>{esc(foot_name)} · {esc(foot_city)}</p>
<p>{contact_line}</p>
<p><a href="/ai-readiness/">{s['health']}</a> · © 2026 {esc(facts['name'])}</p>
</footer>
</div>
</body>
</html>
"""


# ---------------------------------------------------------------- site files

def sitemap_lastmod(root: Path, loc: str) -> str | None:
    p = root / "sitemap.xml"
    if p.exists():
        m = re.search(r"<loc>" + re.escape(loc) + r"</loc>\s*<lastmod>([^<]+)</lastmod>", p.read_text(encoding="utf-8"))
        if m:
            return m.group(1)
    return None


def build_sitemap(root: Path, facts: dict, pages: dict) -> str:
    base = facts["url"].rstrip("/")
    landing = sitemap_lastmod(root, f"{base}/") or LANDING_LASTMOD
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for path, prio in (("/", "1.0"), ("/ai-readiness/", "0.8"), ("/privacy/", "0.3")):
        loc = f"{base}{path}"
        out += ["  <url>", f"    <loc>{loc}</loc>", f"    <lastmod>{sitemap_lastmod(root, loc) or landing}</lastmod>",
                "    <changefreq>monthly</changefreq>", f"    <priority>{prio}</priority>", "  </url>"]
    for lang in LANGS:
        for p in ordered(pages, lang):
            out += ["  <url>", f"    <loc>{canonical(facts, lang, p.slug)}</loc>",
                    f"    <lastmod>{p.updated}</lastmod>", "    <changefreq>monthly</changefreq>",
                    f"    <priority>{'0.9' if p.slug == 'index' else '0.8'}</priority>"]
            for h, l in (("en", "en"), ("th", "th"), ("x-default", "en")):
                out.append(f'    <xhtml:link rel="alternate" hreflang="{h}" href="{canonical(facts, l, p.slug)}"/>')
            out.append("  </url>")
    out.append("</urlset>")
    return "\n".join(out) + "\n"


def build_llms(root: Path, facts: dict, pages: dict) -> str:
    head = (root / "content" / "llms-head.md").read_text(encoding="utf-8").rstrip("\n")
    parts = [head, ""]
    for lang, label in (("en", "English"), ("th", "ภาษาไทย")):
        parts.append(f"## Pages ({label})")
        parts.append("")
        for p in ordered(pages, lang):
            parts.append(f"- [{p.title}]({twin_url(facts, lang, p.slug)}): {p.description}")
        parts.append("")
    parts += ["## Contact", "", f"- [{facts['email']}](mailto:{facts['email']})", ""]
    return "\n".join(parts)


def build_llms_full(facts: dict, pages: dict, twins: dict) -> str:
    chunks = []
    for lang in LANGS:
        for p in ordered(pages, lang):
            chunks.append(f"{canonical(facts, lang, p.slug)}\n\n{twins[(lang, p.slug)].rstrip(chr(10))}")
    return "\n\n---\n\n".join(chunks) + "\n"


LD_START, LD_END = "<!-- entity-jsonld:start -->", "<!-- entity-jsonld:end -->"
LD_RE = re.compile(re.escape(LD_START) + r".*?" + re.escape(LD_END), re.S)


def build_index_html(root: Path, facts: dict) -> str:
    text = (root / "index.html").read_text(encoding="utf-8")
    if len(LD_RE.findall(text)) != 1:
        raise BuildError(f"index.html needs exactly one {LD_START} ... {LD_END} block")
    graph = {"@context": "https://schema.org",
             "@graph": prune([org_node(facts, "en"), website_node(facts), *person_nodes(facts, "en", True)])}
    block = f'{LD_START}\n<script type="application/ld+json">{ld_json(graph)}</script>\n{LD_END}'
    return LD_RE.sub(lambda m: block, text, count=1)


# ---------------------------------------------------------------- driver

def build_all(root: Path) -> dict[str, str]:
    facts = load_facts(root)
    pages = load_pages(root, facts)
    files: dict[str, str] = {}
    twins: dict[tuple[str, str], str] = {}
    for (lang, slug), p in sorted(pages.items()):
        twins[(lang, slug)] = twin_markdown(p, facts)
        files[f"{lang}/{slug}.md"] = twins[(lang, slug)]
        files[f"{lang}/{slug}.html"] = render_html(p, facts, pages)
    files["sitemap.xml"] = build_sitemap(root, facts, pages)
    files["llms.txt"] = build_llms(root, facts, pages)
    files["llms-full.txt"] = build_llms_full(facts, pages, twins)
    files["index.html"] = build_index_html(root, facts)
    return files


def stale_files(root: Path, files: dict[str, str]) -> list[str]:
    out = []
    for lang in LANGS:
        d = root / lang
        if d.is_dir():
            for p in sorted(d.iterdir()):
                rel = f"{lang}/{p.name}"
                if p.suffix in (".html", ".md") and rel not in files:
                    out.append(rel)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="exit 1 if generated files on disk differ")
    ap.add_argument("--root", default=str(Path(__file__).resolve().parent), help="repo root (default: this file's dir)")
    args = ap.parse_args()
    root = Path(args.root).resolve()
    try:
        files = build_all(root)
    except BuildError as e:
        print(f"build error:\n{e}", file=sys.stderr)
        return 1
    stale = stale_files(root, files)
    if args.check:
        bad = []
        for rel, content in files.items():
            p = root / rel
            if not p.exists():
                bad.append(f"missing  {rel}")
            elif p.read_text(encoding="utf-8") != content:
                bad.append(f"differs  {rel}")
        bad += [f"stale    {rel}" for rel in stale]
        if bad:
            print("generated files are out of date, run `uv run build.py`:", file=sys.stderr)
            print("\n".join(bad), file=sys.stderr)
            return 1
        print(f"ok: {len(files)} generated files up to date")
        return 0
    for rel, content in files.items():
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        if not p.exists() or p.read_text(encoding="utf-8") != content:
            p.write_text(content, encoding="utf-8")
    for rel in stale:
        (root / rel).unlink()
    print(f"wrote {len(files)} files" + (f", removed {len(stale)} stale" if stale else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
