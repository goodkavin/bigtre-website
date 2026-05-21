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

- Vercel is Git-linked to `goodkavin/bigtre-website`, which is **public**. Any push or merge to `main` auto-deploys to production, regardless of commit author. Public-repo status is what makes external contributor PRs (Polo / `Bigtrebusiness`) deploy on Hobby. Do not flip the repo back to private without upgrading to Vercel Pro first, or external-author commits will silently 401 and production will stall on the previous build.
- DNS lives in Google Domains / Squarespace. Don't suggest switching nameservers to Vercel, it would break the user's email.
- Strategic/positioning docs live in `../bigtre-hq/`, not here. Keep this repo to website code and reference material that's safe to be public.

## Update together

- Booking window: hero meta (`Now booking · Q3 2026`) and CTA tag (`Currently booking for Q3 2026 · N slots open`) must stay in sync. Update both when the window changes.
