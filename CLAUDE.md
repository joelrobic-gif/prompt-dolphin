# CLAUDE.md — Project Constants

This file is loaded by Claude Code at the start of every session in this directory. It holds the constants of the project. The variables (current phase, blockers, open questions) live in `docs/readiness.md`.

---

## Project identity

**Codename:** L99 Prompt (internal only — never appears in user-facing copy)

**User-facing brand:** PromptDolphin — confirmed by Joel at Checkpoint 1 (2026-05-16).

**Domain:** promptdolphin.com — owned by Joel Robic on GoDaddy.

**GitHub:** joelrobic-gif personal account — engine repo and app repo both here.

**Signature:** Robic Direct Inc., Joel Robic, Founder.

**Stated objective:** Turn any workplace task into a paste-ready, model-native, capability-aware prompt in sixty seconds — privately.

---

## Five non-negotiables

1. **Zero retention of prompt content.** Session-only processing. No content in server logs, error trackers, analytics payloads, or third-party services. Not in dev, not in debug, not anywhere.

2. **Deterministic engine.** No LLM call at generation time. The engine is a pure function: `assemble({ archetype, adapter, profile, task, audience }) → string`.

3. **Open-source engine.** Public GitHub repo, MIT license, auditable. The app depends on the engine as a published package.

4. **Four clicks from arrival to paste-ready prompt.** LLM → profile → archetype → describe → output. One text field. No account wall on the Free tier.

5. **The user never sees prompt engineering jargon.** No "XML tags," "few-shot," "role stack," "chain-of-thought," "L99." Users see a working prompt in their LLM's native dialect.

---

## Aesthetic anchors

**Visual references:** Stripe Press, Linear, Vercel marketing, Superhuman, the L99 Format Playbook HTML (Robic Direct Inc. continuity).

**Voice references:** The Economist, Patrick Collison's writing, YC essays.

**Typography:** EB Garamond (display, body), Inter (UI), JetBrains Mono (code and prompts).

**Color palette:**
- Paper: `#FDFCF8`
- Paper warm: `#F7F2E8`
- Ink: `#1A1A1A`
- Ink muted: `#555555`
- Accent (deep navy): `#1F2F4A`
- Accent warm (burnished copper): `#A67C3D`
- Rule: `#D8D2C4`
- Code background: `#F4EFE2`

**Spacing:** 8px baseline grid.

**Radii:** 2px, 4px, 8px. No pill-shaped buttons.

---

## Design exclusion charter — 20 banned patterns

When proposing any UI pattern, confirm it is NOT on this list. If it is, redesign before implementing.

1. Stock imagery
2. Emoji as UI
3. Gradient text on headings
4. "Trusted by" logo rows without real customers
5. Fake testimonials or placeholder quotes
6. Glassmorphism / frosted backgrounds
7. Pill-shaped buttons
8. Sticky floating CTAs
9. Toast notifications for non-errors
10. Skeleton loaders on the generation step (it's instant)
11. Dark mode toggle
12. Newsletter subscribe modals
13. Exit-intent popups
14. The phrase "AI-powered" anywhere in copy
15. Chatbot widget
16. Social sharing buttons
17. Countdown timers or "limited time" copy
18. Animated typewriter effects
19. Parallax scrolling on marketing
20. Feature cards with decorative flat-design icons

---

## Required tooling

**GSTACK** — Garry Tan's Claude Code skill pack. Required skills available in this project:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/review`, `/qa`, `/ship`, `/retro`, `/codex`, `/careful`, `/freeze`, `/guard`, `/investigate`.

Install if missing:
```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git \
  ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

**MCP servers:** filesystem (native), git, GitHub, Playwright, web search.

**Browsing:** use GSTACK's `/browse` skill. Do NOT use `mcp__claude-in-chrome__*` tools.

**Project dependencies (installed in Phase 4):** Bun v1.0+, Next.js 15, TypeScript 5, Tailwind 4, shadcn/ui, Prisma, Vitest, Playwright, self-hosted Plausible.

---

## V1 scope discipline

**In V1:**
- Free tier only. 10 generations per rolling 30 days, counter in localStorage.
- Four launch LLMs: Claude, ChatGPT (GPT-5), Gemini, Microsoft Copilot.
- Three capability profiles: Just the AI, AI + Web & Memory, AI Embedded in Your Work.
- Ten archetypes — five generic, five domain-specific (regulated industries).
- One "Contact for Pro" mailto button as the upgrade path. No Stripe integration.
- Self-hosted Plausible for aggregate analytics. No Sentry. No third-party trackers.

**NOT in V1 (V2 backlog):**
- Auth, Stripe automation, Pro tier infrastructure
- Team tier (shared archetypes, brand voice)
- Enterprise tier (custom archetypes, SSO, DPA)
- Tenant integrations beyond passive instruction generation
- Additional LLMs (Perplexity, Llama, DeepSeek)
- Distribution ports (Claude skill, Copilot agent) — these are Phase 8, optional

If a feature attempt drifts toward V2, invoke GSTACK's `/freeze`.

---

## Self-scoring protocol

At the end of every phase, score the phase's output against its rubric. Write the score and rationale to `docs/readiness.md`. If <85, loop once to address weakness. If still <85 after one loop, stop and hand off to the human with a specific question.

Never proceed past a self-declared <85 score without explicit human override.

---

## Resuming a session

When you start a Claude Code session in this directory:

1. Read this file (`CLAUDE.md`) — you just did.
2. Read `docs/readiness.md` — tells you where the project stands.
3. Run `git log --oneline -10` — last ten commits.
4. Check which directories are populated (see README for the state map).
5. Resume at the first incomplete phase per `00-MASTER-BUILD-PROMPT.md`.

If `docs/readiness.md` is missing or out of date, reconstruct it from directory state before doing anything else.

---

## When you're unsure

The master prompt has a `<self_critique>` rubric and a `<meta_self_critique>` block. Apply them. The five non-negotiables are the audit standard. The stated objective is the north star. If a decision doesn't advance the stated objective or compromises a non-negotiable, the decision is wrong.
