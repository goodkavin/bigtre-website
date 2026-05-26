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

## Deploy

```bash
vercel deploy --prod
```

Or — once this repo is linked to the Vercel project — any push to `main` auto-deploys.

## Domain

- Apex: https://bigtre.business
- WWW: https://www.bigtre.business (canonical)
- DNS: Google Domains / Squarespace, pointing to Vercel (`A @ 216.198.79.1`, `CNAME www cname.vercel-dns.com`)

## Backend (AI Readiness Health Check)

The form at `/ai-readiness/` posts to a Vercel serverless function. The function validates input, verifies Cloudflare Turnstile, scores the responses, sends two emails via Resend (roadmap to prospect, alert to founder), and appends a row to a Google Sheet for lead tracking.

### Local dev

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev                  # boots vercel dev with /api/ functions
```

Then open `http://localhost:3000/ai-readiness/`.

### Tests

```bash
npm test                # one-shot
npm run test:watch      # watch mode
```

### Required environment variables

See `.env.example`. All are required in Vercel for the function to work. The `TURNSTILE_SITE_KEY` is injected to the frontend at runtime via `/api/config.js`.

### How it works

| Step | What happens |
|---|---|
| 1 | User submits the capture modal in `/ai-readiness/` |
| 2 | Frontend POSTs JSON to `/api/health-check-submit` with the answers, name/email/company, consent flag, and Turnstile token |
| 3 | Function validates input shape, verifies the Turnstile token against Cloudflare |
| 4 | Function re-scores server-side (does not trust client-computed band) |
| 5 | Function renders two HTML emails (roadmap, lead-alert) and sends via Resend |
| 6 | Function appends a row to the Google Sheet (failure is logged but non-fatal) |
| 7 | Returns 200 to the frontend, which swaps to the done screen |

### Spec and plan

Design rationale, full questionnaire, and implementation plan live in the `bigtre-hq` repo:
- `docs/superpowers/specs/2026-05-25-ai-readiness-health-check-design.md`
- `docs/superpowers/plans/2026-05-25-ai-readiness-health-check.md`
