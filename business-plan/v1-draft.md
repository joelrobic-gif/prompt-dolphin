# L99 Prompt — Business Plan v1 Draft

> **This is the working draft to refine in Phase 1.** It captures our prior strategic work and serves as the input for `/plan-ceo-review`. After Phase 0.5 validation, the plan gets sharpened with real user evidence and produced at v2 in six tight sections.

---

## 1. One-paragraph pitch

L99 Prompt is a privacy-first web service that turns a workplace task into a paste-ready, model-native, capability-aware prompt in sixty seconds. The user picks their LLM, picks the capability profile that matches their setup from three pre-built options, picks a task archetype, describes the job in one sentence, and copies a prompt engineered for their exact context. Nothing saved, nothing observed, nothing reused. The product opens a wedge into a $5B category that is currently saturated with prompt marketplaces and developer tools but has no serious answer for the knowledge worker with an LLM at their desk.

---

## 2. The problem

Three distinct breakages compound into the same outcome — underpowered AI use at work.

**Breakage one — different LLMs respond to different prompts.** Claude responds to XML tags and explicit structural scaffolding. GPT-5 responds to markdown delimiters and conversational brevity. Gemini wants meta-instructions at the top and specific questions at the bottom. Copilot expects tenant-grounding cues. Users do not know this, so the prompt that worked last week in ChatGPT produces a mediocre result this week in Claude, and the user concludes the model is worse. The problem was the prompt.

**Breakage two — different deployments have different capabilities.** Claude in the public app has memory and web search. Claude Enterprise has tenant connectors. ChatGPT Free browses the web but knows nothing about the user. ChatGPT Enterprise with connectors knows the user's email and Slack. Copilot in M365 has Outlook, Teams, SharePoint, OneDrive, calendar. Users routinely fail to invoke capabilities their tools quietly have.

**Breakage three — prompt assembly is a skill.** Role stacking, aesthetic anchoring, content architecture, exclusion lists, stakes framing, phased execution, self-critique loops — real, published, and well-documented techniques. Packaging them correctly into a task-shaped prompt every time is high-effort work. Most users skip it.

Existing products don't close any of these gaps. Prompt marketplaces sell static templates. Developer tools serve teams building AI products. Model-native libraries lock into one vendor. Educational content teaches theory. **None of them take a user's task and return the correct prompt for their exact LLM and capability surface.** That is the gap.

---

## 3. The solution

The user experience is minimalist by design:

1. Pick your LLM (one click)
2. Pick your setup from three capability profile cards (one click)
3. Pick the task archetype (one click)
4. Describe the task in one sentence (one text field)
5. Copy the generated prompt (one click)

Sixty seconds end-to-end. Four clicks, one text field, no account required.

Four design principles, non-negotiable:

- **Shortest path to paste-ready.** Maximum four clicks. No account wall on the Free tier.
- **Model-adaptive output, invisibly.** User never sees "XML tags" or "markdown delimiters." They see a prompt in their LLM's dialect. Full methodology embedded, translation silent.
- **Capability-aware via three recognizable profiles.** No multi-question quiz. Three cards, visual recognition, one click.
- **Zero data retention, provably.** Deterministic engine. No LLM call at generation time. Nothing leaves the system.

---

## 4. The model-adaptive engine — the technical moat

Every generated prompt embeds the same seven-component methodology (role, context, format, exclusions, reasoning, critique, examples), automatically translated into whatever dialect the target LLM speaks.

Three ingredients combine at generation time:
- A **methodology spine** held as a versioned JSON schema
- A **model adapter** rulebook file per supported LLM, encoding that model's idioms
- A **task archetype** library defining the substantive shape of each prompt type

Deterministic string assembly. No LLM call. Gross margin approaches 100%, privacy promise is provable, latency under 100ms.

The full worked Claude adapter lives in `docs/methodology-reference.md`. Every other adapter follows that pattern.

---

## 5. Market and competitive landscape

The prompt engineering category has matured into real market size. Fortune Business Insights estimates the prompt engineering software market at roughly $5B in 2026, dominated by software solutions (64% share). The AI prompt marketplace sub-segment alone was $1.4B in 2024, projected to reach $11B by 2033 — a 25.9% CAGR. HubSpot's 2025 State of AI report found 82% of marketers use generative AI weekly. Microsoft reported over one million Copilot licenses sold to Fortune 500 companies in 2024.

Existing products cluster in four groups, none of which serve the knowledge worker with an LLM at their desk:

| Cluster | Examples | Why it doesn't fit | Target user |
|---|---|---|---|
| Prompt marketplaces | PromptBase, AIPRM | Static, no adaptation, no awareness | Prompt buyers |
| Developer ops tools | PromptLayer, Langfuse, Vellum | Built for teams shipping AI products | Developers |
| Model-native libraries | OpenAI GPTs, Claude Projects | Locked to one vendor | Power users of one model |
| Educational content | Lakera guides, docs | Teaches theory, doesn't produce prompt | Learners |
| **L99 Prompt** | — | **Model-adaptive, capability-aware, zero-retention** | **The knowledge worker** |

