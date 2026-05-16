# Design Exclusion Charter

> **Twenty patterns that will never ship.** When proposing any UI element, check it against this list first. If it appears here, redesign before implementing.

The charter exists because aesthetic drift in Phase 4 is the single most common failure mode of AI-assisted product builds. Claude Code defaults toward "modern SaaS" patterns. Those defaults compound into something indistinguishable from every other AI tool on the market. The exclusion list is the firewall.

---

## Banned visual patterns

### 1. Stock imagery
**Why banned:** No stock photo of "diverse team collaborating" or "person at laptop with coffee" has ever made a product better. The aesthetic anchors call for editorial restraint, not stock photography.
**What to do instead:** Custom illustrations, abstract geometric compositions, or no imagery at all. Generous whitespace beats decoration.

### 2. Emoji as UI
**Why banned:** Emojis in UI signal "fun startup" — wrong tone for the target audience (mid-market executives, regulated industries). Emoji in user-generated content is fine.
**What to do instead:** Typography, color, and spacing to convey meaning.

### 3. Gradient text on headings
**Why banned:** Gradient text peaked in 2021 SaaS marketing pages. Now it signals derivative.
**What to do instead:** A single accent color, applied with restraint, on a few words that earn the emphasis.

### 4. "Trusted by" logo rows without real customers
**Why banned:** We don't have customers yet. Placing logos before we earn them is dishonest.
**What to do instead:** Until real customers consent to be named, nothing. Empty space is better than fake social proof.

### 5. Fake testimonials or placeholder quotes
**Why banned:** Same logic. Honesty over decoration.
**What to do instead:** Wait for real users. Or quote published writing from real people (with permission) that endorses the methodology.

### 6. Glassmorphism / frosted backgrounds
**Why banned:** Apple aesthetic borrowed by every AI startup. Generic.
**What to do instead:** Solid surfaces. Restrained shadows. Warm paper background as the base.

### 7. Pill-shaped buttons
**Why banned:** Default Linear/Vercel button shape. Generic SaaS.
**What to do instead:** Rectangular buttons with 2px or 4px radius. Editorial weight.

### 8. Sticky floating CTAs
**Why banned:** Aggressive marketing pattern. The product earns clicks by being good, not by chasing the user down the page.
**What to do instead:** A clear CTA in the hero, repeated naturally as readers scroll past relevant content.

### 9. Toast notifications for non-errors
**Why banned:** "Copied to clipboard!" toasts are noise. The copy button can visually signal success without a popup.
**What to do instead:** Inline state changes on the button itself (e.g., button text flips from "Copy" to "Copied" for 2 seconds).

### 10. Skeleton loaders on the generation step
**Why banned:** Generation is instant — string assembly takes <100ms. A loading state would be theater.
**What to do instead:** Show the output immediately. No loader.

---

## Banned interaction patterns

### 11. Dark mode toggle
**Why banned:** Forces a palette decision we're deferring. Light mode with the warm paper background is the brand expression. Dark mode is a V1.5 question, not a V1 obligation.
**What to do instead:** Respect `prefers-color-scheme: dark` minimally if a user has it set system-wide — but no explicit toggle in the UI.

### 12. Newsletter subscribe modals
**Why banned:** Hostile to first-time visitors. Particularly hostile when the product's whole promise is "we don't collect your data."
**What to do instead:** A footer link "Subscribe for updates" that opens a simple form. Opt-in by intent.

### 13. Exit-intent popups
**Why banned:** Same logic, more aggressive.
**What to do instead:** Nothing. If they're leaving, let them leave.

### 14. The phrase "AI-powered" anywhere
**Why banned:** Marketing cliché. Every product is "AI-powered" now. Says nothing.
**What to do instead:** State what the product actually does. "Turn any task into a ready-to-use prompt."

### 15. Chatbot widget in the corner
**Why banned:** Ironic for a product that helps people prompt LLMs. Also: a chat widget collects data we've promised never to collect.
**What to do instead:** A clear "Contact" link in the footer pointing to a mailto.

### 16. Social sharing buttons
**Why banned:** Most users don't share marketing pages on social. The buttons clutter the UI and load third-party scripts that often track users.
**What to do instead:** A "Share this page" link that copies the URL to clipboard. No third-party scripts.

---

## Banned marketing patterns

### 17. Countdown timers or "limited time" copy
**Why banned:** Manipulation tactic. Wrong tone for a strategic product.
**What to do instead:** State the offer clearly. If pricing changes, change pricing.

### 18. Animated typewriter effects
**Why banned:** Decorative animation that delays the user reading the content. Peaked in 2022.
**What to do instead:** Show the text immediately. Movement only when it serves clarity (e.g., the four-step flow's progression).

### 19. Parallax scrolling on marketing pages
**Why banned:** 2014 design pattern. Performance hit. Distracting.
**What to do instead:** Normal scrolling. Editorial layout. Content drives the page.

### 20. Feature cards with decorative flat-design icons
**Why banned:** Generic SaaS marketing page pattern. Every feature card with a colored circle behind a thin-line icon looks the same.
**What to do instead:** Sections with editorial typography. Numbered if sequential, lettered if categorical, no icons unless the icon is genuinely informative (e.g., showing which LLM logo applies to which feature).

---

## When in doubt

The aesthetic anchor is the L99 Format Playbook. Pull up its HTML and compare. Does the proposed UI feel like it could appear in the same brand? If not, redesign.

The voice anchor is The Economist's product pages and Patrick Collison's writing. Does the proposed copy feel like it could appear in the same publication? If not, rewrite.

A useful failure question: **"If I screenshot this and post it to Twitter, would anyone be able to tell which product it is, or would it blend into every other AI tool?"**

If the answer is "blends in," the design has failed regardless of how polished it looks in isolation.
