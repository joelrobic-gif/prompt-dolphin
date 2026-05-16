# Package Index

> A one-glance map of what's in this handoff. Read in this order on first session.

---

## Read these (in order)

| # | File | What it is | Why first |
|---|------|------------|-----------|
| 1 | `README.md` | Orientation: starting fresh vs. resuming | Tells Claude Code which mode it's in |
| 2 | `CLAUDE.md` | Constants: non-negotiables, anchors, tooling | Loaded every session |
| 3 | `docs/readiness.md` | Living dashboard: where we are now | Source of truth on state |
| 4 | `00-MASTER-BUILD-PROMPT.md` | The build script: eight phases | The actual work plan |

## Reference these as needed

| File | What it is | When to consult |
|------|------------|-----------------|
| `docs/methodology-reference.md` | The seven-component spine + worked Claude adapter | Phase 2 (adapter format) and Phase 4 (engine implementation) |
| `docs/archetype-list.md` | The ten V1 archetypes | Phase 0.5 (interview Task B) and Phase 4 (archetype data files) |
| `docs/design-exclusion-charter.md` | 20 banned UI patterns with rationale | Every UI decision in Phase 3 and Phase 4 |
| `validation/recruitment.md` | Interview outreach messages | Phase 0.5 part B start |
| `validation/interview-script.md` | 20-min protocol with decision rules | Phase 0.5 part B execution |
| `business-plan/v1-draft.md` | Strategic foundation to refine | Phase 1 input |

## Empty scaffolds — Claude Code will populate these

- `spike/` — Phase 0.5 throwaway prototype
- `validation/` — interview notes (`interview-1-notes.md` through `interview-10-notes.md`) and `synthesis.md`
- `business-plan/v2/` — Phase 1 polished business plan, six sections
- `tech-spec/` — Phase 2 ten technical specification documents
- `design-system/` — Phase 3 design tokens, components, mockups, reference screenshots
- `app/` — Phase 4 production Next.js application
- `engine/` — Phase 4 open-source engine (separate git repo)

---

## Phase quick-map

| Phase | What gets built | Output goes to | Checkpoint |
|-------|-----------------|----------------|------------|
| 0 | Environment + GSTACK + scaffolding | `docs/readiness.md` | 1 |
| 0.5 | Throwaway prototype + 10 user interviews | `spike/`, `validation/` | 2 |
| 1 | Polished business plan in six sections | `business-plan/v2/` | 3 |
| 2 | Technical specification with worked adapter | `tech-spec/` | 4 |
| 3 | Design tokens + exclusion charter + mockups | `design-system/` | 5 |
| 4 | Engine + Next.js app + Railway deployment | `engine/`, `app/`, live URL | — |
| 5 | QA, visual regression, privacy automation | `tests/`, audit docs | — |
| 6 | Ship: GitHub release + production deploy | live custom domain | 6 |
| 7 | Retrospective + V2 backlog | `docs/phase-7-retro.md`, `docs/v2-backlog.md` | — |
| 8 | Optional: Claude skill + Copilot agent ports | `ports/` | — |

---

## Decision deferrals — issues Claude Code must NOT decide alone

These belong to the human and surface at their respective checkpoints:

1. **User-facing brand name.** Anvil, Forge, Signal, or other. Decided after Phase 0.5.
2. **Final Free tier limit.** 10/month is the proposal. Interview willingness-to-pay data informs the final number.
3. **Custom domain.** Required before Phase 4.4 deployment.
4. **GitHub organization** for the open-source engine repo.
5. **The 10 archetypes** are provisional until Phase 0.5 validates the list. Revise per the decision rule, not by intuition.
6. **Aesthetic direction in mockups** (Phase 3) must be approved before Phase 4.
7. **"Ship it"** before Phase 6 production deploy. Never deploy without explicit approval.

---

## The five non-negotiables — repeated because they matter

1. Zero retention of prompt content
2. Deterministic engine
3. Open-source engine
4. Four clicks from arrival to paste-ready
5. No prompt engineering jargon in user-facing copy

If a decision compromises one of these, the decision is wrong.
