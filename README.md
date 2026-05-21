# Big Tre — bigtre.business

Landing site for [Big Tre](https://bigtre.business), an AI-Fused Company for growing Thai SMEs.

Single static page. No build step. Deployed to Vercel; serves directly from `index.html`.

## Stack

- Plain HTML / CSS / JS, no framework
- GSAP + ScrollTrigger (CDN) for entrance animations and scroll-triggered reveals
- Bricolage Grotesque / Geist / Instrument Serif via Google Fonts
- Hosted on Vercel (free tier), DNS via Google Domains / Squarespace

## Files

| File | Purpose |
|---|---|
| `index.html` | The site. Self-contained: inline CSS, inline JS, JSON-LD structured data, sr-only Thai content. |
| `favicon.svg` | Tree-icon favicon (green on off-white) |
| `robots.txt` | Allows all crawlers including GPTBot / ClaudeBot / PerplexityBot |
| `sitemap.xml` | Single-URL sitemap with hreflang annotations |
| `archive/` | Previous React/Vite landing site, kept for reference |

## Local preview

```bash
python3 -m http.server 8765
open http://localhost:8765/
```

## Workflow

Trunk-based. `main` is always shippable, and merging to `main` is what deploys to production.

**Website changes** (anything that affects the live site — `index.html`, `favicon.svg`, `robots.txt`, `sitemap.xml`):

1. Branch off `main`: `git checkout -b <topic>`
2. Edit, commit, push.
3. Open a PR against `main`. Vercel auto-builds a preview URL — verify there.
4. **Squash-merge** to `main` (this auto-deploys to production).
5. Delete the branch.

**Non-website edits** (README, CLAUDE.md, .gitignore, docs) — commit directly to `main`. No preview needed.

## Domain

- Apex: https://bigtre.business
- WWW: https://www.bigtre.business (canonical)
- DNS: Google Domains / Squarespace, pointing to Vercel (`A @ 216.198.79.1`, `CNAME www cname.vercel-dns.com`)
