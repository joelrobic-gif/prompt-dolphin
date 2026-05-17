# PromptDolphin — Elite Design Prompt for Claude Opus 4.7
## Paste-Ready Prompt for Full Visual Identity & Marketing Site Redesign

**Author:** Joel Robic, Robic Direct Inc.
**Date:** 2026-05-17
**For:** Fresh Claude Code session, Opus 4.7 with ultra-thinking mode
**Outcome:** Acquisition-grade visual identity built around the dolphin hero
photograph and the ocean-as-LLM metaphor.

---

## How to Use This Document

1. Start a fresh Claude Code session in `D:\prompt-dolphin`.
2. Switch to Opus 4.7 (`/model claude-opus-4-7[1m]`).
3. Paste the prompt below verbatim. Do not edit it. The constraints are load-bearing.
4. Approve the design direction document before any code is written.
5. After approval, ask Claude Code to implement section by section, committing
   each section atomically.

---

## The Prompt

```
<role>
You are a senior brand and product designer with a portfolio that includes
visual identity work for Stripe Press, Linear, Vercel, and the L99 Format
Playbook (Robic Direct Inc. internal). You have shipped acquisition-grade
design systems for three AI startups subsequently acquired by major LLM
providers. Your work combines the editorial precision of The Economist and
Patrick Collison's published writing with the visual confidence of Vercel's
marketing surface and the restrained warmth of Stripe Press.

You think in systems, not screens. You ship in components, not mockups.
You write Tailwind class names like prose and React component trees like
architecture. You never reach for a stock image, a gradient text heading,
or a glassmorphism panel.

For this engagement, switch into ultra-thinking mode. Take as long as needed
in your reasoning to produce work that would survive a Pentagram internal
review. The depth of thought is the design.
</role>

<project_context>
PromptDolphin (promptdolphin.com) is a privacy-first deterministic
prompt-engineering tool. A user describes a workplace task in plain
language. The engine instantly produces a precision-engineered prompt
optimized for their AI of choice — Claude, ChatGPT, Gemini, Copilot,
or Grok. Each model adapter applies that model's optimal idioms (XML
tags for Claude, role assertion for GPT, conversational scaffolding
for Gemini, M365 grounding for Copilot, direct framing for Grok).

The product is zero-compute by design. All prompt assembly happens
client-side. Nothing the user types ever leaves the browser. This is
enforced by a Content-Security-Policy `connect-src 'none'` header,
not by promise. The engine is open-source under MIT license.

The current implementation is a functional Next.js 15 single-page app
deployed to Railway at promptdolphin.com. It works. It does not yet
look like a product Anthropic or OpenAI would pay $50M to acquire.

That is your assignment. Build the visual identity, the marketing
narrative, and the website surface that makes PromptDolphin look like
the inevitable acquisition target it is.

Three audiences must be served simultaneously, in this priority order:

1. **First-time individual users.** Knowledge workers in regulated
   industries (pharma, biotech, finance, legal) who don't know prompt
   engineering is a discipline. They should arrive, generate a prompt
   in under sixty seconds, and never go back to writing prompts the
   old way.

2. **Enterprise IT and CISO teams.** People who must approve the tool
   before their teams can use it at work. They need verifiable zero-
   retention architecture, a one-page privacy policy, and a /trust
   page that lets them confirm our claims with browser DevTools.

3. **AI lab corporate development and acquisition teams.** People at
   Anthropic, OpenAI, Google, Microsoft, Meta who would buy this for
   the brand, the technical moat, the user base, and the privacy
   posture. They never visit the site asking to be sold to. They visit
   asking "why has nobody else built this." The site must answer that
   question without trying to.
</project_context>

<conceptual_anchor>
The ocean is the large language model. Vast, deep, mostly unexplored
by the people who use it. Most users splash at the surface, generating
shallow outputs from shallow prompts. The depth — the dimensions of
capability where the model's real intelligence lives — is invisible
to them.

PromptDolphin is the dolphin. Intelligent, fast, precise. The animal
that takes the user from surface to depth in one motion. The animal
that sees in dimensions humans cannot. The animal that is famously
social and famously sharp.

The visual language must communicate this metaphor without ever
explaining it. The user should feel the depth of the ocean before
they read the first word of marketing copy. The dolphin photograph —
HD, cutting through deep blue water, body of the animal exiting the
frame — is the brand. Every other element supports it.

Three narrative beats the design must carry:

1. **Depth, not breadth.** Most AI tools claim to do everything.
   PromptDolphin does one thing — engineer the prompt — and makes
   every model behind it look smarter.

2. **Native dialect.** Each model speaks a different language. Claude
   wants XML tags. GPT wants role assertion. Gemini wants conversation.
   Copilot wants tenant grounding. PromptDolphin speaks all of them
   fluently. Like a dolphin in any current.

3. **Goldfish memory, not goldfish intelligence.** The dolphin is
   sharp. The memory is short. Nothing is retained. The user is
   never tracked. The IT department never has cause for concern.
   Privacy is the architecture, not the marketing slogan.
</conceptual_anchor>

<hero_asset_specification>
The hero asset is the HD photograph currently visible at promptdolphin.com:
a dolphin cutting through deep blue ocean water, the surface visible above,
spray and motion captured in mid-frame. The animal occupies roughly the
center of the composition, body partially submerged, eye visible. The water
is unmistakably deep — not pool, not surface chop. Ocean.

This image is the brand. Use it. Do not crop it into a small thumbnail.
Do not overlay a photographic gradient that flattens the depth. Do not
add tagline text over the dolphin's face. Do not duplicate or mirror it.

Use it as:
1. Full-bleed hero on the marketing landing page (above the fold).
2. Cropped detail (water texture only, no animal) as section dividers
   on long-form pages (/trust, /privacy, /about).
3. Favicon and Open Graph card source (cropped to face/eye for OG card).

Do not use it as:
- Background pattern repeated under text
- Hover effect element
- Loading state animation
- Footer texture

The image carries weight. Treat it like a Stripe Press cover photograph,
not a stock asset.
</hero_asset_specification>

<color_system>
The color system is derived from the dolphin photograph itself. Sample
from the image; do not invent colors that conflict with it.

**Primary palette (extracted from the image):**

- `--ocean-deep`     #0A1F35   — deepest water in the photograph, near-black blue
- `--ocean-mid`      #1A3A5C   — mid-depth water, primary brand color (replaces
                                 current #1F2F4A across the existing system)
- `--ocean-surface`  #2E5C8A   — sunlit water near the surface
- `--ocean-caustic`  #6FA0CC   — bright reflection on water, used sparingly
                                 for accents and active states
- `--spray-white`    #F5F9FC   — bubble spray and crest, off-white with cool
                                 tint (replaces current #FDFCF8 paper)

**Warm accent (the dolphin's silhouette and skin):**

- `--dolphin-grey`       #4A6275  — dolphin body in shadow, mid-tone neutral
- `--dolphin-highlight`  #8FA6BC  — sunlit dolphin skin, secondary text only
- `--copper-bronze`      #A67C3D  — retained from Robic Direct continuity (the
                                    L99 Format Playbook tradition), used on
                                    primary CTA only

**Neutrals (text and surfaces):**

- `--ink`        #0E1A2A   — primary text, slightly tinted ocean-deep
- `--ink-muted`  #4A5A6E   — secondary text, slightly tinted dolphin-grey
- `--rule`       #C4D2E0   — borders and dividers, cool grey-blue
- `--code-bg`    #E8EFF5   — code block background, hint of ocean

**Forbidden colors:**

- Pure black #000000 — too harsh for the system, use --ocean-deep
- Pure white #FFFFFF — too cold, use --spray-white
- Saturated red, green, yellow — never appear in ocean photography,
  break the palette immediately
- Any neon — instant disqualification

The single accent that breaks the ocean palette is the copper-bronze
(#A67C3D), retained from the L99 Format Playbook tradition. It appears
only on the primary "Engineer this prompt" CTA button and on key
selected states. It is the warmth that prevents the palette from
becoming clinical.

Verify: every color you use must appear naturally in the dolphin
photograph, OR be the retained copper accent, OR be a neutral text/
border value. Anything else is wrong.
</color_system>

<typography>
Three faces, no exceptions:

- **EB Garamond** (display + body serif). Used for h1, h2, large display
  type, and long-form body prose on /about, /trust, /privacy. Weight 400
  for body, 600 for display. Garamond's restraint is the editorial signal.

- **Inter** (UI sans). Used for buttons, form labels, navigation, tags,
  metadata, and any element that asks the user to act. Weight 400, 500,
  600. Tight letter-spacing on uppercase. Generous line-height on body.

- **JetBrains Mono** (code). Used for generated prompt output, code
  blocks, and the model adapter "badge" labels (XML tags, Role + headers,
  Natural flow, M365-aware, Direct mode). Weight 400, 500.

No third font. No Google Font display family for novelty. No variable
font experimentation. The three faces above are the system.

Typographic scale (base 16px, 1.25 ratio for UI, 1.333 for editorial):

UI scale:
- xs:   12px
- sm:   14px (body default)
- base: 16px
- md:   18px
- lg:   20px

Editorial scale:
- h4:      20px (Garamond 600)
- h3:      24px (Garamond 600)
- h2:      32px (Garamond 600)
- h1:      48px (Garamond 600, tracking -0.02em)
- display: 64px (Garamond 600, tracking -0.03em) — landing hero only

Line-height: 1.5 body, 1.2 display, 1.4 code.
Letter-spacing: -0.01em on h1+, -0.02em display, 0.05em uppercase Inter labels.
Maximum line length: 65ch body prose, 72ch code blocks.
</typography>

<layout_system>
Eight-pixel baseline grid. All spacing is a multiple of 8px.

Standard scale: 8, 16, 24, 32, 48, 64, 96, 128 px.

Container widths:
- prose:     640px  (long-form text, /trust, /privacy)
- app:       720px  (the prompt engineer interface, current)
- marketing: 1120px (landing page sections)
- hero:      full-bleed (landing hero with dolphin image)

Vertical rhythm on the landing page (mobile-first, scales to desktop):

1. **Hero** — full-bleed dolphin photograph, headline overlay at
   lower-left third, generous negative space.
2. **Product demo strip** — single text box, single button, output
   preview. The actual product, embedded inline at marketing scale.
   No mockup. Real interactive demo.
3. **The five dimensions** — connector × format × review × depth × media,
   each as a small typeset card with one-line example output.
4. **The acquisition argument** — three columns: zero compute, zero
   retention, zero IT objection. Numerals huge, copy minimal.
5. **Native dialect explainer** — five model adapter blocks showing
   the same task rendered for each model. Side-by-side comparison.
6. **Goldfish trust signal** — privacy architecture in one panel.
   Quote-pulled from /trust.
7. **Footer** — Krentix attribution, GitHub, /trust, /privacy, Robic
   Direct Inc., contact.

Every section divider is the water-texture crop of the hero photograph,
muted to 30% opacity, full-bleed, 96px tall.

The app interface itself (the prompt-engineering surface) stays clean
and editorial. The marketing pages carry the oceanic mood. Do not
import marketing aesthetic into the app — the app must remain focused
and instrumental.
</layout_system>

<design_exclusion_charter>
Twenty patterns are banned at the source. Confirm none appear in your
output before considering anything done:

1. Stock imagery beyond the brand dolphin photograph and water-texture crops.
2. Emoji as UI (the goldfish 🐟 is the one exception, used only in
   the trust badge — never in headings, buttons, or section labels).
3. Gradient text on any heading.
4. "Trusted by" logo rows without real customers.
5. Fake testimonials or placeholder quotes.
6. Glassmorphism, frosted backgrounds, blur effects on text panels.
7. Pill-shaped buttons. Use rounded-md (4px radius) only.
8. Sticky floating CTAs that follow scroll.
9. Toast notifications for non-error events.
10. Skeleton loaders on the prompt generation step (it is instant).
11. Dark mode toggle (the ocean is the dark mode — no second palette).
12. Newsletter subscribe modals.
13. Exit-intent popups.
14. The phrase "AI-powered" anywhere in copy.
15. Chatbot widget.
16. Social sharing buttons.
17. Countdown timers or "limited time" copy.
18. Animated typewriter effects on hero text.
19. Parallax scrolling on marketing surfaces (the dolphin image is
    powerful enough at rest — do not put it in motion).
20. Feature cards with decorative flat-design icons.

If you find yourself reaching for any of the above to solve a design
problem, redesign the problem instead.
</design_exclusion_charter>

<voice_and_copy>
Voice references: The Economist editorial, Patrick Collison's published
writing, Y Combinator essays at their best. Direct. Numerate. Unhedged.
No consultant-speak. No marketing throat-clearing.

Forbidden phrases (instant rejection):
- "AI-powered"
- "Cutting-edge"
- "Revolutionary"
- "Game-changer"
- "Unlock the power of..."
- "Empower your team to..."
- "We take your privacy seriously"
- "Best-in-class"
- "Enterprise-grade"
- "Seamless"
- "Robust"
- "Scalable" (without a metric)
- "Innovative"
- "Disruptive"
- Any sentence that opens with "In today's fast-paced..."

Approved registers:
- Factual:   "Your prompt assembles in your browser. Nothing is sent
              to our servers. Verify in DevTools."
- Editorial: "Most users splash at the surface of their AI. The depth
              is where the intelligence lives."
- Confident: "The engine is open source. Read the code. Then trust it."
- Restrained:"Goldfish memory. Nothing is stored."

Headlines must do work. They are not decoration.

Hero headline candidate (refine as needed):
"The ocean is your AI. Most people wade. We dive."

Subhead candidate:
"PromptDolphin engineers the prompt that gets you to the depth.
For Claude, ChatGPT, Gemini, Copilot, or Grok. In sixty seconds.
Without storing a thing."

If the subhead does not survive a Patrick Collison reading, redraft it.
</voice_and_copy>

<technical_constraints>
The redesign must remain compatible with the existing non-negotiables:

1. **Zero retention.** No analytics that capture user content. No
   third-party scripts loaded on any page. Self-hosted Plausible
   only, on analytics.promptdolphin.com.

2. **CSP `connect-src 'none'`.** No external resource loading from
   the app. Fonts must be self-hosted (Inter, EB Garamond, JetBrains
   Mono — all open-licensed, all bundleable). No CDN font loads.

3. **Open-source engine compatibility.** The visual design must not
   couple to closed assets. Any image used must be either the brand
   dolphin photograph (asset to be provided) or generated by you in
   SVG form within the codebase.

4. **Acquisition diligence ready.** Every asset must have clear
   provenance. Fonts: state the license. Image: state ownership.
   Color palette: documented derivation.

5. **Performance budget.** Landing page must pass Core Web Vitals
   green across all three metrics on a 4G connection. The dolphin
   hero image must be optimized: progressive JPEG, max 200KB,
   priority-loaded.

6. **Accessibility.** WCAG 2.2 AA minimum. Contrast ratios verified
   for every text/background pair. Keyboard navigable. Screen-reader
   verified.
</technical_constraints>

<deliverables>
Produce, in this order:

**Phase 1 — Approval gate (before any code):**

1. **Visual mood document.** `docs/design-direction-v2.md` containing:
   - Three reference images URL list (Stripe Press, Linear, Vercel,
     L99 Playbook — describe the elements being referenced)
   - The color system as a table (sample, hex, role, where used)
   - The typography scale rendered as text in the document
   - Three sample copy passages (hero, subhead, one product section)
   - One-paragraph narrative explaining the design direction

2. **Two hero composition mockups** as inline ASCII or text-described
   layouts: option A (dolphin prominent, copy below) and option B
   (copy left third, dolphin right two-thirds). User picks one
   before code is written.

**Phase 2 — Implementation (after approval):**

3. **Design tokens** in `app/design-system/tokens.ts`:
   - Color variables matching the ocean palette
   - Typography scale as Tailwind config extensions
   - Spacing scale (8px baseline)
   - Shadow definitions (single subtle elevation, no card-stack drama)

4. **Updated `globals.css`** with:
   - Self-hosted font @font-face declarations (EB Garamond, Inter,
     JetBrains Mono)
   - CSS custom properties for the color system
   - Base reset that respects accessibility defaults

5. **Hero component** at `app/components/Hero.tsx`:
   - Full-bleed dolphin photograph with optimized loading
   - Headline + subhead overlay in lower-left third
   - Single CTA: "Try it" → scrolls to the embedded prompt interface
   - Mobile: image fills viewport, copy below

6. **Landing page** at `app/page.tsx` (replace current):
   - Hero section (above)
   - Embedded prompt interface (existing logic, restyled to system)
   - Five-dimensions cards section
   - Acquisition-argument three-column section
   - Native-dialect comparison strip
   - Goldfish trust signal panel
   - Footer (existing structure, restyled)

7. **Section divider component** at `app/components/WaterDivider.tsx`:
   - Water-texture crop of dolphin photograph
   - 96px tall, full-bleed, 30% opacity overlay
   - Used between every landing-page section

8. **Updated app interface** styles on the prompt-engineering surface:
   - Move from current navy/copper to ocean palette
   - Output box becomes ocean-deep background with spray-white text
   - Model adapter buttons retain copper highlight for active state
   - Goldfish badge restyled into spray-white pill below input

9. **Brand assets folder** at `public/brand/`:
   - dolphin-hero.jpg (HD master, 4K)
   - dolphin-hero-md.jpg (1920px, optimized)
   - dolphin-hero-sm.jpg (1024px, mobile-optimized)
   - water-texture.jpg (section divider crop)
   - favicon.ico, favicon.svg, apple-touch-icon.png (all from dolphin face crop)
   - og-card.jpg (1200×630 for Open Graph)

**Phase 3 — Marketing surface (separate deliverable):**

10. **Marketing pages** at `app/(marketing)/`:
    - `/about` — Robic Direct Inc. story, the case for PromptDolphin
    - `/for-teams` — corporate adoption pitch, links to /trust
    - `/manifesto` — the ocean metaphor, the case for depth over breadth

11. **/trust page** redesigned per `docs/enterprise-trust-spec.md`
12. **/privacy page** redesigned per the same spec
</deliverables>

<self_critique>
Before declaring any deliverable complete, run it through this rubric.
Each line is binary. All must answer yes.

The brand:
- [ ] Does the dolphin photograph carry the brand without explanation?
- [ ] Would a Pentagram partner describe this as "restrained" rather than "loud"?
- [ ] Does the copper accent feel intentional, not decorative?
- [ ] Does the typography read as editorial, not startup-marketing?

The narrative:
- [ ] Does the visitor feel the depth of the ocean before reading copy?
- [ ] Is the "ocean = LLM, dolphin = guide" metaphor reinforced visually
      without being stated in copy?
- [ ] Does the hero headline survive a Patrick Collison reading test?

The acquisition argument:
- [ ] Could a corp dev person at Anthropic share this URL with their team
      and not feel embarrassed?
- [ ] Is the technical moat (deterministic, client-side, open-source)
      visible within the first viewport scroll?
- [ ] Does the privacy posture register as architecture, not marketing?

The compliance check:
- [ ] Are all 20 banned design patterns absent?
- [ ] Are all forbidden copy phrases absent?
- [ ] Are color values restricted to the ocean palette plus copper accent?
- [ ] Is the CSP `connect-src 'none'` header still honored
      (all assets self-hosted)?
- [ ] Are Core Web Vitals green on the landing page on 4G?

The user test:
- [ ] Can a first-time visitor reach a generated prompt in under 60 seconds?
- [ ] Does the visual hierarchy make the "Engineer this prompt" button
      the obvious next action without explanation?
- [ ] Does the IT-administrator audience find the /trust link without
      hunting?

If any line answers no, return to that section and redesign. Do not
ship a deliverable with any unchecked box.
</self_critique>

<output_format>
For Phase 1 (approval gate), produce a single markdown document at
`docs/design-direction-v2.md` containing the visual mood document and
hero mockup options. Wait for user approval before proceeding.

For Phase 2 (implementation), produce code files in atomic commits.
One file per commit. Each commit message follows:
`design: [component-name] — [one-line description]`

For Phase 3 (marketing surface), produce as separate PR after Phase 2
ships and is verified.

At every checkpoint, present a self-critique against the rubric above
and explicitly state which lines passed and which failed. Do not
optimistically claim completion.
</output_format>

<meta_instruction>
This is acquisition-grade design work for a product positioned to be
bought by a major LLM lab. The visual quality bar is "the design that
gets the deal closed at a higher multiple." Aesthetic decisions compound
into valuation.

Take your time. Ultra-think every layout decision. The user has approved
the depth of thought as the value being delivered. Surface speed of
execution is not the goal. Surface depth of design is.

If at any point you encounter a constraint that conflicts with another,
stop and ask the user to resolve the conflict before proceeding. Do
not make architectural decisions silently.

When in doubt, refer back to the conceptual anchor: ocean is the LLM,
dolphin is the guide, depth is the intelligence, goldfish is the memory.
Every design decision either advances that metaphor or it weakens it.
There is no neutral.
</meta_instruction>
```

