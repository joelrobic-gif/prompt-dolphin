# PromptDolphin — Brand Asset Library
## Approved Visual Assets — Cycle 2 Final

**Date:** 2026-05-17
**Generated via:** Krentix bridge → OpenAI gpt-image-1
**Total cycles:** 2 (9 images generated, 6 retained)
**L99 Panel:** Chen, Tveit, Rao, Brandt, Mireles

---

## Cycle 2 Critique Summary

### A-deep-refined — PRIMARY LANDING HERO

**File:** `spike/public/brand/exploration/cycle2-A-deep-refined.jpg`

| Specialist | Verdict |
|-----------|---------|
| Chen | "Conversion machine. Dolphin commands the frame. This is the hero." |
| Brandt | "Passes Pentagram review. Depth, directional motion toward viewer, god-rays — every element earns its place. Ship it." |
| Mireles | "Strongest single image generated. Anthropic acquisition-deck cover material." |
| Tveit | "Established. Trustworthy. Not flashy." |
| Rao | "Palette PERFECT — deep navy ocean, no clashing warmth. Sample directly from this." |

**Status:** ✅ SHIP as landing hero.

---

### E-cool-graded — SUCCESS STATE / POST-ENGINEER REVEAL

**File:** `spike/public/brand/exploration/cycle2-E-cool-graded.jpg`

| Specialist | Verdict |
|-----------|---------|
| Chen | "Energy preserved, warm grade gone. Twilight blue works with palette." |
| Brandt | "Mood-shift hero. The moment the prompt is generated — this leap appears." |
| Mireles | "Pairs with A. A is contemplative depth. E is sharp emergence." |
| Tveit | "Apple-keynote register, now cool palette." |
| Rao | "Twilight blue compatible with deep-navy system." |

**Status:** ✅ KEEP as secondary/success-state asset.

---

### F-pod-swimming — `/for-teams` HERO

**File:** `spike/public/brand/exploration/cycle2-F-pod-swimming.jpg`

| Specialist | Verdict |
|-----------|---------|
| Chen | "Three dolphins = team / community / multiple users. Different narrative beat." |
| Brandt | "Reads as social intelligence or pod of users — perfect for /for-teams page." |
| Mireles | "Says: 'this is how you build a movement, not just a tool.' Corporate adoption pitch." |
| Tveit | "Neutral — works either users or trust narrative." |
| Rao | "Palette aligned. Use as-is." |

**Status:** ✅ KEEP as `/for-teams` page hero.

---

## Final Brand Asset Library

| Role | File | Treatment | Notes |
|------|------|-----------|-------|
| Landing hero | `cycle2-A-deep-refined.jpg` | Full-bleed, no overlay | Primary visit experience |
| Success state | `cycle2-E-cool-graded.jpg` | 800px max width, cropped | Shown after prompt generation |
| `/for-teams` hero | `cycle2-F-pod-swimming.jpg` | Full-bleed | Corporate adoption page |
| `/about` hero | `cycle1-B-painterly-stripepress.jpg` | Full-bleed, copper accent visible | Manifesto / brand story |
| Favicon / OG / footer mark | `cycle1-C-minimalist-vector.jpg` | Cropped tight to dolphin silhouette | All identity marks |
| Section dividers / textures | `cycle1-D-abstract-conceptual.jpg` | 30% opacity overlay, full-bleed strip | /trust dividers, /manifesto chapter breaks |

---

## Rejected Assets (do not use in production)

| File | Reason |
|------|--------|
| `cycle1-A-editorial-photo.jpg` | Superseded by cycle2-A-deep-refined (dolphin too small/centered) |
| `cycle1-E-bbcearth-documentary.jpg` | Superseded by cycle2-E-cool-graded (golden hour clashed with palette) |

---

## Color System (extracted from cycle2-A-deep-refined)

Sampled from the approved landing hero:

| Token | Hex | Source in image |
|-------|-----|-----------------|
| `--ocean-deep` | #0A1F35 | Deepest water, lower-left and right corners |
| `--ocean-mid` | #143352 | Mid-depth water, dominant area |
| `--ocean-surface` | #2D5780 | Lighter water near surface, top of frame |
| `--ocean-caustic` | #6FA0CC | God-ray light columns |
| `--dolphin-shadow` | #1F3247 | Dolphin's shadow side |
| `--dolphin-light` | #88A4BD | Dolphin's lit dorsal ridge |
| `--spray-white` | #F5F9FC | Sunlight at surface (top edge) |
| `--copper-bronze` | #A67C3D | Retained from Robic Direct continuity |

The full palette appears naturally in the hero photograph except for the
copper accent, which is the single intentional non-ocean color preserved
from the L99 Format Playbook tradition.

---

## File Locations and Production Naming

All exploration files are in: `spike/public/brand/exploration/`

For production use, the final approved assets should be copied to:
- `spike/public/brand/dolphin-hero.jpg` (= cycle2-A-deep-refined)
- `spike/public/brand/dolphin-leap.jpg` (= cycle2-E-cool-graded)
- `spike/public/brand/dolphin-pod.jpg` (= cycle2-F-pod-swimming)
- `spike/public/brand/dolphin-painterly.jpg` (= cycle1-B-painterly-stripepress)
- `spike/public/brand/dolphin-mark.jpg` (= cycle1-C-minimalist-vector, tight crop)
- `spike/public/brand/water-texture.jpg` (= cycle1-D-abstract-conceptual)

Each should be optimized for web:
- Hero JPEGs: max 200KB at 1920px wide via progressive encoding
- Favicon: 32×32 ICO + 512×512 PNG generated from cycle1-C

---

## Licensing & Provenance

All images generated 2026-05-17 by Joel Robic via the Krentix bridge calling
OpenAI's `gpt-image-1` model. Per OpenAI's terms of service, images generated
through the API are owned by the user (Joel Robic / Robic Direct Inc.).

**License status:** Owned. Commercial use approved. Acquisition diligence ready.

**Prompts and seeds:** Documented in `scripts/gen-hero-explorations.mjs` and
`scripts/gen-hero-cycle2.mjs`. Reproducible.

---

## Krentix Attribution Loop

This entire brand library was produced by Krentix's image generation router.
Every asset that ships on promptdolphin.com is downstream of Krentix's
multi-provider image pipeline. The footer attribution "Prompt intelligence
powered by Krentix → krentix.com" closes the traffic loop: PromptDolphin's
millions of users see the dolphin hero (generated by Krentix), use the
prompt engineering (architected against Krentix-style verification), and
click through to Krentix.

PromptDolphin as a Krentix demand-generation surface. The brand itself is
the proof.

---

*Robic Direct Inc. — Joel Robic, Founder*
