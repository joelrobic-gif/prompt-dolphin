# L99 Prompt — Project Handoff Package

**You are Claude Code. Read this file first. It tells you where the project is, what was built, and what to do next.**

---

## In one phrase

Turn any workplace task into a paste-ready, model-native, capability-aware prompt in sixty seconds — privately.

---

## What this package is

A complete project starter for **L99 Prompt** (internal codename; user-facing brand TBD — candidates: Anvil, Forge, Signal). The package contains:

1. **The master build prompt** — `00-MASTER-BUILD-PROMPT.md`. Eight phases, six human checkpoints, self-scoring gates. This is the script Claude Code follows.
2. **Project orientation** — `CLAUDE.md`. The constants: non-negotiables, aesthetic anchors, exclusion charter, tooling. Loaded into every Claude Code session.
3. **The readiness dashboard** — `docs/readiness.md`. The living source of truth. Always update at every phase transition.
4. **The methodology reference** — `docs/methodology-reference.md`. The seven-component spine and the worked Claude adapter, both as ground truth.
5. **Phase 0.5 validation kit** — `validation/recruitment.md` and `validation/interview-script.md`. Ready to send and run.
6. **Empty scaffolds** — directories for every phase's expected outputs.

---

## How to use this package

### Scenario A: Starting fresh

You are in an empty directory. The user just dropped this package in. Do this:

1. Read `CLAUDE.md` to absorb project constants.
2. Read `docs/readiness.md` — it will say "Phase 0 — not started."
3. Open `00-MASTER-BUILD-PROMPT.md` and begin Phase 0.
4. Update `docs/readiness.md` at every phase transition.

### Scenario B: Resuming work

You are in a project that has prior commits. Someone (you or another agent) was here before. Do this:

1. Read `CLAUDE.md` to absorb project constants.
2. Read `docs/readiness.md` — it tells you the last completed phase, current blockers, open questions for the human.
3. Run `git log --oneline -20` to see what was built recently.
4. Check the directory for completed phase outputs:
   - `spike/` populated? → Phase 0.5 part A done.
   - `validation/synthesis.md` exists? → Phase 0.5 part B done.
   - `business-plan/v2/` populated? → Phase 1 done.
   - `tech-spec/` populated? → Phase 2 done.
   - `design-system/mockups/` populated? → Phase 3 done.
   - `engine/` is a git repo with commits? → Phase 4.1 done.
   - `app/` has a Next.js project? → Phase 4.2 in progress or done.
   - Deployed Railway URL in `docs/readiness.md`? → Phase 4.4 done.
   - GitHub release v1.0.0 on engine repo? → Phase 6 done.
5. Resume at the first incomplete phase. Do NOT redo completed work.
6. If `docs/readiness.md` is missing or stale, reconstruct it from the directory state before doing anything else.

### Scenario C: The project is mid-phase and something broke

1. Read `docs/readiness.md` "Current blockers" section.
2. If the blocker is in the escape-hatches list in the master prompt, follow the hand-off instruction there.
3. If it's not, stop and write a specific question to the human in `docs/readiness.md` under "Open questions for human."

---

## Directory map

```
l99-prompt-handoff/
├── README.md                          ← you are here
├── CLAUDE.md                          ← project constants, read every session
├── 00-MASTER-BUILD-PROMPT.md          ← the build script, eight phases
├── docs/
│   ├── readiness.md                   ← living dashboard, update every phase
│   ├── methodology-reference.md       ← spine + worked Claude adapter
│   ├── archetype-list.md              ← the ten archetypes for V1
│   └── design-exclusion-charter.md    ← 20 banned UI patterns
├── validation/
│   ├── recruitment.md                 ← interview outreach message
│   └── interview-script.md            ← 20-min protocol with decision rules
├── business-plan/
│   └── v1-draft.md                    ← draft to refine in Phase 1
├── spike/                             ← Phase 0.5 throwaway prototype (empty)
├── tech-spec/                         ← Phase 2 outputs (empty)
├── design-system/                     ← Phase 3 outputs (empty)
├── app/                               ← Phase 4 production app (empty)
└── engine/                            ← Phase 4 open-source engine (empty)
```

---

## The five non-negotiables (memorize these)

1. **Zero retention of prompt content.** No content in logs, errors, analytics, or third parties. Ever.
2. **Deterministic engine.** No LLM call at generation time. String assembly only.
3. **Open-source engine.** Public GitHub repo, MIT license, auditable.
4. **Four clicks from arrival to paste-ready.** LLM → profile → archetype → describe → output.
5. **No prompt engineering jargon in user-facing copy.** Users see a working prompt, not the machinery.

If any decision compromises one of these, stop and re-plan.

---

## The six human checkpoints (mandatory)

Do not proceed past these without explicit approval from the human in the chat:

1. End of Phase 0 — environment ready
2. End of Phase 0.5 — validation synthesized, go/no-go on each decision rule
3. End of Phase 1 — business plan approved
4. End of Phase 2 — technical specification approved
5. End of Phase 3 — design direction approved via mockups
6. End of Phase 6 — explicit "ship it" before announcing

---

## The signature, the brand

This project is **Robic Direct Inc.** strategic AI advisory. Joel Robic, founder. All deliverables — the business plan, the website, the README of the open-source engine — sign accordingly. The aesthetic continues the **L99 Format Playbook** visual language: deep navy `#1F2F4A`, burnished copper `#A67C3D`, warm paper `#FDFCF8`, EB Garamond display and body, Inter UI, JetBrains Mono for code.

---

## When in doubt

Read the master prompt's `<self_critique>` rubric and ask whether the current decision passes. If not, the decision is wrong. Revise.
