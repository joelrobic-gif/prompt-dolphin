# PromptDolphin — Brand Exploration Cycle 1
## L99 Marketing Panel Critique

**Date:** 2026-05-17
**Provider:** OpenAI gpt-image-1 (via Krentix bridge `/api/image/generate`)
**Resolution:** 1024×1024 (DALL-E rejected 1792×1024 for these prompts)
**Outputs:** `spike/public/brand/exploration/cycle1-*.jpg`

The panel: Dr. Amara Chen (product shipper), Marcus Tveit (privacy engineer),
Priya Rao (staff architect), Lukas Brandt (design director, Pentagram-adjacent),
Jordan Mireles (founder, two YC exits).

---

## Style A — Editorial Photo (Cinematic Underwater)

**Verdict:** ✅ SHORTLIST (primary hero candidate)

| Specialist | Note |
|-----------|------|
| Brandt | "Most Stripe Press / Vercel-grade option. Quiet authority. Sunlight rays carry the depth metaphor without explanation." |
| Chen | "Sells depth instantly. But the dolphin is small/centered — risks reading as generic stock. Needs to be larger or more directional." |
| Mireles | "Acquisition-grade. Anthropic could share this in a deck without embarrassment. Strongest single asset of the five." |
| Tveit | "Established, not startup-y. Trust signal positive." |
| Rao | "Color palette aligns with #1F2F4A deep navy. Can sample from this without breaking the design system." |

**Refinements for Cycle 2:** Larger dolphin in frame. More directional motion
(curving toward viewer). Stronger sunlight columns. Widescreen composition
if DALL-E will accept 1792×1024 for this prompt.

---

## Style B — Painterly Stripe Press

**Verdict:** 🟡 REPURPOSE (not for landing hero)

| Specialist | Note |
|-----------|------|
| Brandt | "Editorial gravity. Patrick Collison's tweet-feed cover image. Deeply on-brand for L99 Playbook lineage." |
| Chen | "Mood strong but it's a painting. Risks 'literary' over 'product.' Where does this sit above a working app?" |
| Mireles | "Distinct, hard to copy. But too literary for new users who need to immediately understand this is a tool." |
| Tveit | "Pleasant. Doesn't actively signal trust but doesn't undermine." |
| Rao | "Copper accent fits the retained #A67C3D. Palette compatibility is excellent." |

**Where it belongs:** `/about` page hero, `/manifesto` section opener, blog
post header image. Not the landing-page hero.

---

## Style C — Minimalist Vector

**Verdict:** ❌ REJECT as hero. ✅ ACCEPT as derivative assets.

| Specialist | Note |
|-----------|------|
| Brandt | "Looks like a logo, not a hero. Too literal. Reads as 'product mascot' not 'brand mood.' Series A startup register, not acquisition target." |
| Chen | "Could work for favicon and app icon. Not for hero. Too small-feeling." |
| Mireles | "If this were Anthropic's landing page, it would feel like a kids' product. Wrong register." |
| Tveit | "Reduces trust marginally. Feels less serious." |
| Rao | "Useful as derivative: favicon, OG card icon, footer mark." |

**Where it belongs:** `favicon.ico`, `apple-touch-icon.png`, footer brand mark.
Crop tight to the dolphin silhouette.

---

## Style D — Abstract Conceptual

**Verdict:** 🟡 REPURPOSE as section divider / texture

| Specialist | Note |
|-----------|------|
| Brandt | "Ambitious. Reads more like generative AI marketing than ocean. Without the dolphin, loses metaphor specificity." |
| Chen | "New users won't recognize this as PromptDolphin. Brand recall is zero." |
| Mireles | "Sophisticated but doesn't sell. Not for landing hero. Could be a section divider on /manifesto." |
| Tveit | "Neutral." |
| Rao | "Useful as section background or texture, not primary." |

**Where it belongs:** `/trust` page section dividers, `/manifesto` chapter
breaks, background texture for the goldfish-memory panel. Low opacity overlay.

---

## Style E — BBC Earth Documentary (Dolphin Leap)

**Verdict:** ✅ SHORTLIST (secondary hero candidate)

| Specialist | Note |
|-----------|------|
| Brandt | "Energetic and joyful. Different mood from A — A is contemplative depth, E is exuberant emergence. Both valid for different positions." |
| Chen | "Sells immediately. Action. Energy. Sells 'instant' viscerally — dolphin BREAKING THROUGH, like the prompt emerging fast. Conversion-strong." |
| Mireles | "Maximum brand recall. People remember the leaping dolphin. Acquisition target sees: 'this is the brand.'" |
| Tveit | "Apple keynote register. Feels established." |
| Rao | "Sunset/golden hour clashes with the navy system. Needs color-grading toward palette." |

**Refinements for Cycle 2:** Color-grade toward deep navy palette (no golden
hour). Keep the leap energy. Try side angle at peak of leap rather than
breaching motion.

---

## Panel Conclusion

Two valid hero directions emerged from Cycle 1. Each serves a different
narrative beat:

- **A — Contemplative depth.** Where the model's intelligence lives.
  Quiet, established, acquisition-grade. The landing-page hero for visitors
  who arrived asking "what is this?"

- **E — Sharp emergence.** Instant prompt, fast output, dolphin breaking
  through. Conversion-grade. Better for the secondary hero or the moment
  after the user clicks "Engineer this prompt."

Three styles repurposed:
- B → `/about` hero
- C → favicon + OG card + footer mark
- D → section dividers + `/trust` textures

---

## Cycle 2 Plan

Generate four new prompts:

1. **A-deep** — Style A refined: dolphin larger and more directional,
   stronger sunlight columns, more dramatic depth.
2. **A-wide** — Style A composition optimized for widescreen hero band
   (test 1792×1024 if DALL-E accepts).
3. **E-cool** — Style E refined to cool color palette (no golden hour).
4. **F-pod** — New direction: three dolphins swimming as a pod. Tests
   whether "social intelligence" reads as a different brand mood
   (consensus / verification — relevant given Krentix's verification
   positioning).

---

*Robic Direct Inc. — Joel Robic, Founder*