**Addressable audience:**
- Total addressable: every knowledge worker using an LLM at work. ~500M globally in 2026.
- Serviceable: English-speaking business users with regular access to Claude, ChatGPT, Gemini, or Copilot. ~100M today.
- Beachhead: Microsoft 365 Copilot users at mid-market organizations in regulated industries (pharma, biotech, financial services), 250–5,000 employees. 3–5M users in North America.

---

## 6. Business model

Three revenue layers, reinforcing.

**Free tier — $0/mo.** 10 prompts per rolling 30 days, all LLMs, all profiles, all archetypes, zero retention, no account required. Proves value before any money changes hands.

**Pro tier — $12/mo (V1.5).** Unlimited prompts, browser-local prompt history, export, priority support. V1 has no auth and no Stripe — Pro upgrade is a single "Contact for Pro" mailto button that triggers a manual onboarding. Automation comes in V1.5.

**Team tier — $16/user/mo, min 5 seats (V2).** Shared archetype library, opt-in brand voice module, admin controls, SSO.

**Enterprise tier — custom, from $25k/yr (V2).** Custom archetypes, DPA, audit log, compliance integrations, on-prem option.

**Robic Direct Inc. consulting halo.** The tool is the front door. Behind it sits the strategic AI advisory practice. Workshops $15–25k, implementation engagements $100–250k.

**Unit economics:**
- Cost per generation: near-zero (deterministic, no LLM call)
- Gross margin: 95% Pro/Team, 85% Enterprise
- Pro CAC target: $20 blended, 2-month payback
- Enterprise CAC: $8k, first-year ACV $35–75k, payback within year one

**Year 1 (bootstrap-conservative):** ~10,000 free users, 500 Pro, 10 Team, 1 Enterprise → ~$110k ARR plus $250–500k consulting.

---

## 7. Go-to-market

Four channels, sequenced:

1. **The Playbook flywheel.** The L99 Format Playbook (Volume One, complete) and Volume Two (planned: prompt engineering for regulated industries) function as gated lead magnets.
2. **Regulated-industry LinkedIn.** Joel's natural network. Weekly thought leadership on AI in pharma. High engagement from a narrow audience.
3. **The M365 Copilot beachhead.** Direct outbound to mid-market heads of operations, chiefs of staff, and AI transformation leads at orgs with 250–5,000 employees. Pitch: "your people have Copilot; we make them good at it in five minutes."
4. **AI consultancy partnerships.** Regional Microsoft partners, specialized AI transformation firms. Revenue share on referred enterprise deals.

---

## 8. Product roadmap

- **Phase 0–0.5** — Environment + spike + 10 validation interviews
- **Phase 1–3** — Plan + spec + design system
- **Phase 4** — V1 production build (Free tier only)
- **Phase 6** — Ship (web flagship live)
- **V1.5** — Pro tier with auth and Stripe
- **V2** — Team and Enterprise tiers
- **Phase 8 (optional)** — Distribution ports: Claude skill, Copilot agent

---

## 9. Risks and mitigations

- **LLM vendors build this in.** Mitigation: vendor-neutral tool is the moat. Vendors won't optimize for competitors.
- **Free alternatives erode willingness to pay.** Mitigation: free tier is competitive by design; revenue engine is Team and Enterprise where differentiation matters.
- **Model APIs change and break adapters.** Mitigation: versioned rulebook with rapid update cycle; deterministic engine prevents cascade failures.
- **Privacy promise violated even once.** Mitigation: no content logging by design; open-source engine allows third-party audit; quarterly external privacy review.
- **Category gets commoditized.** Mitigation: depth via the Robic Direct consulting layer, brand voice learning, industry-specific archetypes — none of which commoditize.

---

## 10. The four compounding moats

1. **The maintained rulebook.** Model adaptation is a maintained asset that compounds. 6–12 months for a competitor to replicate meaningfully.
2. **Brand authority via the Playbook and consulting practice.** Robic Direct Inc. as strategic AI advisory, not just SaaS brand.
3. **Network effects in Team and Enterprise tiers (V2).** Shared archetype libraries improve with use. Brand voice modules sharpen.
4. **Consulting flywheel.** Enterprise customers generate consulting leads; consulting engagements surface new archetype needs; product funds consulting capacity.

---

## 11. The team and the brand

**Founder:** Joel Robic, strategic AI advisor with operator experience in pharmaceutical strategy and quantitative finance.

**Brand:** Robic Direct Inc. — the Stripe Press of prompt engineering. High-aesthetic, strategic, trusted, restrained. Not a marketplace. Not a developer tool. Not commodity SaaS.

**Open decision:** User-facing brand. Candidates: Anvil (tool-metaphor, top pick), Forge (similar), Signal (methodology-metaphor). Decided after Phase 0.5.

---

## 12. The 90-day plan

- **Weeks 1–2** — Phase 0 (environment) and Phase 0.5 (spike + 10 interviews).
- **Weeks 3–4** — Phase 1 (business plan v2 finalized based on validation).
- **Weeks 5–6** — Phase 2 (technical spec) and Phase 3 (design system).
- **Weeks 7–10** — Phase 4 (production build).
- **Weeks 11–12** — Phase 5 (QA) and Phase 6 (ship).
- **Post-launch** — Phase 7 (retrospective) and content cadence begins.

---

*This is a v1 draft for Phase 1 refinement. After Phase 0.5 validation findings land, this plan gets sharpened, sourced, and produced as the polished v2 in six tight sections.*