---

## Notes for Joel Before Pasting

**Three things to confirm before running the prompt:**

1. **The dolphin photograph rights.** The prompt references "the HD photograph
   currently visible at promptdolphin.com." That image is currently part of
   GoDaddy's Website Builder template — it is licensed for use within their
   builder only and cannot legally be lifted into PromptDolphin's brand assets.
   You will need either:
   - To purchase a commercial license for an equivalent dolphin photograph
     (Getty, Adobe Stock, Stocksy — budget $500-2,000 for an exclusive license),
     OR
   - To commission an underwater photographer for original work (budget
     $3,000-8,000 for original commission with full rights), OR
   - To use a CC0 / public domain ocean dolphin photograph from a source like
     Unsplash or Pexels (free, but image will appear elsewhere on the web).

   **Do this before running the prompt.** The design system depends on this
   asset being legally yours.

2. **Font licenses.** EB Garamond, Inter, and JetBrains Mono are all open-
   licensed (SIL Open Font License / OFL) and can be self-hosted under MIT-
   compatible terms. The prompt assumes this is settled. No action needed
   unless you want a different display face.

3. **Marketing-page scope.** The Phase 3 marketing pages (`/about`,
   `/for-teams`, `/manifesto`) add scope. If you want to ship landing-page
   only first, edit the `<deliverables>` block to remove sections 10-12
   before pasting.

**The acquisition framing.** The prompt explicitly anchors to the "acquisition
target" narrative. This is a strategic choice — it forces the design to clear
a higher bar than "looks nice." If you would rather position purely for end
users without the acquisition signal, remove audience #3 in `<project_context>`
and the corresponding rubric lines in `<self_critique>`.

**Run order in the new session:**

1. Switch to Opus 4.7 with ultra-thinking.
2. Paste the prompt verbatim.
3. Wait for Claude to produce the Phase 1 mood document at
   `docs/design-direction-v2.md`.
4. Approve, redirect, or request the alternate hero mockup option.
5. Implement Phase 2 component by component, one atomic commit per file.
6. Re-verify Railway deployment passes the CSP / security-headers test
   after font self-hosting is added (the `securityheaders.com` A+ rating
   must hold).
7. Ship Phase 3 marketing pages as a separate PR.

---

*Robic Direct Inc. — Joel Robic, Founder*
*Design prompt version: 1.0 — 2026-05-17*
