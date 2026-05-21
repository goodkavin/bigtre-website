# CLAUDE.md

## Style

- **Zero em-dashes (`—`) anywhere** — copy, headings, meta, comments. Use periods, commas, colons, en-dashes for ranges, or `·` / `/` for separators.
- Avoid AI tell-tale prose patterns (`"X — not just Y"`, `"Built like the best — priced like home"`). Three-part rhetorical lists are kept on purpose — don't flatten those.

## Don't reintroduce (tried, broke)

- **No Lenis or any JS smooth-scroll lib.** It broke the hero reveal and felt resistant on scroll. Stick with native `scroll-behavior` + CSS `scroll-snap`.
- **No line-mask hero reveal** (the `.reveal-line` / `.reveal-inner` + `yPercent: 110` pattern). It hid the title.

## Don't touch

- `archive/` is the previous React/Vite site, kept for reference.
- The `section.sr-only[lang="th"]` block after `</footer>` is the Thai SEO/AEO surface for LLM crawlers — not dead code.

## Workflow gotcha

- Vercel project is **not yet linked to GitHub** — pushing to `main` does not auto-deploy. Ship with `vercel deploy --prod`.
- DNS lives in Google Domains / Squarespace. Don't suggest switching nameservers to Vercel — it would break the user's email.

## Update together

- Booking window: hero meta (`Now booking · Q3 2026`) and CTA tag (`Currently booking for Q3 2026 · N slots open`) must stay in sync. Update both when the window changes.
