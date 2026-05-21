---
title: "Out of the Frame" pivot graphic — Problem section
status: active
last_updated: 2026-05-21
---

# "Out of the Frame" pivot graphic

Promote the line `→ To paint the picture, you have to get out of the frame.` from a small mono caption under the existing orbital diagram to an editorial section pivot, paired with a new "after" diagram that contrasts the existing one.

Reference: bigtre sales deck slides 5 → 6.

## Why

The current diagram (slide-5 metaphor) shows the OWNER at the center as the company's context. The "paint the picture" line is the pivot to the slide-6 metaphor: owner steps *outside* the frame, a CONTEXT layer takes the center, AI sits outside receiving context.

Today that pivot lands as 11px mono. It deserves the weight of a section transition.

## Scope

- `index.html` only (single-file static site).
- Problem section (`#problem`, lines ~1031–1117).

## Structure changes

1. **Existing two-column problem grid stays as-is.** Copy on the left, orbital "before" diagram on the right. Do not touch the existing SVG.
2. **Remove** the in-diagram caption `<div style="...">→ To paint the picture...</div>` from inside `.diagram-wrap`.
3. **Add a new full-width pivot row** below the existing `.problem` grid, still inside `<section id="problem">`. It contains:
   - A large serif-italic statement: "To paint the picture, you have to get out of the frame."
   - A delicate green arrow stroke (decorative) between the line and the diagram.
   - The new "after" SVG diagram (full width, centered, max ~900px).

## New "after" SVG diagram

Same visual vocabulary as the existing one: cream paper, dark ink pill nodes, green accent, dashed outer ring as the "Business" frame, mono labels. Wider viewBox to fit elements outside the ring.

**Layout:**
- ViewBox: `-400 -240 800 480` (5:3).
- Outer dashed ring at `r=200` (the "Business" frame).
- Inner solid ring at `r=160`.
- 8 nodes on a circle at `R=140`, same labels and same angles as the existing diagram (Inventory, Analytics, Online, Accounting, Marketing, Logistics, Offline, Procurement).
- Same pill styling (rect with `rx=11`, cream fill, ink stroke, mono label) as the existing nodes.
- Curved arrows between adjacent nodes forming a **clockwise cycle** — clean flow, not converging spokes.
- **Center:** a green CONTEXT pill (≈ 96×34, accent green fill, cream text, mono uppercase).
- **Outside the ring (top-right, ≈ x=290, y=-150):** a small Owner pill with an arrow into the center, labeled `context →` in mono.
- **Outside the ring (right, ≈ x=320, y=60):** a large green "AI" wordmark (display font, ≈ 56px), with an arrow into the center labeled `← context`.
- **"Business" label** in the bottom-left of the frame area, mono uppercase, matching the existing diagram's quiet labeling.

## Animation

- **Scroll-triggered entry** (same pattern as existing diagram): nodes pop into place clockwise, cycle arrows draw in sequentially, then the Owner→Context and Context→AI arrows fade in.
- **Continuous heartbeat after entry:** the two outside arrows pulse stroke-opacity on a ~2s sinusoid — slow, editorial, not distracting. Implemented as a single `requestAnimationFrame` loop, matching the existing AI orbit pattern.
- All new elements use existing CSS variables (`--accent`, `--ink`, `--paper`, `--mono`, `--display`).

## CSS additions

- New rule for `.pivot` row: full-width, vertical flex, generous top margin, centered text.
- New rule for `.pivot-line`: serif-italic, responsive font-size (~clamp(28px, 3vw, 44px)), balanced wrap, accent color for the italic piece (matches `.serif-it` treatment elsewhere).
- New rule for `.pivot-diagram`: max-width ~900px, full width on mobile, aspect-ratio 5/3.

## What is intentionally NOT done

- No change to the existing orbital SVG.
- No literal morph animation between before/after diagrams.
- No new colors, fonts, or libraries.
- No JS framework — vanilla DOM/SVG/RAF/GSAP (already loaded for the existing diagram).

## Acceptance

- Section reads top-to-bottom as: existing-diagram → pivot line → new diagram.
- New diagram visibly contrasts with the old: owner outside vs center, clean cycle vs spokes.
- Animations feel of-a-piece with the existing diagram.
- No regressions to existing animations or layout on desktop / mobile.
