#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.10"
# dependencies = ["beautifulsoup4", "pyyaml"]
# ///
"""Checks on the generated files of bigtre.business. Run: uv run tests/check.py [--root DIR]"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import yaml
from bs4 import BeautifulSoup

LANGS = ("en", "th")
EM_DASH = "\u2014"
LD_MARK = re.compile(r"<!-- entity-jsonld:start -->(.*?)<!-- entity-jsonld:end -->", re.S)
SCHEMA_TYPE = {"hub": "CollectionPage", "about": "AboutPage"}

fails: list[str] = []


def fail(msg: str) -> None:
    fails.append(msg)


def url(base: str, lang: str, slug: str) -> str:
    return f"{base}/{lang}" if slug == "index" else f"{base}/{lang}/{slug}"


def graph_of(soup: BeautifulSoup, where: str) -> list[dict]:
    tags = soup.find_all("script", type="application/ld+json")
    if len(tags) != 1:
        fail(f"{where}: expected exactly 1 ld+json script, found {len(tags)}")
        return []
    return parse_ld(tags[0].string or "", where)


def parse_ld(raw: str, where: str) -> list[dict]:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        fail(f"{where}: JSON-LD does not parse: {e}")
        return []
    g = data.get("@graph")
    if not isinstance(g, list):
        fail(f"{where}: JSON-LD has no @graph")
        return []
    return g


def has_empty(v) -> bool:
    if isinstance(v, dict):
        return any(has_empty(x) for x in v.values())
    if isinstance(v, list):
        return v == [] or any(has_empty(x) for x in v)
    return v in ("", None)


def is_org(n: dict) -> bool:
    ty = n.get("@type")
    return ty == "Organization" or (isinstance(ty, list) and "Organization" in ty)


def schema_of(root: Path, slug: str) -> str:
    m = re.match(r"\A---\n(.*?)\n---", (root / "content" / "en" / f"{slug}.md").read_text(encoding="utf-8"), re.S)
    return (yaml.safe_load(m.group(1)) or {}).get("schema", "") if m else ""


def resolves(root: Path, href: str) -> bool:
    """Does an internal href map to a file the way Vercel cleanUrls serves it?"""
    path = href.split("#")[0].split("?")[0]
    if not path:
        return True
    rel = path.lstrip("/")
    cands = [root / rel, root / (rel + ".html"), root / rel / "index.html"] if rel else [root / "index.html"]
    if rel.startswith("api/"):
        return True
    return any(c.is_file() for c in cands)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=str(Path(__file__).resolve().parent.parent))
    ap.add_argument("--skip-build-check", action="store_true")
    args = ap.parse_args()
    root = Path(args.root).resolve()
    facts = yaml.safe_load((root / "content" / "facts.yml").read_text(encoding="utf-8"))
    base = facts["url"].rstrip("/")
    org_id = f"{base}/#org"
    texts: dict[str, str] = {}

    SLUGS = sorted(p.stem for p in (root / "content" / "en").glob("*.md"))
    if "index" not in SLUGS:
        fail("content/en/index.md missing")
    if sorted(p.stem for p in (root / "content" / "th").glob("*.md")) != SLUGS:
        fail("content/en and content/th do not hold the same slugs")

    # presence
    for lang in LANGS:
        for slug in SLUGS:
            for ext in ("html", "md"):
                p = root / lang / f"{slug}.{ext}"
                if not p.exists():
                    fail(f"missing {lang}/{slug}.{ext}")
                else:
                    texts[f"{lang}/{slug}.{ext}"] = p.read_text(encoding="utf-8")

    for lang in LANGS:
        for slug in SLUGS:
            key = f"{lang}/{slug}.html"
            if key not in texts:
                continue
            soup = BeautifulSoup(texts[key], "html.parser")
            canon = url(base, lang, slug)
            h1s = soup.find_all("h1")
            if len(h1s) != 1:
                fail(f"{key}: {len(h1s)} <h1> (need exactly 1)")
            link = soup.find("link", rel="canonical")
            if not link or link.get("href") != canon:
                fail(f"{key}: canonical should be {canon}, got {link.get('href') if link else None}")
            html_tag = soup.find("html")
            if not html_tag or html_tag.get("lang") != lang:
                fail(f"{key}: <html lang> should be {lang}")
            alts = {l.get("hreflang"): l.get("href") for l in soup.find_all("link", rel="alternate") if l.get("hreflang")}
            want = {"en": url(base, "en", slug), "th": url(base, "th", slug), "x-default": url(base, "en", slug)}
            if alts != want:
                fail(f"{key}: hreflang {alts} != {want}")
            md = soup.find("link", rel="alternate", type="text/markdown")
            if not md or md.get("href") != f"/{lang}/{slug}.md":
                fail(f"{key}: missing text/markdown alternate /{lang}/{slug}.md")
            main_tag = soup.find("main")
            if not main_tag:
                fail(f"{key}: no <main>")
            elif lang == "th":
                n = len(re.findall(r"[\u0e00-\u0e7f]", main_tag.get_text()))
                if n < 20:
                    fail(f"{key}: only {n} Thai characters in <main>")
            if not soup.find(class_="updated"):
                fail(f"{key}: no visible Updated date")
            for sc in soup.find_all("script"):
                if sc.get("type") != "application/ld+json":
                    fail(f"{key}: forbidden <script> (type={sc.get('type')})")
            for a in soup.find_all("a", href=True):
                h = a["href"]
                if h.startswith("/") and not resolves(root, h):
                    fail(f"{key}: internal link does not resolve: {h}")
            g = graph_of(soup, key)
            if has_empty(g):
                fail(f"{key}: JSON-LD contains empty values")
            orgs = [n for n in g if is_org(n)]
            if len(orgs) != 1 or orgs[0].get("@id") != org_id:
                fail(f"{key}: Organization @id should be {org_id}")
            types = {n.get("@type") for n in g if isinstance(n.get("@type"), str)}
            if "BreadcrumbList" not in types or not ({"WebPage", "AboutPage", "CollectionPage"} & types):
                fail(f"{key}: JSON-LD missing WebPage/BreadcrumbList")
            schema = schema_of(root, slug)
            want_t = SCHEMA_TYPE.get(schema)
            if want_t and want_t not in types:
                fail(f"{key}: JSON-LD should contain {want_t}")
            if schema == "service" and "Service" not in types:
                fail(f"{key}: service page needs a Service node")
            if schema != "service" and "Service" in types:
                fail(f"{key}: only service pages carry a Service node")
            if schema == "faq":
                faqs = [n for n in g if n.get("@type") == "FAQPage"]
                q = len(faqs[0].get("mainEntity", [])) if faqs else 0
                if q < 1:
                    fail(f"{key}: FAQPage has no questions")
            # reciprocal hreflang: the paired page points back
            other = "th" if lang == "en" else "en"
            ok = f"{other}/{slug}.html"
            if ok in texts:
                osoup = BeautifulSoup(texts[ok], "html.parser")
                oalts = {l.get("hreflang"): l.get("href") for l in osoup.find_all("link", rel="alternate") if l.get("hreflang")}
                if oalts.get(lang) != url(base, lang, slug):
                    fail(f"{key}: pair {ok} does not point back with hreflang={lang}")
                og = graph_of(osoup, ok)
                oorgs = [n for n in og if is_org(n)]
                if oorgs and orgs and oorgs[0].get("@id") != orgs[0].get("@id"):
                    fail(f"{key}: Organization @id differs from {ok}")

    # index.html
    idx = root / "index.html"
    if idx.exists():
        m = LD_MARK.search(idx.read_text(encoding="utf-8"))
        if not m:
            fail("index.html: entity-jsonld markers missing")
        else:
            s = BeautifulSoup(m.group(1), "html.parser").find("script", type="application/ld+json")
            g = parse_ld(s.string if s else "", "index.html")
            orgs = [n for n in g if is_org(n)]
            if len(orgs) != 1 or orgs[0].get("@id") != org_id:
                fail(f"index.html: Organization @id should be {org_id}")
            if has_empty(g):
                fail("index.html: JSON-LD contains empty values")
            if not any(n.get("@type") == "WebSite" and n.get("@id") == f"{base}/#website" for n in g):
                fail("index.html: WebSite node missing")
    else:
        fail("index.html missing")

    # sitemap
    sm = root / "sitemap.xml"
    if sm.exists():
        locs = set(re.findall(r"<loc>([^<]+)</loc>", sm.read_text(encoding="utf-8")))
        wanted = {f"{base}/", f"{base}/ai-readiness/", f"{base}/privacy/"} | {url(base, l, s) for l in LANGS for s in SLUGS}
        for w in sorted(wanted - locs):
            fail(f"sitemap.xml: missing {w}")
        stext = sm.read_text(encoding="utf-8")
        for loc in (f"{base}/", f"{base}/ai-readiness/", f"{base}/privacy/"):
            blk = re.search(r"<url>\s*<loc>" + re.escape(loc) + r"</loc>.*?</url>", stext, re.S)
            if blk and "hreflang" in blk.group(0):
                fail(f"sitemap.xml: {loc} must not carry hreflang")
    else:
        fail("sitemap.xml missing")

    # llms files
    llms = root / "llms.txt"
    if llms.exists():
        t = llms.read_text(encoding="utf-8")
        for l in LANGS:
            for s in SLUGS:
                if f"{base}/{l}/{s}.md" not in t:
                    fail(f"llms.txt: missing link to {l}/{s}.md")
    else:
        fail("llms.txt missing")
    full = root / "llms-full.txt"
    if full.exists():
        t = full.read_text(encoding="utf-8")
        for l in LANGS:
            for s in SLUGS:
                md = texts.get(f"{l}/{s}.md")
                if md:
                    h1 = next((x[2:].strip() for x in md.split("\n") if x.startswith("# ")), None)
                    if h1 and f"# {h1}" not in t:
                        fail(f"llms-full.txt: missing H1 of {l}/{s}")
    else:
        fail("llms-full.txt missing")

    # em dash and leftover placeholders in every generated file
    gen = [f"{l}/{s}.{e}" for l in LANGS for s in SLUGS for e in ("html", "md")]
    gen += ["sitemap.xml", "llms.txt", "llms-full.txt", "robots.txt", "vercel.json", ".vercelignore", "content/facts.yml", "content/llms-head.md"]
    gen += [str(p.relative_to(root)) for p in sorted((root / "content").glob("*/*.md"))]
    for rel in gen:
        p = root / rel
        if not p.exists():
            continue
        t = p.read_text(encoding="utf-8")
        if EM_DASH in t:
            fail(f"{rel}: contains an em dash (U+2014)")
        if "{{" in t and not rel.startswith("content/"):
            fail(f"{rel}: contains '{{{{'")

    # index.html marker block has no em dash
    if idx.exists():
        m = LD_MARK.search(idx.read_text(encoding="utf-8"))
        if m and EM_DASH in m.group(1):
            fail("index.html: entity JSON-LD block contains an em dash")

    # vercel.json
    vj = root / "vercel.json"
    if vj.exists():
        try:
            json.loads(vj.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            fail(f"vercel.json invalid JSON: {e}")
    else:
        fail("vercel.json missing")

    # build is current
    if not args.skip_build_check:
        r = subprocess.run(["uv", "run", str(Path(__file__).resolve().parent.parent / "build.py"), "--check", "--root", str(root)],
                           capture_output=True, text=True)
        if r.returncode != 0:
            fail("build.py --check failed: " + (r.stderr or r.stdout).strip().replace("\n", " | "))

    if fails:
        print(f"{len(fails)} check(s) FAILED:")
        for f in fails:
            print(f"  - {f}")
        return 1
    print("all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
