# L99 Prompt — Claude Code Master Build Prompt, v2.0
# ============================================================================
# Paste this entire prompt into Claude Code at the root of an empty directory.
#
# This prompt orchestrates GSTACK, the L99 Format Playbook methodology, and
# Claude Code's native toolchain to produce, in order:
#   (Phase 0.5) a working throwaway prototype and validation evidence
#   (Phase 1)   a refined business plan grounded in prototype learnings
#   (Phase 2)   a complete technical specification with worked examples
#   (Phase 3)   a design system with a banned-patterns exclusion charter
#   (Phase 4)   a production build with theme lockdown and auto-generated tests
#   (Phase 5)   QA with visual regression, privacy automation, cross-model review
#   (Phase 6)   production deployment of the web flagship
#   (Phase 7)   retrospective and V2 backlog
#   (Phase 8)   distribution ports to Claude skill and Copilot agent
#
# Expected runtime: 20–40 hours of supervised work, spread over two weeks.
# This is NOT a one-shot build. Expect multiple Claude Code sessions with
# explicit checkpoint-driven handoffs back to the human.
#
# Six mandatory human checkpoints. Eleven automated self-scoring gates.
# ============================================================================

<role>
You are a coordinated panel of five specialists executing a single build.
At each phase, name the specialist you are acting as. Switch explicitly.
Never blur. Garry Tan's GSTACK framing applies throughout: planning is not
review, review is not shipping — explicit gears.

  - **Dr. Amara Chen** — consumer-AI product shipper (ex-Stripe, three
    production launches). Lens: velocity, scope discipline, ship quality.
  - **Marcus Tveit** — principal privacy engineer (SOC2/ISO background,
    15 years enterprise SaaS). Lens: technical provability of privacy claims.
  - **Priya Rao** — staff architect (deterministic template engines at
    scale). Lens: schemas survive contact with compilers.
  - **Lukas Brandt** — design director (Pentagram-adjacent, fintech UIs
    at Series A). Lens: aesthetic holds at hour 40 of the build.
  - **Jordan Mireles** — early-stage founder (two YC-backed AI tools to
    100K+ users). Lens: product sharpness over feature accumulation.

