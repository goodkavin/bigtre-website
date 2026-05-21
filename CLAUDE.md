# CLAUDE.md

Conventions that aren't visible from the source. Keep this file lean — only the things a fresh agent would otherwise get wrong.

## Project shape

- Single static `index.html` at the root. **No build step.** Don't introduce one — no Vite, no bundler, no React. Inline CSS and inline JS are intentional.
- `archive/` holds the previous React/Vite site. **Reference only — do not edit, do not delete.**

## Deploy

- Hosted on Vercel project `bigtre-website` (account `goodkavin-2918s-projects`).
- GitHub repo: `bigtre-hq/bigtre-website`. Vercel project is **not yet linked to GitHub for auto-deploy** — shipping requires `vercel deploy --prod` from the working dir until that's wired up.
- Local preview: `python3 -m http.server 8765` (no other port — keep this convention).

## Domain & DNS

- Apex `bigtre.business` 308-redirects to **www** (canonical). Footer copy and `og:url` reflect this.
- DNS records live in **Google Domains / Squarespace**, not in Vercel. Don't suggest switching nameservers to Vercel — it would break the user's email.

## Style rules (user-enforced)

- **Zero em-dashes (`—`) anywhere.** Not in copy, not in headings, not in meta, not in comments. Use periods, commas, colons, en-dashes (`–`) for ranges, or `·` / `/` for separators. The user removes them by hand if they slip in.
- **No AI tell-tale prose patterns**: avoid `"X — not just Y."`, `"Built like the best — priced like home."`, parenthetical em-dash breaks. Three-part rhetorical lists (`No deck, no pitch, no commitment.`) are kept on purpose — don't flatten those.
- **Phone number display format: `+66 82-925-6365`** (with the space after the country code). The `tel:` href stays `+66829256365`.
- **Brand mark is the green `↟` tree glyph**, not a period. Used in `Big Tre↟` wordmark (nav and footer) and in `favicon.svg`. Accent color `#0E5C3B` (forest green), not the original terracotta.

## Motion

- GSAP + ScrollTrigger only. **Don't add Lenis or any other JS smooth-scroll library** — Lenis was tried and removed (it broke the hero reveal and felt resistant on scroll).
- Smoothness comes from native `html { scroll-behavior: smooth }` plus CSS `scroll-snap-type: y proximity` on `html` (desktop + reduced-motion-respecting).
- Hero h1 uses a plain GSAP `.from()` fade-up. A previous line-mask approach (`.reveal-line` / `.reveal-inner` + `yPercent: 110`) was brittle and hid the title — don't reintroduce it.

## SEO / Thai content

- Thai content in the `section.sr-only[lang="th"]` block after `</footer>` is **intentional and load-bearing** — it's how Thai queries and LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, all explicitly allowed in `robots.txt`) find this site. Don't "clean up" or remove it; it's not dead code.
- Three JSON-LD blocks (`ProfessionalService`, `FAQPage`, `Organization`) in `<head>` are the structured-data surface. Edit content there in lockstep with the visible copy.

## Contact

- `hello@bigtre.business` · `+66 82-925-6365` · Bangkok
- Currently booking Q3 2026 — update the "Now booking" line and CTA tag when this changes.
