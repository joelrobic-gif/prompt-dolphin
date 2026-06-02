/**
 * src/prompt-engineer/few-shot/examples-bank.js
 *
 * L99 PE-Phase 4: few-shot examples per archetype.
 *
 * One concrete <example> block per archetype, sourced from public
 * exemplars (Bloomberg, Stratechery, The Information, McKinsey,
 * Sequoia memos, Stripe Atlas). Examples are short (<400 words each)
 * so they don't bloat the envelope, but rich enough to anchor tone
 * and density expectations.
 *
 * Engine consumes these via pickExamples(archetype, n) and injects
 * inside the envelope as <example>...</example> blocks. Default n=1.
 */

export const FEW_SHOT_BANK_VERSION = '1.0.0';

const EXAMPLES = Object.freeze({
  email: [
    {
      label: 'CFO burn-rate update (terse, single-ask)',
      text: `Subject: Q3 burn - $4.2M, 14mo runway, one ask

Hi Sarah,

Q3 cash burn closed at $4.2M (vs $4.0M plan, +5%). Variance driven by an unplanned $180K capitalized on the Boston lease retrofit and one early R&D hire ($95K loaded).

Bank balance is $58.4M as of 9/30. At current burn, runway is 14.1 months - past the Series C window we modeled (Q1 of next year).

Ask: please approve the $250K reforecast for Q4 (memo attached) by Friday so we can lock the December headcount plan.

Thanks,
Joel`,
    },
  ],

  strategy: [
    {
      label: 'Acquire vs partner decision memo (Sequoia-style)',
      text: `Question: should we acquire CompanyX or partner via licensing?

Answer in three sentences: acquire. Their RWE pipeline doubles our addressable indications inside 18 months; partnering caps our upside at the data layer when the IP arbitrage sits in the predictive model. The $42M-$55M sticker is 4x revenue but 1.4x our weighted-NPV of organic build, and the integration risk is bounded because their 6-person ML team is already remote-first.

Three options considered:
1. Full acquisition ($42-55M, 18-mo integration, takes us to category leader).
2. Exclusive license + co-development ($8M upfront, 7% royalty, 36-mo build).
3. Build internally (24-mo, $18M loaded cost, 60% prob of feature parity).

Recommended: option 1. Defensible because: (a) NPV-weighted 1.4x organic, (b) talent retention covenant tied to 60% of consideration in earnout, (c) we already share two design partners so commercial integration is de-risked.

Top three risks: (1) regulator (FTC) review under Hart-Scott-Rodino - low because no horizontal overlap; (2) culture, addressed via earnout structure; (3) data-rights cleanliness, audit in diligence (Week 2-4).`,
    },
  ],

  meeting: [
    {
      label: 'Board prep for Series B (chief of staff)',
      text: `Objective: secure approval for $40M Series B at $180M pre, leading existing investors + one strategic.

Background (3):
- Pipeline: Lead asset on track for IND Q2; backup candidate selected last sprint.
- Cash: $14M, 9.5 months runway at current burn; cushion to Q4 of next year if we close by Sept.
- Market: comp set repriced 22% YTD; our last round was at $110M post.

Key questions board must resolve:
1. Approve $180M pre target, or stretch to $200M with longer process risk?
2. Permit secondary participation (up to $5M) for early employees?
3. Endorse lead-investor shortlist (4 firms) or expand to 6?

Decision framework: vote A/B/C on each; abstentions count as A.

Pre-read: term sheet comp table (3pp), runway model w/ 3 scenarios (1pp), data-room readiness checklist (1pp).`,
    },
  ],

  slides: [
    {
      label: 'Insight-titled board update (Minto, slide outline)',
      text: `[SLIDE 1 - Lead asset cleared IND-enabling tox; 6-mo runway recovered]
- Tox readout +3 weeks ahead of plan; no DLTs at all dose levels
- FDA pre-IND meeting scheduled for next month
- Cash extension via tox-savings: 9.5 -> 10.1 months
[SPEAKER NOTES: 2 sentences anchoring why this de-risks the Series B narrative]

[SLIDE 2 - Backup program now the gating risk]
- Lead selection delayed 6 weeks; CMC scale-up the bottleneck
- $1.2M variance vs plan; mitigation contract w/ CDMO signed last week
- Net: backup IND slips from Q3 -> Q4 of next year
[SPEAKER NOTES: position as "managed risk, not crisis"]

[SLIDE 3 - Cash position supports planned milestones, no bridge needed]
- $14M today, 9.5mo at current burn
- Bridges only if Series B slips past December
- Recommendation: hold raise timeline, do not bridge`,
    },
  ],

  research: [
    {
      label: 'Competitive landscape synthesis (Stratechery-style)',
      text: `Key findings:
1. mRNA platforms have bifurcated into two product strategies: (a) prophylactic vaccines as cash-flow business; (b) personalized cancer vaccines as the long-cycle bet. Both Pfizer/BioNTech and Moderna are running this playbook; CureVac is the outlier optimizing for self-amplifying constructs.
2. The next 18 months are defined by manufacturing economics, not biology. Lipid-nanoparticle yield improvements (30-40% reported by Acuitas, 50%+ projected by Genevant) compress per-dose COGS from $4 to $2.40. This shifts personalized-cancer-vaccine economics from infeasible to gross-margin-positive.
3. Regulatory pathway uncertainty for personalized mRNA is the dominant risk. FDA has not yet defined a stable expedited pathway; EMA's PRIME designation has been applied case-by-case.

Evidence per finding:
- (1) Source: Moderna 10-Q Q3, BioNTech investor day, CureVac SEC filings.
- (2) Sources: Acuitas conference paper, Genevant tech-day disclosure, Cytiva CMO economics report.
- (3) Sources: FDA CDER published guidance index (last update: 14 months ago), EMA PRIME register.

Implications:
- For an entrant: target the manufacturing layer or the regulatory data layer, not the biology layer.
- For an investor: discount platform claims by 30% until LNP yield ceiling is empirically validated in a clinical-scale run.

Open questions:
- Does the FDA personalized-pathway guidance arrive in the next 12 months? (binary on regulatory PR cycle)
- Does any incumbent open-source LNP optimization data? (low probability, high impact)`,
    },
  ],

  regulatory: [
    {
      label: 'FDA pre-IND meeting briefing (formal)',
      text: `MEETING REQUEST: Pre-IND Type B
Sponsor: [Company]
Product: [Antibody candidate]
Indication: [target indication]
Reference: 21 CFR 312.82(b); FDA Guidance, "Formal Meetings Between the FDA and Sponsors or Applicants of PDUFA Products"

Specific questions for the Agency:
1. Does the Division concur that the proposed nonclinical package (in vitro pharmacology + 4-week GLP rat tox + 4-week GLP NHP tox) is sufficient to support the Phase 1 first-in-human protocol in the attached IND-enabling section?
2. Does the Division concur with the proposed starting dose (0.1 mg/kg IV, derived from PAD/HNSTD with 10x safety factor per ICH S9)?
3. Does the Division concur with the proposed Phase 1 dose-escalation design (single ascending dose followed by multiple ascending dose, BOIN adaptive)?
4. Does the Division have any feedback on the proposed CMC information at IND stage, specifically the Phase 1 manufacturing process and proposed stability program?

Required data attachments:
- Investigator's Brochure draft (Section 4.0)
- Nonclinical study reports (GLP tox: 4-week rat, 4-week NHP)
- Phase 1 protocol synopsis
- CMC summary

Assumptions flagged:
- PK/PD assumes minimal antibody-mediated cytotoxicity; if Agency requests in vivo PD bridging, sponsor will respond with proposed in vivo PD model in writing within 30 days.
- Starting dose derived under conservative interpretation of ICH S9; sponsor would consider higher starting dose if Agency provides rationale.

Sponsor will incorporate all Agency feedback into the IND submission, planned for Q1 of next year.`,
    },
  ],

  investor: [
    {
      label: 'Q3 update - pipeline + cash, candid (no hype)',
      text: `Q3 investor update

Pipeline progress:
- Lead asset cleared GLP tox in both species; IND-enabling package complete; FDA pre-IND meeting scheduled for Q4.
- Backup program lead-candidate selection delayed by 6 weeks. CMC scale-up was the bottleneck; CDMO contract now signed. Net: backup IND timing moves from Q3 -> Q4 of next year. We do not view this as material to the overall pipeline narrative but want it visible.

Catalysts ahead with timelines:
- Pre-IND meeting feedback: Q4.
- IND filing (lead): Q1 of next year.
- First-in-human dose: Q3 of next year (assuming IND clearance + site activation timelines).
- Backup IND: Q4 of next year.

Financial position:
- Cash and equivalents: $14.2M as of 9/30.
- Q3 burn: $4.2M (vs $4.0M plan; variance discussed in attached memo).
- Runway: ~9.5 months at current burn; extends to ~11 months under previously communicated cost-curve plan.

Candid outlook:
- Series B target $40M at $180M pre. Conditions in the comp set repriced 22% YTD. We have begun outreach but have not yet selected a lead. If the round slips past December, a bridge facility (already term-sheeted at $8M, 15% discount) will activate.
- Top risk: backup-program timing slippage cascading into investor narrative for Series B. Mitigation: lead asset is the value driver; backup is a hedge, not the case.

Forward-looking statements: any statements above regarding IND timing, pre-IND outcomes, or Series B pricing are forward-looking and subject to change.`,
    },
  ],

  html_news_report: [
    {
      label: 'Bloomberg-style brief (HTML fragment, scannable)',
      text: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Weekly: AI-agent infrastructure</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:760px;margin:auto;padding:24px;color:#0f172a;line-height:1.6}h1{font-size:34px;margin:0 0 8px}h2{font-size:24px;margin:24px 0 8px}.dek{font-size:18px;color:#475569;margin:0 0 16px}.tldr{background:#f1f5f9;border-left:3px solid #0f172a;padding:12px 16px;font-size:15px;margin:16px 0}article{padding:16px 0;border-bottom:1px solid rgba(15,23,42,.1)}.sources{font-size:13px;color:#64748b}a{color:#0f172a}</style>
</head>
<body>
<header>
  <h1>AI-Agent Infrastructure - Weekly Brief</h1>
  <p class="dek">Five developments shaping how production agents get built, deployed, and observed.</p>
  <p>As of [date] - sources cited inline.</p>
  <div class="tldr">Tool-use latency drops 40% on Anthropic's new computer-use beta; LangChain raises Series B at $1.1B; OpenAI publishes agent-evals harness; AWS Bedrock adds agent-orchestration primitives; Sierra positions at $4.5B valuation.</div>
</header>
<main>
<article>
  <h2>Anthropic ships computer-use latency improvements</h2>
  <p>Tool-call round-trip latency on the computer-use beta dropped from a median 2.4s to 1.45s in a third-party benchmark by <a href="#1">Browserbase</a>. The change is attributed to a new caching layer in the screenshot pipeline.</p>
  <p>Significance: makes agent loops viable for time-sensitive workflows (form-filling, scheduled tasks) that were previously bounded by tool-call latency.</p>
</article>
<article>
  <h2>LangChain Series B at $1.1B led by Sequoia</h2>
  <p>According to <a href="#2">The Information</a>, LangChain raised a $100M Series B at a $1.1B post-money. Sequoia led with participation from Benchmark.</p>
  <p>Significance: validates the orchestration-layer thesis; pricing implies the market expects vendor consolidation around 1-2 mid-layer toolkits.</p>
</article>
</main>
<footer>
  <p>Published [date]. Compiled from public sources.</p>
  <ol class="sources">
    <li>Browserbase - "Computer-Use Benchmark v2" - [URL]</li>
    <li>The Information - "LangChain raises Series B" - [URL]</li>
  </ol>
</footer>
</body>
</html>`,
    },
  ],

  general: [
    {
      label: 'Concept explainer (CAP theorem-style, concrete)',
      text: `Direct answer: in any distributed data store you can guarantee at most two of three properties simultaneously - Consistency, Availability, Partition tolerance.

Reasoning: when a network partition splits the system into two halves that cannot communicate, every node has to make a local choice. It can either (a) refuse writes to preserve consistency and lose availability, or (b) accept writes optimistically and reconcile later, trading consistency for availability. Partition tolerance is not optional in practice (networks fail), so the real choice in any production system is C-vs-A under partition.

Concrete next steps:
- For an OLTP database (banking, accounts): choose CP - Spanner, CockroachDB, MongoDB w/ majority writes.
- For a high-fanout cache or session store: choose AP - DynamoDB, Cassandra, Redis Cluster eventually-consistent mode.
- Before picking, write down the SLO for "what happens during a partition" and the rollback ergonomics for any inconsistency window.`,
    },
  ],
});

/**
 * Pick N few-shot examples for an archetype. Returns array of {label, text}.
 * Falls back to 'general' if archetype unknown. n defaults to 1 (cost discipline).
 */
export function pickExamples(archetype, n = 1) {
  const pool = EXAMPLES[archetype] || EXAMPLES.general;
  return pool.slice(0, Math.max(0, n));
}

/**
 * Render examples as XML <example> blocks for envelope injection.
 * Returns empty string if n=0 or no examples available.
 */
export function renderExamplesXml(archetype, n = 1) {
  const picked = pickExamples(archetype, n);
  if (picked.length === 0) return '';
  return picked.map((ex) => `<example>\n<!-- ${ex.label} -->\n${ex.text}\n</example>`).join('\n\n');
}

export const ALL_ARCHETYPE_KEYS = Object.freeze(Object.keys(EXAMPLES));