At phase transitions, name the specialist taking the handoff. Inside a phase,
shift specialists when the work calls for it ("Acting as the privacy
engineer:").
</role>

<project>
**Product codename:** L99 Prompt (user-facing brand TBD — candidates: Anvil,
Forge, Signal. Decide after Phase 0.5 validation, not before.)

**Stated objective — the audit standard for every decision:**
*"A privacy-first web service that turns a workplace task into a paste-ready,
model-native, capability-aware prompt in sixty seconds."*

Every phase, every artifact, every line of code must serve this sentence.
Work that does not advance it is a failure regardless of how polished.

**Technical core:** A deterministic prompt-assembly engine. No LLM call at
generation time. Combines three ingredients:
  1. A methodology spine — seven components (role, context, format,
     exclusions, reasoning, critique, examples) held as a versioned JSON
     schema.
  2. Model adapter rulebooks — one per supported LLM, encoding that model's
     specific idioms, delimiters, tag conventions, and technique preferences.
  3. A task archetype library — model-agnostic content architectures, five
     generic and five domain-specific.

Substitute user input, emit prompt. Open-source the engine. Enterprise
features sit on top of the public core.

**Beachhead:** Microsoft 365 Copilot users at mid-market pharma and regulated
industry organizations (250–5,000 employees). Founder native operating ground.

**Deployment:** Railway. Next.js 15 + TypeScript + Tailwind + shadcn/ui.
Postgres for Pro metadata only (never content). Self-hosted Plausible for
aggregate analytics only.

**The five non-negotiables — invariant across every phase:**

1. **Zero retention of prompt content.** Session-only processing. No content
   in server logs. No content in error trackers. No content in analytics
   payloads. No content to third parties. Not in debug mode, not in dev,
   not anywhere.

2. **Deterministic engine.** No LLM call at generation time. If a feature
   requires one, it does not belong in Free or Pro. It may belong in
   Enterprise where customers opt in explicitly.

3. **Open-source engine.** Public GitHub repo, MIT license. The app depends
   on the engine as a published package. Auditors, competitors, and users
   can verify the privacy claims by reading the source.

4. **Four clicks from arrival to paste-ready prompt.** LLM → profile →
   archetype → describe → output. One text field. No account wall on
   the Free tier.

5. **The user never sees prompt engineering jargon.** No "XML tags," "few-
   shot," "role stack," "chain-of-thought," "L99." Users see a working
   prompt in their LLM's native dialect. The engineering stays invisible.

**V1 scope — ruthlessly narrow:**
  - Free tier ONLY. No auth, no Stripe, no Pro tier in V1.
  - Free tier enforcement: 10 generations per rolling 30 days, counter in
    localStorage. Yes, gameable. Gameable free tier with honest privacy
    beats enforced free tier with hedged privacy.
  - Pro upgrade path in V1: a single "Contact for Pro" button that mailto:
    opens a pre-filled email. Manual Stripe checkout link sent in reply.
    Validates willingness to pay before automating anything.
  - Team and Enterprise: V2. If the build tries to include them, invoke
    GSTACK's `/freeze`.

**Prior art to reference:**
  - The L99 Format Playbook (Volume One) — canonical methodology reference.
  - Garry Tan's GSTACK (github.com/garrytan/gstack) — the "explicit gears"
    design philosophy. Different audience, instructive pattern. We are not
    building a GSTACK competitor.
</project>

<aesthetic_anchors>
Visual references:
  - Stripe Press (editorial, restrained, warm paper)
  - Linear (crisp, opinionated, fast)
  - Vercel marketing (confident minimalism)
  - Superhuman (product-focused polish)
  - L99 Format Playbook HTML (Robic Direct Inc. continuity: deep navy
    #1F2F4A + burnished copper #A67C3D on warm paper #FDFCF8)

Voice references:
  - The Economist (numerate, decisive, unhedged)
  - Patrick Collison's writing (clarity without qualifiers)
  - YC essays (direct, evidence-anchored)

Typography:
  - EB Garamond (display and body serif)
  - Inter (UI sans)
  - JetBrains Mono (prompts and code)
</aesthetic_anchors>

<design_exclusion_charter>
Twenty banned patterns. Flag immediately if any appear during Phase 3 or 4:

  1. Stock imagery of any kind
  2. Emoji as UI (emoji in user-generated content is fine)
  3. Gradient text on any heading
  4. "Trusted by" logo rows without real customers
  5. Fake testimonials or placeholder quotes
  6. Glassmorphism / frosted backgrounds
  7. Pill-shaped buttons
  8. Sticky floating CTAs
  9. Toast notifications for non-errors
  10. Skeleton loaders on the generation step (it's instant)
  11. Dark mode toggle (forces a palette decision we're deferring)
  12. Newsletter subscribe modals
  13. Exit-intent popups
  14. The phrase "AI-powered" anywhere in copy
  15. Chatbot widget in the corner
  16. Social sharing buttons
  17. Countdown timers or "limited time" scarcity copy
  18. Animated typewriter effects
  19. Parallax scrolling on marketing pages
  20. Feature cards with decorative flat-design icons

When Claude Code proposes a UI pattern, it must first confirm the pattern is
NOT on this list. If it is, redesign before implementing.
</design_exclusion_charter>

<required_tooling>
**Skills to install before Phase 0 completes:**

1. **GSTACK.** Install with:
   ```
   git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git \
     ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
   ```
   Required skills available:
   `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`,
   `/design-consultation`, `/review`, `/qa`, `/ship`, `/retro`, `/codex`,
   `/careful`, `/freeze`, `/guard`, `/investigate`.

2. **frontend-design skill.** Load `/mnt/skills/public/frontend-design/SKILL.md`
   if available before Phase 3.

3. **MCP servers:** filesystem (native), git, GitHub, Playwright (GSTACK
   provides), web search.

4. **Project dependencies:** Bun v1.0+, Next.js 15, TypeScript 5, Tailwind 4,
   shadcn/ui, Prisma, Vitest, Playwright, Plausible (self-hosted).

**If any required tooling cannot be installed or activated, STOP and report
before proceeding. Do not work around missing tools silently.**
</required_tooling>

<readiness_dashboard_protocol>
Maintain a single `docs/readiness.md` file updated at the end of every phase
and every sub-phase. Structure:

```
# L99 Prompt — Readiness Dashboard
Last updated: [ISO timestamp]

## Phase status
- [ ] Phase 0 — Environment
- [ ] Phase 0.5 — Spike + Validate    <- CURRENT / PRIOR
- [ ] Phase 1 — Business Plan
...

## Current blockers
- [if any]

## Open questions for human
- [if any]

## Risks surfaced this phase
- [if any]

## Self-score (this phase)
X / 100 — [rationale]

## Artifacts produced this phase
- [file path, one-line description]
```

A human should be able to read `docs/readiness.md` alone and know exactly
where the project stands. If this file drifts out of sync with reality,
the build has broken discipline and needs to stop.
</readiness_dashboard_protocol>

<self_scoring_protocol>
At the end of every phase, before declaring it complete, Claude Code must:

1. Score the phase's output against the rubric for that phase (provided in
   each phase block).
2. Write the score and rationale to `docs/readiness.md`.
3. If the score is below 85, identify the specific weakness, loop once to
   address it, rescore.
4. If after one loop the score is still below 85, STOP and hand off to the
   human with a specific question, not a general "please advise."
5. Only scores ≥85 may proceed. Never proceed past a self-declared <85 score
   without explicit human override in the chat.

This is a mechanism, not a suggestion. The phase is incomplete without a
score entry in the readiness dashboard.
</self_scoring_protocol>

<escape_hatches>
Expected failure modes, by phase. When you hit one, stop and hand off rather
than working around it silently:

- **Railway deployment failing:** If `railway up` fails twice, stop. Railway
  auth issues and project configuration nuances are human-solvable, not AI-
  solvable.
- **Next.js version conflicts:** If `bun install` produces peer dependency
  warnings that prevent build, stop. Pin versions explicitly.
- **Stripe test-mode quirks:** Not applicable in V1 (no Stripe). If tempted
  to add Stripe in V1, see `/freeze`.
- **GSTACK skill unavailable:** If `/office-hours` or any referenced command
  returns "not found," stop and ask the human to verify GSTACK installed.
  Do NOT proceed with a substitute.
- **Playwright headless issues in Phase 5 QA:** If the browser fails to
  launch after two attempts, stop. Likely sandbox / permission issue.
- **Git push protection:** If GitHub rejects a push, stop. Likely secrets
  in history. Do not force push.
- **User interview no-shows (Phase 0.5):** If fewer than five interviews
  completed after two weeks of outreach, stop. The plan needs rethinking,
  not more interviews.

In all cases: produce a specific, actionable hand-off note in
`docs/readiness.md` under "Current blockers." Name the blocker, name what
you tried, name what you need from the human.
</escape_hatches>

<phase_0>
## Phase 0 — Environment & Scoping

**Acting as:** Priya Rao (architect).

**Objective:** Confirm the build can proceed. No product code yet.

**Steps:**

1. Verify environment: Claude Code version, Bun, Node, Git, GitHub auth.
   Report versions in `docs/readiness.md`.

2. Install GSTACK per the command in `<required_tooling>`. Confirm by
   listing available skills. If installation fails, stop.

3. Create the project directory structure:
   ```
   l99-prompt/
     spike/                  # Phase 0.5 throwaway prototype
     validation/             # Phase 0.5 interview notes and findings
     business-plan/          # Phase 1
     tech-spec/              # Phase 2
     design-system/          # Phase 3
     app/                    # Phase 4 production Next.js app
     engine/                 # Phase 4 open-source engine (separate git repo)
     docs/
       readiness.md          # LIVING dashboard — update every phase
     .gstack/
     CLAUDE.md               # project-level instructions
   ```

4. Create `CLAUDE.md` documenting: the five non-negotiables, the aesthetic
   anchors, the design exclusion charter, how to resume future sessions,
   and the rule that `/browse` (GSTACK) is used for web browsing —
   `mcp__claude-in-chrome__*` tools are NOT used.

5. Initialize `docs/readiness.md` per the protocol.

6. **Self-score this phase (rubric):**
   - Environment confirmed? (20)
   - GSTACK installed with all required skills? (30)
   - Directory structure created? (20)
   - CLAUDE.md complete? (15)
   - Readiness dashboard initialized? (15)
   Score out of 100. Must be ≥85 to proceed.

7. **Human checkpoint 1.** Present environment status. Wait for approval.
</phase_0>

<phase_0_5>
## Phase 0.5 — Spike + Validate (highest priority phase)

**Acting as:** Jordan Mireles (founder) with handoff to Priya Rao (architect)
for the spike build.

**Objective:** Before polishing anything, ship a disposable prototype and
get it in front of ten real target users. Kill two risks simultaneously:
product-market-fit assumptions AND technical feasibility.

**Context:** This phase did not exist in v1 of this prompt. It was the
single biggest driver of the v1 panel's low score. If this phase fails,
the project rethinks. If it succeeds, every downstream phase is de-risked.

**Part A — Build the Spike (Rao, 4–6 hours):**

1. In `spike/`, create a minimal Next.js app. No design system. No polish.
   Tailwind defaults.

2. Implement the four-step flow with the crudest possible implementation:
   - LLM select: Claude, Copilot (two only for the spike)
   - Profile select: Just the AI, AI + Web & Memory, AI Embedded in Your Work
   - Archetype select: two only — "Strategy brief" and "Executive email"
   - Task description input
   - Output: prompt generated by hardcoded string templates

3. Deploy to a Railway preview URL. No custom domain.

4. Do NOT include:
   - Auth, payments, analytics, any polish
   - More than two LLMs or two archetypes
   - Any feature not required to test the core flow

5. **Spike self-score rubric:**
   - Deploys to Railway and loads? (25)
   - All four steps functional? (25)
   - Generated prompt pastes into target LLM and produces reasonable output? (30)
   - Total click-and-type time from landing to copy is ≤60 seconds? (20)
   Must be ≥85 to proceed to Part B.

**Part B — Validate with Real Users (Mireles, 1–2 weeks elapsed):**

1. Draft an interview recruitment message. Target: ten people in Joel's
   LinkedIn network who work in pharma, biotech, financial services, or
   regulated mid-market. Must currently use Copilot, Claude, ChatGPT, or
   Gemini at work. Produce the message as `validation/recruitment.md`.

2. Joel sends the message; interviews are scheduled outside this prompt.

3. For each interview, follow the SCRIPT below. Interviews are 20 minutes,
   remote, with screen share on the spike URL.

   ```
   # Interview Script

   ## Opening (2 min)
   - "Before we start: nothing you say or type is saved anywhere. This
     is a private test."
   - "Tell me in one sentence what you use AI for at work right now."

   ## Task A — Profile recognition (3 min)
   - Show the three capability profile cards.
   - "If you had to pick the one that most matches your setup, which
     would it be? Don't overthink — first reaction."
   - Time to decision: _____ seconds.
   - Confidence (1–5): _____.
   - If <4 confidence: "What made that hard?"

   ## Task B — Archetype selection (3 min)
   - Show the (eventual) list of ten archetypes. For the spike, list all
     ten on paper, not in the app.
   - "Which of these do you do at work in a typical week? Circle all."
   - Record which are circled, which are not.
   - "Any task you do weekly that isn't on this list?" — record.

   ## Task C — End-to-end flow (8 min)
   - Open the spike URL.
   - "Without help, generate a prompt for a task you do at work. Think
     aloud. I won't help unless you're totally stuck for 60 seconds."
   - Time from landing to copy: _____ seconds.
   - Moments of confusion: _____.
   - Did the generated prompt feel usable? (1–5): _____.

   ## Task D — Paste test (3 min)
   - Have the user paste the prompt into their actual LLM.
   - Observe the output.
   - "Is this better, worse, or the same as what you usually get?" _____.

   ## Closing (1 min)
   - "Would you use this for real work? What would make you not use it?"
   - "Is $12/month reasonable for unlimited? What's your walk-away price?"
   ```

4. Produce `validation/interview-[N]-notes.md` for each interview.

5. **Aggregate findings in `validation/synthesis.md`** with these specific
   decision rules:
   - Profile recognition: if <7 of 10 pick their profile within 10 seconds
     with ≥4 confidence, profiles get redesigned.
   - Archetype list: archetypes circled by <3 of 10 get dropped; tasks
     mentioned by ≥3 that aren't on the list get added.
   - Flow time: if median time-to-copy is >90 seconds, the flow gets
     simplified before Phase 4.
   - Output quality: if <7 of 10 rate the prompt ≥4 out of 5, the adapter
     logic needs rework before Phase 4.
   - Willingness to pay: median walk-away price informs Pro pricing.

6. **Phase 0.5 self-score rubric:**
   - Spike deployed and functional? (15)
   - Ten interviews completed? (25)
   - All five decision rules applied with explicit outcomes? (30)
   - At least 7 of 10 interviews confirm the core value proposition? (30)
   Must be ≥85 to proceed. If <85, STOP and re-plan with Joel.

7. **Human checkpoint 2.** Present the validation synthesis and the explicit
   yes/no/revise decision on each of the five rules. Wait for approval.
</phase_0_5>

<phase_1>
## Phase 1 — Business Plan (Refined, Not Bloated)

**Acting as:** Jordan Mireles (founder) with handoff to Amara Chen
(shipper) for the final polish.

**Objective:** Produce a tight, grounded business plan shaped by what the
spike and interviews proved. Six sections, not eighteen. The plan is a
living document, not a thesis.

**Input:** The v1 draft already exists from prior work with Joel. Pull it
from `business-plan/v1-draft.md` or reconstruct from this prompt's
`<project>` block.

**Process:**

1. **Run GSTACK's `/plan-ceo-review`** on the v1 draft. Apply all four
   modes explicitly (expansion / selective expansion / hold / reduction).
   Save to `business-plan/ceo-review.md`.

2. **Refresh market data** via web search. Every figure cited must have:
   a source URL, a publication date, a statement of what it measures.
   Unverified figures are dropped. Save refresh to
   `business-plan/market-refresh.md`.

3. **Produce six business plan sections** at `business-plan/v2/`:

   - `01-executive-summary.md` (400 words max)
   - `02-problem-and-solution.md` (the three breakages + the four design
     principles)
   - `03-product-and-engine.md` (user journey + technical core + worked
     example of engine output)
   - `04-market-and-competitive.md` (market refresh + deep competitive
     matrix + niche-archetype GTM wedge)
   - `05-business-model-and-gtm.md` (tier structure + unit economics +
     90-day execution plan)
   - `06-risks-and-moat.md` (risks and mitigations + four compounding
     moats + open decisions)

4. **Concatenate into** `business-plan/L99_Prompt_Business_Plan.md`.

5. **Render as HTML + PDF** using the Robic Direct Inc. design language
   (Playbook continuity — deep navy, burnished copper, EB Garamond).
   Signed by Joel Robic, Robic Direct Inc.

6. **Self-score rubric:**
   - Every figure has source + date? (20)
   - Six sections, not eighteen? (10)
   - Validation findings integrated? (25)
   - Privacy posture is stated in the first 400 words? (15)
   - No hedging language, no consulting-speak? (15)
   - Passes "Tier 1 seed investor's desk" test? (15)
   Must be ≥85 to proceed.

7. **Human checkpoint 3.** Present the plan. Wait for approval.
</phase_1>

<phase_2>
## Phase 2 — Technical Specification with Worked Example

**Acting as:** Priya Rao (architect) with handoff to Marcus Tveit (privacy)
for the privacy architecture document.

**Objective:** Ground every technical claim in a buildable specification.
Claude Code must not invent schemas in Phase 4. Every format is defined or
worked-example'd here.

**Process:**

1. **Run GSTACK's `/plan-eng-review`** on the product. Save to
   `tech-spec/eng-review.md`.

2. **Architecture document** at `tech-spec/01-architecture.md`: system
   diagram, why deterministic assembly beats LLM-generated, where
   generation happens (client-side primarily, edge as fallback), scaling
   path from 100 to 1M users.

3. **Methodology spine schema** at `tech-spec/02-spine.md`: complete JSON
   schema with every field typed, versioning strategy, example spine doc.

4. **Model adapter format with FULL WORKED EXAMPLE** at
   `tech-spec/03-adapters.md`. This is the most important artifact in the
   entire spec. Required contents:

   - The adapter format specified as a JSON schema.
   - **A complete, copy-paste-runnable Claude adapter** written out in
     the prompt itself (see below). Every other adapter follows this
     pattern.
   - Adapter versioning and update cadence.

   **Embedded Claude adapter (ground truth — Claude Code must match this
   structure for every other adapter it produces):**

   ```json
   {
     "$schema": "https://l99prompt.com/schemas/adapter.v1.json",
     "adapter": "claude",
     "version": "1.0.0",
     "model_family": "Anthropic Claude",
     "supported_versions": ["claude-opus-4-*", "claude-sonnet-4-*"],
     "idioms": {
       "delimiters": {
         "section_open": "<{section}>",
         "section_close": "</{section}>",
         "example_open": "<example>",
         "example_close": "</example>"
       },
       "preferred_structure": "xml_tagged",
       "markdown_tolerance": "medium",
       "prefers_explicit_scaffolding": true,
       "reasoning_invocation": "extended_thinking_adaptive",
       "tone_sensitivity": "high"
     },
     "component_expressions": {
       "role": {
         "template": "<role>\n{role_content}\n</role>",
         "guidance": "Two or three specific named personas. Include tone cues."
       },
       "context": {
         "template": "<context>\n{context_content}\n</context>",
         "grounding_prefix": "Before generating, "
       },
       "format": {
         "template": "<format>\n{format_content}\n</format>",
         "prefers_explicit_bullet_counts": true
       },
       "exclusions": {
         "template": "<do_not>\n{exclusion_list}\n</do_not>"
       },
       "reasoning": {
         "template": "",
         "note": "Claude uses adaptive extended thinking; do not add 'think step by step'. Do not pass thinking blocks back on subsequent turns."
       },
       "critique": {
         "template": "<critique>\nBefore finalizing, apply this rubric:\n{critique_rubric}\nIf any answer is no, identify the specific failure and revise.\n</critique>"
       },
       "examples": {
         "template": "<example>\n{example_content}\n</example>",
         "handoff_marker": "### New Input:"
       }
     },
     "capability_branches": {
       "profile_A": {
         "grounding_instruction": "Rely on your training knowledge. Where you're uncertain, say so explicitly.",
         "invoke_web_search": false,
         "invoke_tenant_data": false
       },
       "profile_B": {
         "grounding_instruction": "Use web search to verify current facts. Cite sources inline.",
         "invoke_web_search": true,
         "invoke_tenant_data": false
       },
       "profile_C": {
         "grounding_instruction": "Use admin-granted data connectors. Scan relevant sources for context before generating.",
         "invoke_web_search": true,
         "invoke_tenant_data": true
       }
     },
     "assembly_order": ["role", "context", "format", "exclusions", "task", "examples", "critique"]
   }
   ```

   Produce equivalent adapter files for GPT-5, Gemini, and Copilot
   following this exact pattern.

5. **Archetype library** at `tech-spec/04-archetypes.md`. Ten archetypes,
   five generic and five domain-specific — this is the niche-first GTM
   wedge:

   Generic (5):
     1. Executive email / communication
     2. Meeting preparation brief
     3. Research synthesis
     4. Presentation deck outline
     5. Data analysis request

   Domain-specific (5):
     6. Pharma regulatory submission draft
     7. Biotech investor update (quarterly cadence)
     8. Due-diligence quick look (M&A, investment)
     9. Post-incident review (compliance, quality)
     10. Board-ready strategic brief (regulated industry)

   Each archetype specified as a JSON document matching the schema, with
   an example prompt generated from each archetype using the Claude
   adapter above.

6. **Capability profiles** at `tech-spec/05-profiles.md`: refined per
   Phase 0.5 interview findings. If interviews suggested changes, they
   land here.

7. **Privacy architecture** at `tech-spec/06-privacy.md`. This document
   is Marcus Tveit's responsibility. Must explicitly resolve:

   - **Free-tier counter location:** localStorage only. Gameable. Documented
     as a deliberate tradeoff.
   - **Error tracking scrubbing:** middleware that strips all form values
     from stack traces. Vendor: none in V1 (errors logged to Railway's
     native log aggregator, which does not receive form payloads).
   - **Analytics event payload:** exact schema of every event; every
     payload field justified; the claim "no event ever contains user text"
     provable by reading the event schema.
   - **Data flow diagram:** every place user input touches, with a boolean
     for "persisted" (all false for prompt content).
   - **Third-party services:** enumerate each, state what it receives,
     state what it does not. Plausible gets page views. Railway gets
     infrastructure metrics. No one else.
   - **Verifiability:** specify how a customer or auditor proves each claim.

8. **Open-source engine repo spec** at `tech-spec/07-engine-repo.md`:
   structure, license (MIT), CONTRIBUTING.md, relationship to the
   proprietary app, adapter contribution workflow.

9. **Railway deployment spec** at `tech-spec/08-deployment.md`: services,
   env vars, CI/CD, migrations, observability without content logging.

10. **Self-score rubric:**
    - Complete worked Claude adapter embedded? (20)
    - Three other adapters produced in matching format? (15)
    - Ten archetypes with five domain-specific? (15)
    - Privacy tensions explicitly resolved (not deferred)? (25)
    - Railway deployment spec complete? (10)
    - Open-source engine structure specified? (15)
    Must be ≥85 to proceed.

11. **Human checkpoint 4.** Present the spec. It should be evaluable in
    one sitting. Wait for approval.
</phase_2>

<phase_3>
## Phase 3 — Design System with Exclusion Charter

**Acting as:** Lukas Brandt (design director).

**Objective:** Establish visual language before any component is coded,
and establish visual regression baseline so drift is detectable.

**Process:**

1. Load `/mnt/skills/public/frontend-design/SKILL.md` if available.

2. **Run GSTACK's `/plan-design-review` and `/design-consultation`.** Save
   to `design-system/design-review.md` and
   `design-system/design-consultation.md`.

3. **Design tokens** at `design-system/tokens.css` and `tokens.ts`.
   Colors, typography, spacing, radii, shadows, motion.

4. **Design exclusion charter (from the top of this prompt) embedded** at
   `design-system/exclusions.md`. Any UI pattern must be checked against
   this list before implementation.

5. **Component sketches** at `design-system/components.md`. Structural
   descriptions, not code. Covering: LLM selector, profile card,
   archetype tile, task input, generated prompt display, privacy banner,
   nav, footer.

6. **Three representative page mockups** as static HTML at
   `design-system/mockups/`: landing, tool flow, privacy page.

7. **Establish visual regression baseline.** For each mockup, capture a
   reference screenshot via Playwright. Store at
   `design-system/reference-screenshots/`. Phase 5 will diff production
   pages against these.

8. **Self-score rubric:**
   - Design tokens defined and consistent? (25)
   - Exclusion charter embedded and enforceable? (20)
   - All components sketched? (15)
   - Three mockups rendered? (25)
   - Reference screenshots captured for Phase 5 diffing? (15)
   Must be ≥85 to proceed.

9. **Human checkpoint 5.** Present the mockups. Aesthetic direction
   confirmed here or not at all.
</phase_3>

<phase_4>
## Phase 4 — Production Build

**Acting as:** Priya Rao (architect) for the engine, handoff to Amara Chen
(shipper) for the app, handoff to Marcus Tveit (privacy) for analytics
and instrumentation.

**Objective:** Production-ready deployment. Core Free flow working
end-to-end. No V1.5 or V2 features smuggled in.

### Phase 4.0.5 — Theme Lockdown (mandatory before any page)

Before building a single production page:

1. Install shadcn/ui components.
2. Re-theme every shadcn primitive against the Phase 3 tokens. Verify
   visually against the reference screenshots from Phase 3.
3. Produce a `app/components/themed-primitives.md` note documenting every
   shadcn primitive used and its re-theming status.
4. Run visual regression: rendered primitives must match the Phase 3
   aesthetic within tolerance.

No page building until this sub-phase self-scores ≥90.

### Phase 4.1 — Open-Source Engine

1. Initialize `engine/` as a separate git repo under the user's GitHub.
   MIT license.
2. Implement the deterministic assembly engine in TypeScript:
   - Types match Phase 2 schemas exactly.
   - Pure function: `assemble({ archetype, adapter, profile, task,
     audience }) → string`.
   - No network calls. No side effects.
3. Implement four launch adapters (Claude per the worked example, then
   GPT-5, Gemini, Copilot following the pattern).
4. Implement ten archetypes as JSON data files.
5. Implement three capability profiles.
6. **Tests generated inline with features.** Every adapter commit
   includes adapter tests. Every archetype commit includes archetype
   tests. Tests use Vitest. Required coverage:
   - Unit tests per adapter transformation
   - Integration tests for the assembly function
   - Snapshot tests for every archetype × adapter × profile combination
     (minimum 10 × 4 × 3 = 120 snapshots)
   - Property tests: engine never emits empty, malformed, or
     jargon-containing prompts
7. Publish to GitHub. README, CONTRIBUTING, security disclosure policy.

### Phase 4.2 — Next.js Application

1. Initialize `app/` as Next.js 15, TypeScript, Tailwind.
2. Install engine as a workspace dependency.
3. Apply themed shadcn primitives from Phase 4.0.5.
4. Build pages:
   - `/` — landing (Brandt writes the hero copy, not the engineer)
   - `/generate` — the four-step flow
   - `/privacy` — plain-language privacy statement
   - `/open-source` — engine explainer, GitHub link
   - `/pro` — the single "Contact for Pro" button with pre-filled mailto
5. Build the four-step flow with client-side engine. No server round-trip
   for generation.
6. Free tier: localStorage counter, rolling 30-day window. No auth.
7. Persistent privacy banner on every page.
8. The pro page is the entire "upgrade path" in V1 — no Stripe integration.

### Phase 4.3 — Analytics (aggregate only)

1. Self-host Plausible on Railway.
2. Events tracked (payload schemas documented):
   - `page_view` (url, referrer)
   - `llm_selected` (llm_name)
   - `profile_selected` (profile_letter)
   - `archetype_selected` (archetype_id)
   - `generation_completed` (boolean, no content)
   - `pro_interest_click` (source_page)
3. Events explicitly NOT tracked: anything containing user text.
4. Error logging: Railway native logs only. No Sentry or third-party
   error tracker. Error middleware scrubs all form values from stack
   traces before logging.
5. Privacy engineer (Tveit) verifies every event payload by reading the
   code, not the documentation. Findings in `docs/phase-4-analytics-audit.md`.

### Phase 4.4 — Deployment

1. Railway project with services: web (Next.js), plausible.
2. Environment variables. Secrets out of repo.
3. GitHub Actions CI/CD: lint → test → build → deploy on merge to main.
4. Preview deployments for every PR.
5. Custom domain (Joel provides).

**During Phase 4, `/guard` is active.** Any attempt to add auth, Stripe,
Sentry, or tenant integrations triggers a freeze and human handoff.

**Phase 4 self-score rubric:**
  - All 10×4×3 = 120 prompt combinations render correctly? (20)
  - No jargon in any user-facing copy (automated check)? (10)
  - Engine package published to GitHub with MIT license? (15)
  - Privacy audit passed for every analytics event? (20)
  - Theme lockdown verified — no shadcn default styles leaked? (15)
  - Site loads and all four steps function on Railway preview URL? (20)
  Must be ≥90 to proceed.
</phase_4>

<phase_5>
## Phase 5 — QA, Review, Cross-Model Audit

**Acting as:** Amara Chen (shipper) with every specialist on call.

**Objective:** Production-grade quality gate before shipping.

**Process:**

1. **GSTACK `/review`** on the codebase. Auto-fix what it can. Findings
   at `docs/phase-5-review.md`. Address every flagged issue.

2. **GSTACK `/qa`** on the deployed preview URL. Real browser testing of
   all 10 × 4 × 3 = 120 combinations (sampled: 30 representative at
   minimum). Regression tests saved to `tests/e2e/`.

3. **Visual regression diffing** via Playwright. Every production page
   compared against Phase 3 reference screenshots. Any drift >threshold
   fails.

4. **GSTACK `/codex`** for independent cross-model review of the engine.
   Address or document every overlapping finding.

5. **Privacy audit automation.** `/investigate` scoped to every outbound
   network call, every log statement, every analytics event. Automated
   grep for common leak patterns:
   - `console.log` containing request bodies
   - Any `fetch` to external domain with body
   - Any analytics event construction that includes form state
   - Any error handler that serializes without scrubbing
   Findings at `docs/phase-5-privacy-audit.md`.

6. **Performance audit.** Lighthouse 95+ on all key pages. Core Web
   Vitals green. Time-to-first-prompt ≤60 seconds end-to-end (the product
   promise).

7. **Accessibility audit.** WCAG AA. Screen reader test on flow.

8. **Copy audit.** Automated check: no word on the banned jargon list
   appears in user-facing copy. Banned list: "XML tags", "few-shot",
   "chain-of-thought", "role stack", "prompt engineering", "L99",
   "AI-powered", plus anything from the design exclusion charter's
   language items.

9. **Phase 5 self-score rubric:**
   - `/review` findings addressed? (15)
   - `/qa` 30+ combinations passed? (20)
   - Visual regression within tolerance? (15)
   - `/codex` findings addressed or documented? (10)
   - Privacy automation found zero leaks? (20)
   - Lighthouse 95+ all pages? (10)
   - Copy audit passes? (10)
   Must be ≥90 to proceed to ship.
</phase_5>

<phase_6>
## Phase 6 — Ship

**Acting as:** Amara Chen (shipper).

1. Final `/review` pass.
2. Open-source engine v1.0.0 release tagged on GitHub.
3. `/ship`: sync main, run tests, open PR, merge, Railway production
   deploy.
4. Custom domain live with HTTPS.
5. Launch-day drafts at `docs/phase-6-launch.md`: LinkedIn post,
   Playbook audience email, Product Hunt, Show HN.
6. **Human checkpoint 6.** Show live URL, privacy statement, engine repo.
   Wait for explicit "ship it" before announcing.

**Phase 6 self-score rubric:**
  - Engine v1.0.0 live on GitHub? (25)
  - Web tool live on custom domain with HTTPS? (30)
  - Privacy statement visible on every page? (20)
  - Launch drafts produced? (15)
  - Readiness dashboard final entry clean? (10)
  Must be ≥95 to complete.
</phase_6>

<phase_7>
## Phase 7 — Retrospective

**Acting as:** All five panelists.

1. GSTACK `/retro` across the full build.
2. Produce `docs/phase-7-retro.md`: what was built (line counts, commit
   counts by phase), what was descoped (explicit V2 backlog), what took
   longer than expected and why, what went faster, what to do differently
   next time, new patterns for Joel's personal playbook.
3. `docs/v2-backlog.md`: every descoped feature, prioritized with effort
   estimates. Auth, Stripe, team tier, enterprise tier, brand voice,
   tenant integrations, additional LLMs (Perplexity, Llama, DeepSeek),
   additional archetypes informed by post-launch feedback.
4. Update the L99 Format Playbook (Volume One) with any new patterns
   learned during this build.
</phase_7>

<phase_8>
## Phase 8 — Distribution Ports (optional, post-launch)

**Acting as:** Priya Rao (architect).

**Objective:** Port the engine to the two platforms where target users
already live. Web tool is the flagship. These ports are distribution.

1. **Claude skill** at `ports/claude-skill/`:
   - SKILL.md matching the Anthropic skill format
   - Imports the open-source engine as a dependency
   - Packaged for installation into Claude Code or claude.ai projects
2. **Copilot agent** at `ports/copilot-agent/`:
   - Declarative agent manifest
   - Engine runs inside the agent runtime
   - Published to the Copilot agent directory
3. **Documentation** explaining when a user should use the web tool vs.
   the skill vs. the agent.

Phase 8 is optional and can be deferred indefinitely. It exists in the
prompt so Claude Code has the scaffold when the time comes, not as a
V1 obligation.
</phase_8>

<hard_constraints>
Throughout every phase, invariant:

1. **No prompt content logged, stored, or transmitted to a third party,
   anywhere, ever.** Debug mode included.
2. **Engine never calls an LLM at generation time.**
3. **No prompt engineering jargon in user-facing copy.** Automated check
   in Phase 5.
4. **No V1 scope creep.** Auth, Stripe, Team, Enterprise, tenant
   integrations → `/freeze` on contact.
5. **Design exclusion charter enforced at every UI decision.**
6. **Every market claim sourced and current.** "Cited" ≠ "verified."
7. **Every phase self-scores before proceeding.** <85 loops once, then
   stops.
8. **Six human checkpoints mandatory.** Phases 0, 0.5, 1, 2, 3, 6. No
   proceeding past a checkpoint without explicit approval.
9. **Readiness dashboard updated at every phase transition.** The single
   source of truth on project state.
10. **Escape hatches observed.** When an expected failure mode triggers,
    stop and hand off — do not work around silently.
</hard_constraints>

<meta_self_critique>
Apply at every phase end in addition to the phase-specific rubric:

- **Objective alignment.** Did this phase's output advance the stated
  objective ("a privacy-first web service that turns a workplace task
  into a paste-ready, model-native, capability-aware prompt in sixty
  seconds")? If not, the phase is a failure regardless of polish.
- **Validation fidelity.** Are we still building the product the Phase
  0.5 interviews validated, or have we drifted? Point to specific
  interview findings informing this phase's decisions.
- **Privacy integrity.** Has any decision this phase weakened a privacy
  non-negotiable? If yes, revert.
- **Scope discipline.** Has any V2 feature smuggled itself into V1? If
  yes, revert and document in v2-backlog.
- **Aesthetic discipline.** Has any UI decision drifted from the Robic
  Direct Inc. voice? Compare against Phase 3 reference screenshots.
- **Jargon discipline.** Can a non-technical user read every user-facing
  sentence and understand it? Run the copy audit.

For any "no" on any check, the phase is incomplete. Return to work.
</meta_self_critique>

<begin>
Begin Phase 0.

Acting as Priya Rao (architect): verify environment, install GSTACK,
create the directory structure, initialize `docs/readiness.md`.

Do not begin Phase 0.5 until human approval at Checkpoint 1.
Do not begin Phase 1 until human approval at Checkpoint 2 (following
Phase 0.5 validation).
Do not begin Phase 4 without the 120 × 4 × 3 snapshot test matrix ready.
Do not deploy to production without explicit "ship it" at Checkpoint 6.
</begin>
