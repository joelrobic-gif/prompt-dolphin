// PromptDolphin Engine v2 — TypeScript port for spike (Next.js bundling)
// Canonical source: D:/prompt-dolphin/engine-v2/  →  github.com/joelrobic-gif/promptdolphin-engine
// Mirrors src/*.mjs + JSON archetypes/adapters. Keep in sync.
// MIT License — Robic Direct Inc.

export type ArchetypeId =
  | 'executive_email'
  | 'meeting_prep'
  | 'research_synthesis'
  | 'presentation_deck'
  | 'data_analysis'
  | 'pharma_regulatory'
  | 'biotech_investor'
  | 'due_diligence'
  | 'post_incident'
  | 'board_brief'
  | 'strategy_brief'
  | 'meta_prompt'
  | 'trading_system'
  | 'system_design'
  | 'general';

export type AdapterId = 'claude' | 'chatgpt' | 'gemini' | 'copilot' | 'grok';

export type QualityId =
  | 'quick_verdict'
  | 'fast_detailed'
  | 'comprehensive'
  | 'strategic_depth'
  | 'exhaustive_research';

export interface Signal { pattern: string; weight: number }
export interface Archetype {
  id: ArchetypeId;
  label: string;
  role: string;
  context: string;
  format: string;
  exclusions: string;
  reasoning: string;
  critique: string;
  examples: string[];
  signals: Signal[];
}

export interface AdapterBlock { name: string; open: string; close: string }
export interface Adapter { id: AdapterId; label: string; separator: string; blocks: AdapterBlock[] }

export interface QualityAxisPreset {
  label: string;
  blurb: string;
  depth: { maxWords: number; summary: string };
  reviewMode: 'standard' | 'peer_review' | 'red_team' | 'red_team_plus_peer' | null;
  reasoning: 'minimal' | 'standard' | 'expanded' | 'structured' | 'full';
  richMedia: 'visuals' | 'video_script' | 'image_prompts' | 'presentation_package' | null;
}

// ============================================================================
// ARCHETYPES (15)
// ============================================================================

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  executive_email: {
    id: 'executive_email',
    label: 'Executive email',
    role: 'a senior executive communications director with 20 years writing clear, direct business correspondence',
    context: 'Focus on clarity, tone, and a single specific ask. Reader is busy and senior.',
    format: 'Subject line | Opening sentence stating purpose | Body 2-3 short paragraphs | Explicit ask | Sign-off',
    exclusions: 'Active voice throughout. Every sentence earns its place — cut filler (just/really/I hope this finds you well). Max 250 words. Make the ask unambiguous.',
    reasoning: 'Identify the single ask. Identify the decision the reader must make. Sequence: hook -> stakes -> ask.',
    critique: 'Is the ask crystal clear in 30 seconds? Is the tone right for the reader\'s seniority? Under 250 words?',
    examples: ['TO CEO requesting Q3 budget reallocation', 'TO board chair flagging executive search delay'],
    signals: [
      { pattern: '\\bemail\\b', weight: 5 },
      { pattern: '\\bwrite (an? )?(email|message|letter|note) to\\b', weight: 10 },
      { pattern: '\\b(draft|compose) (an? )?(email|message|reply)\\b', weight: 10 },
      { pattern: '\\bcorrespondence\\b', weight: 4 },
      { pattern: '\\breply to\\b', weight: 5 },
      { pattern: '\\bsubject line\\b', weight: 6 },
      { pattern: '\\bcold outreach\\b', weight: 7 },
    ],
  },
  meeting_prep: {
    id: 'meeting_prep',
    label: 'Meeting prep',
    role: 'a chief of staff and senior executive advisor',
    context: 'Synthesize context, objectives, and decisions this meeting must drive. Assume the principal has 10 minutes to prep.',
    format: 'Objective | Background (3 bullets) | Key questions (3-5) | Decision framework | Pre-read links',
    exclusions: 'Tailor every line to this exact meeting and these exact attendees. One page max. Concrete specifics over generic advice.',
    reasoning: 'Identify the decision this meeting exists to make. Sequence: what we know -> what we need to learn -> what we will decide.',
    critique: 'Would a senior leader walk in fully prepared? Are the questions sharp enough to drive a decision?',
    examples: ['QBR with regional sales VP', 'Board pre-read for clinical readout review'],
    signals: [
      { pattern: '\\bmeeting\\b', weight: 5 },
      { pattern: '\\bprep(are)? for\\b', weight: 7 },
      { pattern: '\\bagenda\\b', weight: 6 },
      { pattern: '\\bqbr\\b', weight: 8 },
      { pattern: '\\bbrief for\\b', weight: 6 },
      { pattern: '\\bdebrief\\b', weight: 5 },
      { pattern: '\\b1[:-]?1\\b|\\bone[ -]on[ -]one\\b', weight: 6 },
      { pattern: '\\boff[ -]?site\\b', weight: 5 },
    ],
  },
  research_synthesis: {
    id: 'research_synthesis',
    label: 'Research synthesis',
    role: 'a senior research analyst with deep domain training and editorial discipline',
    context: 'Synthesize multiple sources into one coherent argument. Distinguish fact from interpretation. Flag uncertainty.',
    format: 'Key findings (3-5) | Evidence per finding with citation | Cross-source contradictions | Implications | Open questions',
    exclusions: 'Cite every external source. Flag every uncertainty inline. Present only verified claims — label speculation as speculation.',
    reasoning: 'Group claims by topic. Triangulate across sources. Surface contradictions explicitly. Rank findings by confidence.',
    critique: 'Is every finding evidenced? Are implications drawn from the evidence rather than assumed? Is uncertainty visible?',
    examples: ['Synthesize 5 analyst reports on GLP-1 market sizing', 'Compare 3 academic papers on CAR-T toxicity profiles'],
    signals: [
      { pattern: '\\bresearch\\b', weight: 4 },
      { pattern: '\\bsummari[sz]e\\b', weight: 5 },
      { pattern: '\\bsynthesi[sz]e\\b|\\bsynthesis\\b', weight: 8 },
      { pattern: '\\banalyze\\b.*\\b(papers|articles|reports|literature|sources)\\b', weight: 9 },
      { pattern: '\\bliterature review\\b', weight: 10 },
      { pattern: '\\bcompare .* (papers|studies|articles|reports)\\b', weight: 9 },
      { pattern: '\\bmarket research\\b', weight: 6 },
    ],
  },
  presentation_deck: {
    id: 'presentation_deck',
    label: 'Presentation deck',
    role: 'a senior strategy consultant designing Minto-pyramid presentations for C-suite audiences',
    context: 'Minto pyramid: answer first, then support with evidence. The deck must hold together without spoken narration.',
    format: 'Insight-titled slides | Max 35 words body per slide | Situation -> Complication -> Resolution arc | Speaker notes per slide',
    exclusions: 'Write insight titles, not topic titles. Keep body text lean — about 35 words per slide. Max 12 slides unless explicitly approved.',
    reasoning: 'Pick the single message. Sequence as pyramid: governing thought, then key supporting arguments, then evidence per argument.',
    critique: 'Does each slide title state the insight? Does the deck flow as a coherent narrative? Could a stranger follow it without you talking?',
    examples: ['Board deck recommending platform consolidation', 'Investor update on Phase 2 readout'],
    signals: [
      { pattern: '\\bslide(s|deck)?\\b', weight: 7 },
      { pattern: '\\bdeck\\b', weight: 7 },
      { pattern: '\\bpresentation\\b', weight: 6 },
      { pattern: '\\bpowerpoint\\b|\\bkeynote\\b|\\bpptx?\\b', weight: 9 },
      { pattern: '\\bboard update\\b', weight: 7 },
      { pattern: '\\btown ?hall\\b', weight: 6 },
    ],
  },
  data_analysis: {
    id: 'data_analysis',
    label: 'Data analysis',
    role: 'a senior data analyst fluent in statistics, SQL, and business storytelling',
    context: 'Move from raw data or question to insight. Show your method so a reviewer can reproduce. Distinguish correlation from causation.',
    format: 'Question | Data + assumptions | Method | Findings (ranked) | Caveats + confidence | Recommended next analysis',
    exclusions: 'Show the method behind every insight. Reserve causal language for designs that support it. Flag missing data and sample limitations.',
    reasoning: 'State the question precisely. Choose the simplest method that answers it. Show calculation steps. Stress-test the finding.',
    critique: 'Could a reviewer reproduce the analysis? Are the caveats stronger than the headline? Is the confidence calibrated?',
    examples: ['Why did Q3 churn spike in EMEA mid-market?', 'Estimate revenue impact of switching from monthly to annual billing'],
    signals: [
      { pattern: '\\banalyze\\b(?! .* (paper|article|report|literature))', weight: 6 },
      { pattern: '\\bdata( |-)?analysis\\b', weight: 10 },
      { pattern: '\\bquantif(y|ication)\\b', weight: 6 },
      { pattern: '\\bsql\\b|\\bquery\\b', weight: 5 },
      { pattern: '\\bchurn|conversion|retention|cohort|funnel\\b', weight: 7 },
      { pattern: '\\b(what|why|how much) .*(spike|drop|increase|decrease|change|trend)\\b', weight: 5 },
      { pattern: '\\bestimate .*(impact|revenue|cost|lift)\\b', weight: 7 },
    ],
  },
  pharma_regulatory: {
    id: 'pharma_regulatory',
    label: 'Pharma regulatory',
    role: 'a senior regulatory affairs strategist with 15+ years FDA / Health Canada / EMA / TGA / MHRA experience',
    context: 'Regulatory-grade precision. No internal jargon. No unsupported superiority claims. Match agency expectations for the named pathway.',
    format: 'Formal structure | Agency + pathway reference | Specific requirements | Required data | Risk areas + mitigations',
    exclusions: 'No superiority claims without head-to-head data. No internal codenames. Flag every assumption. Lawyer-grade precision on indication wording.',
    reasoning: 'Start from the regulatory ask. Map to agency pathway. Identify required data package. Surface gaps. Propose remediation.',
    critique: 'Would a regulatory reviewer accept this? Are all claims qualified appropriately? Is the data package complete?',
    examples: ['Prepare Type B meeting briefing book for FDA on accelerated approval pathway', 'Draft Health Canada NDS regulatory strategy for biosimilar'],
    signals: [
      { pattern: '\\bregulatory\\b', weight: 6 },
      { pattern: '\\bsubmission\\b', weight: 5 },
      { pattern: '\\bfda\\b|\\bhealth canada\\b|\\bema\\b|\\btga\\b|\\bmhra\\b', weight: 9 },
      { pattern: '\\b(nda|bla|nds|cta|ind)\\b', weight: 10 },
      { pattern: '\\b(type [abc]|breakthrough|accelerated approval|orphan)\\b', weight: 9 },
      { pattern: '\\bclinical trial application\\b', weight: 8 },
    ],
  },
  biotech_investor: {
    id: 'biotech_investor',
    label: 'Biotech investor update',
    role: 'a CFO and investor relations director in biotech / life sciences with public company disclosure experience',
    context: 'Be candid. Bad news must be as prominent as good news. No hype, no boilerplate.',
    format: 'Pipeline progress | Catalysts ahead with timelines | Financial position (cash runway) | Risks | Candid outlook',
    exclusions: 'Give bad news equal prominence to good news. Plain candid language — zero hype, zero boilerplate. Label every forward-looking statement. No undisclosed material information.',
    reasoning: 'Anchor in last update. Surface what changed. Update timelines honestly. Calibrate confidence per program.',
    critique: 'Would an institutional investor trust this? Is bad news visible without hunting? Are timelines defensible?',
    examples: ['Q3 investor update following Phase 2b readout', 'Annual letter from CEO to shareholders post-restructuring'],
    signals: [
      { pattern: '\\binvestor\\b', weight: 7 },
      { pattern: '\\bquarterly update\\b|\\bq[1-4] update\\b', weight: 9 },
      { pattern: '\\bpipeline progress\\b', weight: 8 },
      { pattern: '\\bbiotech update\\b', weight: 8 },
      { pattern: '\\bshareholder letter\\b|\\bcompany update\\b', weight: 7 },
      { pattern: '\\bcash runway\\b', weight: 6 },
      { pattern: '\\bclinical (data|readout|update)\\b', weight: 6 },
    ],
  },
  due_diligence: {
    id: 'due_diligence',
    label: 'Due diligence',
    role: 'a senior M&A / venture diligence lead with operating background and forensic instincts',
    context: 'Surface what could kill the deal. Look past the deck. Cite source for every claim. Sequence findings by severity.',
    format: 'Deal thesis (1 line) | Confirmatory findings | Disconfirmatory findings | Hidden risks | Open items requiring management Q&A | Recommendation',
    exclusions: 'Source every number — never assume one. Interrogate the seller deck rather than repeating it. Flag every reliance item and source provenance.',
    reasoning: 'Build a kill-the-deal hypothesis tree. Test each branch against evidence. Rank by severity x likelihood.',
    critique: 'Have we tested the bear case? Is every number sourced? Are the open items specific enough for a management call?',
    examples: ['Diligence on Series B medtech target with pre-revenue clinical claims', 'Commercial DD on B2B SaaS with concentrated customer base'],
    signals: [
      { pattern: '\\bdue diligence\\b|\\bdiligence\\b', weight: 10 },
      { pattern: '\\bm&a\\b|\\bacquisition\\b|\\btarget company\\b', weight: 7 },
      { pattern: '\\binvestment memo\\b|\\bic memo\\b', weight: 9 },
      { pattern: '\\bdeal review\\b', weight: 7 },
      { pattern: '\\bcommercial dd\\b|\\bfinancial dd\\b|\\btechnical dd\\b', weight: 10 },
      { pattern: '\\bdata room\\b', weight: 7 },
    ],
  },
  post_incident: {
    id: 'post_incident',
    label: 'Post-incident review',
    role: 'an SRE / incident commander writing blameless post-mortems trusted by engineering and leadership',
    context: 'Blameless. Focus on systems and signals, not individuals. Optimize for preventing the next incident.',
    format: 'TL;DR | Timeline (UTC) | Impact | Root cause | Contributing factors | What went well | What went badly | Action items with owners + dates',
    exclusions: 'Blameless throughout — systems and signals, not individuals. Every action item specific, with owner and date. Judge decisions by what was knowable at the time, not hindsight.',
    reasoning: 'Reconstruct timeline from logs / tickets / chat. Distinguish trigger from root cause. Test each contributing factor for control feasibility.',
    critique: 'Is it blameless in tone? Are action items specific, owned, dated, and verifiable? Does it explain the why, not only the what?',
    examples: ['Post-mortem on Saturday production database failover', 'Post-incident review after data exfiltration via misconfigured S3 bucket'],
    signals: [
      { pattern: '\\bpost[ -]?mortem\\b', weight: 10 },
      { pattern: '\\bpost[ -]?incident\\b', weight: 10 },
      { pattern: '\\bincident review\\b|\\bincident report\\b', weight: 10 },
      { pattern: '\\brca\\b|\\broot cause analysis\\b', weight: 9 },
      { pattern: '\\boutage\\b|\\bdowntime\\b|\\bsev[ -]?[012]\\b', weight: 7 },
      { pattern: '\\bretrospective\\b', weight: 5 },
    ],
  },
  board_brief: {
    id: 'board_brief',
    label: 'Board brief',
    role: 'a corporate secretary and chief of staff drafting board-ready briefing materials for a public-company board',
    context: 'Board members are senior, time-constrained, and bring outside perspective. Surface decisions needed. Anticipate questions.',
    format: 'One-line ask | Background (5 bullets) | Options considered | Recommended path | Risks | Questions for the board | Appendix references',
    exclusions: 'Stay at board altitude — decisions and risks, not operating minutiae. Name material risks plainly. Present internal disagreement honestly, never as false consensus.',
    reasoning: 'Identify what the board must decide vs be informed of. Pre-empt the three sharpest questions a director will ask.',
    critique: 'Is the ask explicit? Are risks named honestly? Could a director walk in informed in 15 minutes?',
    examples: ['Board memo recommending CFO succession plan', 'Audit committee brief on cybersecurity incident exposure'],
    signals: [
      { pattern: '\\bboard brief(ing)?\\b', weight: 10 },
      { pattern: '\\bboard memo\\b', weight: 10 },
      { pattern: '\\bboard pre[ -]?read\\b', weight: 9 },
      { pattern: '\\baudit committee\\b|\\bcompensation committee\\b|\\bnominating committee\\b', weight: 8 },
      { pattern: '\\bbod\\b|\\bboard of directors\\b', weight: 7 },
      { pattern: '\\bdirector(s)? memo\\b', weight: 8 },
    ],
  },
  strategy_brief: {
    id: 'strategy_brief',
    label: 'Strategy brief',
    role: 'a senior strategy consultant and former McKinsey / BCG / Bain partner',
    context: 'Apply structured strategic thinking. Take a clear position. Present options with rationale and trade-offs.',
    format: 'Exec summary (3 sentences) | Strategic options (3-5) | Recommended path with reasoning | Top 3 risks + mitigations | Decision needed',
    exclusions: 'Take a clear position and defend it. Weigh the sides, then commit to one recommendation. Max 500 words main body.',
    reasoning: 'Frame the decision. Generate genuinely distinct options. Score each on value, feasibility, time, risk. Pick. Defend.',
    critique: 'Is the recommendation defensible? Are the options actually distinct or strawmen? Does it advance a clear position?',
    examples: ['Build vs buy decision for ML inference platform', 'Market entry strategy for European launch'],
    signals: [
      { pattern: '\\bstrateg(y|ic)\\b', weight: 6 },
      { pattern: '\\bshould we\\b', weight: 7 },
      { pattern: '\\brecommend\\b', weight: 5 },
      { pattern: '\\boptions for\\b', weight: 6 },
      { pattern: '\\bbuild (or|vs\\.?) buy\\b|\\bmake (or|vs\\.?) buy\\b', weight: 10 },
      { pattern: '\\bmarket entry\\b|\\bgo[ -]to[ -]market\\b|\\bgtm\\b', weight: 8 },
      { pattern: '\\bcompetitive positioning\\b', weight: 7 },
    ],
  },
  meta_prompt: {
    id: 'meta_prompt',
    label: 'Meta prompt (build me a prompt)',
    role: 'a senior prompt engineer who designs production-grade prompts for LLM-driven systems',
    context: 'The user wants a PROMPT, not the output of a prompt. Produce a fully formed reusable prompt with role/context/format/constraints/critique sections, parameterized for the user\'s stated use case. Do NOT solve the underlying task.',
    format: 'PROMPT TITLE | INTENDED MODEL | PARAMETERS (named placeholders) | THE PROMPT (verbatim, ready to paste) | USAGE NOTES | EXAMPLE FILLED-IN INVOCATION',
    exclusions: 'Do NOT execute or answer the embedded task. Do NOT add commentary inside the prompt body itself. Do NOT hallucinate constraints the user did not request.',
    reasoning: 'Extract the user\'s underlying job-to-be-done. Decide the right archetype FOR the prompt they need. Design the spine. Parameterize variable parts. Add one worked example.',
    critique: 'Is the output a paste-ready prompt rather than an answer? Are placeholders explicit? Would a non-expert know how to fill it in?',
    examples: ['Build me a prompt I can reuse weekly to summarize my team\'s standups', 'Give me a prompt that takes a stock ticker and returns a 1-page bull/bear analysis'],
    signals: [
      { pattern: '\\b(build|create|design|give me|generate|write) (me )?(a |an )?prompt\\b', weight: 12 },
      { pattern: '\\bprompt (that|which|to|for)\\b', weight: 10 },
      { pattern: '\\breusable prompt\\b|\\bprompt template\\b', weight: 12 },
      { pattern: '\\bsystem prompt\\b', weight: 11 },
      { pattern: '\\bmeta[ -]?prompt\\b', weight: 12 },
      { pattern: '\\bllm prompt\\b|\\bgpt prompt\\b|\\bclaude prompt\\b', weight: 11 },
    ],
  },
  trading_system: {
    id: 'trading_system',
    label: 'Trading / quant system',
    role: 'a senior quantitative trader and systematic-strategy architect with execution, risk, and compliance fluency',
    context: 'Treat any trading idea as a system: signal, sizing, execution, risk, monitoring, kill-switch. Refuse to ship hand-wavy P&L claims. Distinguish backtest from live.',
    format: 'Strategy thesis | Universe + data sources | Entry / exit signal | Sizing + portfolio constraints | Execution venue + slippage assumptions | Risk controls + kill-switch | Monitoring + alerting | Backtest design + caveats | Capital + cost requirements',
    exclusions: 'Disclose backtest design behind every performance claim. Treat the system as continuously monitored — never \'set and forget\'. Name regulatory + tax surface. Flag overfitting risk.',
    reasoning: 'Decompose into signal -> sizing -> execution -> risk -> monitoring. Stress every layer for failure mode. Map to broker capability.',
    critique: 'Is every layer of the system specified? Are failure modes named? Could a quant peer build it from this spec?',
    examples: ['IBKR autotrading biotech catalyst strategy spec', 'Pairs trading system for ADR vs. local listings'],
    signals: [
      { pattern: '\\bibkr\\b|\\binteractive brokers\\b|\\btws\\b', weight: 10 },
      { pattern: '\\bautotrad(ing|er)\\b|\\balgo[ -]?trad(ing|er)\\b', weight: 11 },
      { pattern: '\\bquant\\b|\\bsystematic\\b', weight: 7 },
      { pattern: '\\bbacktest\\b', weight: 8 },
      { pattern: '\\bsharpe\\b|\\bdrawdown\\b', weight: 7 },
      { pattern: '\\b(buy|sell|long|short) signal\\b', weight: 8 },
      { pattern: '\\b(stock|equity|options?|futures) (strategy|system)\\b', weight: 9 },
      { pattern: '\\bportfolio (sizing|construction)\\b', weight: 7 },
    ],
  },
  system_design: {
    id: 'system_design',
    label: 'System / architecture design',
    role: 'a principal software architect who has shipped distributed systems at scale and reviewed designs for many teams',
    context: 'Produce a design document an engineer can build from and a reviewer can challenge. Show trade-offs, not preferences.',
    format: 'Problem statement | Goals + non-goals | Constraints | Proposed architecture (components + data flow) | Alternatives considered | Trade-offs | Operational concerns (observability, failure modes, scaling) | Rollout plan | Open questions',
    exclusions: 'Justify every technology choice and name its trade-off. Explain the mechanism — no magic, no unexamined buzzwords. Flag prerequisites that don\'t exist yet.',
    reasoning: 'Frame the problem. Bound scope. Enumerate at least 2 viable architectures. Score each. Pick. Specify what could go wrong.',
    critique: 'Could an engineer build it? Could a reviewer fail it on a specific weak point? Are the alternatives real or strawmen?',
    examples: ['Design doc for multi-tenant feature flag service', 'Architecture proposal for event-sourced order management'],
    signals: [
      { pattern: '\\bsystem design\\b|\\barchitecture design\\b', weight: 11 },
      { pattern: '\\bdesign doc(ument)?\\b', weight: 10 },
      { pattern: '\\bhigh[ -]?level design\\b|\\bhld\\b', weight: 10 },
      { pattern: '\\blow[ -]?level design\\b|\\blld\\b', weight: 9 },
      { pattern: '\\b(microservice|event[ -]?sourc|cqrs|distributed|sharding|consensus)\\b', weight: 6 },
      { pattern: '\\bapi design\\b', weight: 7 },
      { pattern: '\\barchitect(ure|s) (for|of|a)\\b', weight: 7 },
    ],
  },
  general: {
    id: 'general',
    label: 'General',
    role: 'a world-class domain expert combining deep knowledge with clear communication',
    context: 'Think carefully. Address the specific task as posed, not a generic version. State assumptions when you must make them.',
    format: 'Direct answer | Supporting reasoning | Concrete next steps',
    exclusions: 'Answer this exact task with specifics. Skip padding, generic advice, and restating the question.',
    reasoning: 'Identify the actual ask. State assumptions explicitly. Reason from first principles when the task admits one right answer.',
    critique: 'Does it directly answer what was asked? Is every claim specific to this task?',
    examples: ['Catch-all when nothing else scores'],
    signals: [],
  },
};

export const ARCHETYPE_ORDER: ArchetypeId[] = [
  'executive_email', 'meeting_prep', 'research_synthesis', 'presentation_deck',
  'data_analysis', 'strategy_brief', 'board_brief', 'post_incident', 'due_diligence',
  'pharma_regulatory', 'biotech_investor', 'trading_system', 'system_design',
  'meta_prompt', 'general',
];

// ============================================================================
// ADAPTERS (5)
// ============================================================================

export const ADAPTERS: Record<AdapterId, Adapter> = {
  claude: {
    id: 'claude', label: 'Claude', separator: '\n\n',
    blocks: [
      { name: 'role', open: '<role>\n', close: '\n</role>' },
      { name: 'context', open: '<context>\n', close: '\n</context>' },
      { name: 'reasoning', open: '<thinking_approach>\n', close: '\n</thinking_approach>' },
      { name: 'format', open: '<format>\n', close: '\n</format>' },
      { name: 'exclusions', open: '<do_not>\n', close: '\n</do_not>' },
      { name: 'examples', open: '<examples>\n', close: '\n</examples>' },
      { name: 'critique', open: '<critique>\n', close: '\n</critique>' },
      { name: 'extra', open: '<extra>\n', close: '\n</extra>' },
      { name: 'task', open: '### New Input:\n', close: '' },
    ],
  },
  chatgpt: {
    id: 'chatgpt', label: 'ChatGPT (GPT-4o / o-series)', separator: '\n\n',
    blocks: [
      { name: 'role', open: 'You are ', close: '.' },
      { name: 'task', open: '## Task\n', close: '' },
      { name: 'context', open: '## Context\n', close: '' },
      { name: 'reasoning', open: '## Reasoning approach\n', close: '' },
      { name: 'format', open: '## Output format\n', close: '' },
      { name: 'exclusions', open: '## Constraints\n', close: '' },
      { name: 'examples', open: '## Examples\n', close: '' },
      { name: 'critique', open: '## Verify before responding\n', close: '' },
      { name: 'extra', open: '## Additional\n', close: '' },
    ],
  },
  gemini: {
    id: 'gemini', label: 'Gemini', separator: '\n\n',
    blocks: [
      { name: 'role', open: 'You are ', close: '.' },
      { name: 'task', open: 'Task:\n', close: '' },
      { name: 'context', open: '', close: '' },
      { name: 'reasoning', open: 'Reasoning approach:\n', close: '' },
      { name: 'format', open: 'Structure your answer as:\n', close: '' },
      { name: 'exclusions', open: 'Ensure you:\n', close: '' },
      { name: 'examples', open: 'Examples:\n', close: '' },
      { name: 'critique', open: 'Verify before answering: ', close: '' },
      { name: 'extra', open: '', close: '' },
    ],
  },
  copilot: {
    id: 'copilot', label: 'Microsoft Copilot (M365)', separator: '\n\n',
    blocks: [
      { name: 'role', open: '## Role\n', close: '' },
      { name: 'task', open: '## Task\n', close: '' },
      { name: 'context', open: '## Context\n', close: '' },
      { name: 'reasoning', open: '## Reasoning approach\n', close: '' },
      { name: 'format', open: '## Output format\n', close: '' },
      { name: 'exclusions', open: '## Constraints\n', close: '' },
      { name: 'examples', open: '## Examples\n', close: '' },
      { name: 'critique', open: '## Quality check\n', close: '' },
      { name: 'extra', open: '## Additional\n', close: '' },
    ],
  },
  grok: {
    id: 'grok', label: 'Grok (xAI)', separator: '\n\n',
    blocks: [
      { name: 'role', open: '', close: '.' },
      { name: 'task', open: 'Task: ', close: '' },
      { name: 'context', open: '', close: '' },
      { name: 'reasoning', open: 'Think: ', close: '' },
      { name: 'format', open: 'Format: ', close: '' },
      { name: 'exclusions', open: 'Avoid: ', close: '' },
      { name: 'examples', open: 'Examples: ', close: '' },
      { name: 'critique', open: 'Check: ', close: ' Be direct.' },
      { name: 'extra', open: '', close: '' },
    ],
  },
};

export const ADAPTER_ORDER: AdapterId[] = ['claude', 'chatgpt', 'gemini', 'copilot', 'grok'];

// ============================================================================
// QUALITY AXIS (5 presets)
// ============================================================================

export const QUALITY_AXIS: Record<QualityId, QualityAxisPreset> = {
  quick_verdict: {
    label: 'Quick verdict',
    blurb: 'Snap answer. Headline + one-line reason. Read in 30 seconds.',
    depth: { maxWords: 150, summary: 'Lead with the verdict in one sentence. Max 150 words total. No preamble.' },
    reviewMode: null, reasoning: 'minimal', richMedia: null,
  },
  fast_detailed: {
    label: 'Fast detailed',
    blurb: 'Compact briefing. Verdict plus three to five supporting points. Read in 2 minutes.',
    depth: { maxWords: 500, summary: '300-500 words. Lead with verdict, then bullets with one-line justifications.' },
    reviewMode: null, reasoning: 'standard', richMedia: null,
  },
  comprehensive: {
    label: 'Comprehensive',
    blurb: 'Full work-through with a peer-review pass. Read in 10 minutes.',
    depth: { maxWords: 1200, summary: '800-1200 words. Every claim supported. End with a single-pass peer review.' },
    reviewMode: 'peer_review', reasoning: 'expanded', richMedia: null,
  },
  strategic_depth: {
    label: 'Strategic depth',
    blurb: 'Decision-grade. Options weighed, risks named, red-teamed. Read in 30 minutes.',
    depth: { maxWords: 2500, summary: '1500-2500 words. Multiple options scored. Red-team pass after the recommendation.' },
    reviewMode: 'red_team', reasoning: 'structured', richMedia: null,
  },
  exhaustive_research: {
    label: 'Exhaustive research',
    blurb: 'Long-form report with citations, red-team and editor pass. Read in 2 hours.',
    depth: { maxWords: 6000, summary: '3000-6000 words. Standard report structure: Exec Summary / Background / Method / Findings / Analysis / Recommendations / Limitations / Appendix. Cite every external claim.' },
    reviewMode: 'red_team_plus_peer', reasoning: 'full', richMedia: 'visuals',
  },
};

export const QUALITY_AXIS_ORDER: QualityId[] = [
  'quick_verdict', 'fast_detailed', 'comprehensive', 'strategic_depth', 'exhaustive_research',
];

const REASONING_PRESETS: Record<string, string> = {
  minimal: '',
  standard: 'Think before you respond. Show key reasoning only when load-bearing.',
  expanded: 'Think step by step. Show the reasoning chain. Distinguish premise from conclusion.',
  structured: 'Reason in this order: (1) frame the decision (2) generate distinct options (3) score options on the stated criteria (4) pick one (5) defend it (6) name what would change your mind.',
  full: 'Reason in this order: (1) frame the question (2) gather and cite evidence (3) generate alternative interpretations (4) test each against the evidence (5) pick the best-supported (6) state confidence and remaining uncertainty.',
};

const REVIEW_MODES: Record<string, string> = {
  standard: '',
  peer_review: 'After your primary response, switch role to senior editor. Identify 3 specific improvements. Apply them and label the revised section. Format: [EDITOR NOTES] then [REVISED SECTION].',
  red_team: 'After your primary response, switch role to rigorous skeptic. Identify the 3 strongest objections. Respond to each. Format: [RED TEAM] / [OBJECTION 1..3] / [RESPONSE].',
  red_team_plus_peer: 'After your primary response, run a red-team pass (3 objections plus responses) THEN an editor pass (3 improvements plus revisions). Format: [RED TEAM ...] then [EDITOR NOTES] [REVISED SECTIONS].',
};

const RICH_MEDIA: Record<string, string> = {
  visuals: 'After the main response, add a [VISUAL DIRECTION] block per major section: chart type, axes, and what data to encode.',
  video_script: 'After the main response, add a [VIDEO SCRIPT] block — 2-3 minute talking head. Structure: [HOOK 15s] [BODY 90s] [CTA 30s].',
  image_prompts: 'After the main response, add 3 [IMAGE GENERATION PROMPTS] tuned to a modern diffusion model. Each: Subject / Style / Composition / Mood.',
  presentation_package: 'After the main response, add a presentation package: [SLIDE OUTLINE] [VISUAL DIRECTION] [SPEAKER NOTES] [HANDOUT SUMMARY].',
};

// ============================================================================
// OUTPUT FORMATS (12) — what the AI delivers + how to ask for it
// ============================================================================

export type OutputFormatId =
  | 'text' | 'markdown' | 'word' | 'powerpoint' | 'excel' | 'csv'
  | 'html' | 'pdf_1pager' | 'research_report' | 'email' | 'power_bi' | 'json';

export interface OutputFormat {
  id: OutputFormatId;
  label: string;
  icon: string;
  category: 'text' | 'document' | 'data' | 'visual';
  valueShort: string;
  audience: string;
  downloadTruth: string;
  injection: string;
  /** UI-only: surface as the recommended default. Currently HTML. */
  recommended?: boolean;
  /** Human-readable time estimate (e.g. "30-60s") shown next to the label. */
  timeEstimate?: string;
}

export const OUTPUT_FORMATS: Record<OutputFormatId, OutputFormat> = {
  text: {
    id: 'text',
    label: 'Plain text',
    icon: 'T',
    category: 'text',
    valueShort: 'A normal conversational answer. No headings, no fancy layout — just words.',
    audience: 'Anyone reading the reply in chat or pasting into an email body.',
    downloadTruth: 'No file. You read it in the chat or paste it where you need it.',
    injection: '',
  },
  markdown: {
    id: 'markdown',
    label: 'Markdown',
    icon: 'M',
    category: 'document',
    valueShort: 'A formatted document with headings, lists, and links — readable as plain text but renders nicely in GitHub, Notion, Obsidian, Slack.',
    audience: 'Engineers, technical writers, anyone using Notion / GitHub / Obsidian.',
    downloadTruth: 'Copy the text and save as a .md file, or paste into any markdown-aware tool.',
    injection: 'Format the entire response as Markdown:\n- Use # H1, ## H2, ### H3 for hierarchy\n- Use **bold**, *italic*, `inline code`, ```fenced``` code blocks where appropriate\n- Use - bullets and 1. numbered lists\n- Use | tables | for | structured | data |\n- Use > blockquotes for callouts\n- Use [link text](url) for any URL.',
  },
  word: {
    id: 'word',
    label: 'Word document',
    icon: 'W',
    category: 'document',
    valueShort: 'A formal business document ready to paste into Microsoft Word — section headings, paragraphs, tables, bullets all properly structured.',
    audience: 'Business pros writing memos, proposals, reports, contracts.',
    downloadTruth: 'Paste the response into a blank Word doc — formatting transfers. Or save as .docx via Word.',
    injection: 'Format as a Microsoft Word document:\n- Use # headings for hierarchy, plain bullets and numbered lists\n- Use | pipe | tables | for any tabular data\n- No code fences or backticks — Word style only\n- Title at the top, full sentence paragraphs throughout.',
  },
  powerpoint: {
    id: 'powerpoint',
    label: 'PowerPoint slides',
    icon: 'P',
    category: 'visual',
    timeEstimate: '30-50s',
    valueShort: 'A slide-by-slide deck outline with titles, bullets, and speaker notes — ready to drop into PowerPoint or Keynote.',
    audience: 'Executives presenting to boards, sales teams pitching, anyone running a meeting with slides.',
    downloadTruth: 'Each "slide" is a chunk of text you paste into one PowerPoint slide. ChatGPT Plus / Claude can also export .pptx for some plans.',
    injection: 'Format as a PowerPoint slide deck. For each slide:\n\n[SLIDE N — Lead with the insight, not the topic]\n• Concise bullet\n• Concise bullet\n• Concise bullet\n[SPEAKER NOTES: 2-3 sentences expanding what the presenter says aloud]\n\nPyramid principle: insight title first, supporting points below. Keep slides scannable — minimal text, maximum clarity. Aim for 8-12 slides unless told otherwise.',
  },
  excel: {
    id: 'excel',
    label: 'Excel spreadsheet',
    icon: 'X',
    category: 'data',
    valueShort: 'A spreadsheet with columns, rows, headers, and formulas — paste into Excel or Google Sheets and it lays out correctly.',
    audience: 'Analysts, finance, ops — anyone working with tabular numeric data.',
    downloadTruth: 'Paste the table into Excel — column splits work automatically. Or ask the AI to export as .xlsx (Plus / Claude file output).',
    injection: 'Format as an Excel spreadsheet:\n- Row 1: clear, descriptive column headers\n- Use | pipe | separators | per row |\n- Include summary rows (totals, averages) where appropriate\n- For computed columns, show the Excel formula in a separate "Formula" column\n- No prose between rows — tables only\n- Multiple sheets: separate with === SHEET: name ===',
  },
  csv: {
    id: 'csv',
    label: 'CSV data',
    icon: 'C',
    category: 'data',
    valueShort: 'Pure comma-separated data — no formatting, no styling, just rows. Imports into anything: Excel, Sheets, Python, R, every database, every BI tool.',
    audience: 'Data engineers, anyone moving data between tools, automation workflows.',
    downloadTruth: 'Copy the output, paste into a text editor, save as .csv. Or save directly with most modern AI chat tools that offer file output.',
    injection: 'Format as CSV (comma-separated values) ONLY. Rules:\n- First row: column headers\n- One row per record, fields separated by commas\n- Wrap fields containing commas, quotes, or newlines in double quotes\n- Escape double quotes inside fields by doubling them ("")\n- No prose, no headings, no commentary outside the CSV body — output ONLY the CSV.',
  },
  html: {
    id: 'html',
    label: 'HTML page',
    icon: 'H',
    category: 'visual',
    recommended: true,
    timeEstimate: '30-60s',
    valueShort: 'Magazine-grade, editorial-design HTML — single self-contained file, opens in any browser, prints to PDF beautifully. The most impressive format Prompt Dolphin produces.',
    audience: 'Anyone sharing a high-stakes deliverable that needs to look like Stratechery / Bloomberg / The Information at first glance.',
    downloadTruth: 'Copy the HTML, save as `report.html`, double-click — opens as a website in your browser. Share via email, host on any static site, or print to PDF.',
    injection: `Format as a COMPLETE, SINGLE-FILE, PUBLICATION-GRADE HTML5 DOCUMENT.

DESIGN BENCHMARK: The Information, Stratechery, Bloomberg, The Pudding. The reader's first impression should be "this was professionally designed AND the data is beautifully visualized."

TECHNICAL CONSTRAINTS (non-negotiable):
- Single self-contained file. ALL CSS in one <style> block. Zero external stylesheets, fonts, scripts, or CDN links.
- Make body text editable with contenteditable="true" on the <body> or <main> element — UNLESS the document is a formal or confidential deliverable (investment-committee brief, board memo, legal, regulatory): for those, OMIT contenteditable so the published document cannot be trivially altered.
- Must render correctly when opened via file:// in any modern browser.
- Begin the document with <!DOCTYPE html><html lang="en"> and end it with a single closing </html>.
- Output ONLY the HTML document. No prose preface, no code fences.
- Well-formed HTML5. CSS-only — NO JavaScript anywhere. Every chart is a STATIC inline <svg>, which needs no JavaScript, renders from file://, and prints cleanly.

DELIVERY FLOOR (read first — quality over quantity):
- If you can only produce two or three charts well, produce those flawlessly rather than many broken ones. A few correct, legible charts beat a dozen malformed ones.
- Close every tag you open. If you risk running out of room, finish the current chart cleanly and end the document with </html> rather than stopping mid-chart — a truncated file renders blank.

DESIGN DIRECTION (use your best judgment on specific values):
- Editorial typography: elegant serif headlines, clean sans-serif body text, monospace for data and figures. System font stacks only.
- Generous whitespace — let content breathe. Comfortable reading measure, ample vertical rhythm between sections.
- Refined neutral palette with one tasteful accent hue. Support light and dark mode via prefers-color-scheme.
- Strong visual hierarchy: clear distinction between headline, section headings, body text, and captions.
- Comfortable line height and letter spacing for long-form reading.

CONSISTENCY DISCIPLINE:
- Declare the full design system ONCE as CSS custom properties in :root — palette, type scale, spacing scale, AND a chart-color ramp (e.g. --c-1 … --c-6 plus --c-grid, --c-axis, --c-label) — then reference only those tokens throughout, INCLUDING inside every <svg> (use fill="var(--c-2)" / stroke="var(--c-axis)" etc.). Never improvise a new color or size mid-document, and never hard-code a raw hex value inside an SVG — this INCLUDES text and label fills (use fill="var(--c-label)" or fill="var(--ink)", never fill="#fff"); white-on-accent labels go illegible when the chart ramp lightens in dark mode.
- In the dark-mode block (@media (prefers-color-scheme: dark)), RE-DECLARE the chart ramp tokens (--c-1 … --c-6, --c-grid, --c-axis, --c-label) alongside the palette, so every chart adapts to dark mode automatically. Charts that reference tokens will then flip with the theme — do not author separate SVGs per theme.
- Prefer the classic, restrained choice over the experimental one at every design decision. A timeless editorial layout beats a novel one.

DATA VISUALIZATION (MANDATORY whenever the content contains any numbers, comparisons, trends, rankings, proportions, or sequences):
- Render quantitative content as inline <svg> charts, NOT only as tables. A table MAY accompany a chart, but any data that can be visualized MUST be visualized.
- Pick the chart that fits the data shape — choose by the data, never default to one type:
  - Column / bar — compare values across a handful of categories.
  - Grouped or stacked bar — two-to-three series across categories, or part-to-whole across categories.
  - Line or area — a trend over time or an ordered sequence.
  - Donut or treemap — composition / share of a whole (treemap when there are many parts).
  - Horizontal bar-in-row — a proportional bar embedded inside a ranked table row, so the table doubles as a chart.
  - Sparkline — a tiny inline trend beside a number, inside a stat card, or in a table cell.
  - KPI stat-card — a large numeral with label, unit, and optional delta; group 3-4 as a top row.
  - Timeline / Gantt — events or phases laid along a time axis.
  - Slopegraph or dumbbell — a before-after or A-vs-B comparison across items.
  - Gauge / progress arc — a single value against a target or a 0-100% scale.
  - Heatmap grid — a value-by-two-dimensions matrix encoded as cell shade.
  - Simple scatter — relationship between two numeric variables.
- VARIETY IS REQUIRED: when the data supports it, include AT LEAST 3 DIFFERENT chart types. Never repeat one chart type for everything. Match variety to the data, not to decoration.
- EVERY chart must:
  - carry a short title and, where applicable, axis labels with units;
  - label the actual values (data labels on bars/points, or a readable axis the reader can map from);
  - be accessible: wrap the <svg> with role="img" and include a <title> and a <desc> summarizing what it shows;
  - draw exclusively from the :root chart tokens (the --c-* ramp) so it matches the palette and adapts to light/dark mode;
  - size responsively via a viewBox plus width:100% (no fixed pixel widths that overflow on mobile);
  - print cleanly — never rely on hover, animation, or interactivity to convey meaning.
- TASTEFUL, NOT GAUDY: flat 2D only. No 3D, no drop shadows on data marks, no rainbow spectrum, no more than ~6 series colors, no chartjunk. Editorial restraint — a Bloomberg or Economist chart, not a dashboard skin.
- DO NOT FABRICATE chart data. Chart ONLY values actually present in the content or directly derivable from it (sums, shares, deltas, simple rates). If a number is not in the data, it is not in the chart. Never invent points to fill out a trend.
- NUMERIC CONSISTENCY (applies to PROSE too, not just charts): every figure stated anywhere — headline, lede, KPI card, caption, body — must equal the dataset or a value directly derivable from it. Before finalizing, reconcile every headline/summary number against the underlying rows; they must match exactly. If the supplied data is internally inconsistent (e.g. cash + positions exceeds the stated total), surface the discrepancy explicitly in a note rather than silently asserting one figure as fact.

STRUCTURE:
- Hero section at top: eyebrow label, compelling headline, one-sentence summary, estimated reading time.
- A row of 3-4 KPI stat-cards directly under the hero when headline metrics exist. Each card carries a DISTINCT figure with genuine information value — never restate the same number twice on one card (value and sub-label both reading the same), and never conflate distinct quantities (a total, deployed capital, and exposure are different numbers; label each precisely).
- Table of contents for documents over 1500 words.
- Elegant section dividers, pull quotes for key insights, polished data tables with aligned numerics — each data-bearing section paired with its fitting chart from the taxonomy above.
- Cards with subtle borders and soft shadows for grouped content (shadows on cards are fine; never on the data marks themselves).
- Accessible focus rings, comfortable scroll behavior.
- Responsive: beautiful on desktop, fully readable on mobile, clean print stylesheet. Charts reflow and stay legible at narrow widths.

CONTENT STANDARDS:
- Cite every factual claim inline. Footer sources list with publication, date, URL.
- No invented quotes, statistics, URLs, or images.
- No marketing fluff ("revolutionary", "game-changing", "best-in-class").

SVG TECHNIQUE (so charts render correctly):
- Every chart: <svg viewBox="0 0 W H" preserveAspectRatio="xMidYMid meet" role="img"> with a <title> first child stating in one plain sentence what it shows. Set width via CSS (100% / max-width), NOT a fixed pixel width/height, so it stays crisp and prints sharp.
- Remember SVG y grows downward: bars grow up from a baseline (y = chartH - height); line points map value to pixel as y = chartH - (value-min)/(max-min)*chartH.
- ONE SCALE PER CHART: compute a single value-to-pixel scale and derive BOTH the plotted marks AND every axis tick / gridline from it. Never hand-place ticks, dots, or bars at eyeballed pixel positions — a tick labeled -250 must sit at exactly the same px/unit as the bars. Set axis bounds to the actual data min/max, not round numbers that waste axis space or misstate the range.
- Bars/columns: one <rect> each, sharing ONE scale across the series. Lines: <polyline fill="none" stroke=... points="x,y ...">. Area: a filled <path> closed to the baseline with the line stroked on top. Donut: <circle fill="none"> with stroke-width + stroke-dasharray "segment gap" + stroke-dashoffset to place each segment (rotate the group -90deg to start at top) — prefer this over hand-computed arc paths.

STYLE REFERENCE — copy the TECHNIQUE shown below (token-driven SVG, viewBox, dark-mode re-declared chart tokens), never the numbers or labels (they are placeholders). Your charts must use ONLY the user's data:
<style>:root{--paper:#FDFCF8;--ink:#1A1A1A;--muted:#555;--rule:#D8D2C4;--c-1:#1F2F4A;--c-2:#A67C3D}
@media (prefers-color-scheme:dark){:root{--paper:#15171B;--ink:#ECEAE3;--muted:#9A968C;--rule:#33373E;--c-1:#7FA8E0;--c-2:#E0B870}}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.kpi{border:1px solid var(--rule);border-radius:8px;padding:14px}.kpi b{font-size:2rem;font-family:ui-monospace,monospace;color:var(--ink)}
.kpi span{display:block;color:var(--muted);font-size:.8rem}.chart{width:100%;height:auto;max-width:560px}</style>
<div class="kpis"><div class="kpi"><b>00</b><span>Example metric label</span></div>
<div class="kpi"><b>00%</b><span>Example metric label</span>
<svg viewBox="0 0 100 24" class="chart" role="img"><title>Example sparkline — replace with the user's series</title>
<polyline fill="none" stroke="var(--c-2)" stroke-width="2" points="0,20 25,15 50,16 75,8 100,5"/>
<circle cx="100" cy="5" r="2.5" fill="var(--c-2)"/></svg></div></div>
<svg viewBox="0 0 320 96" class="chart" role="img" preserveAspectRatio="xMidYMid meet">
<title>Example horizontal bars — replace categories and values with the user's data</title>
<text x="78" y="22" text-anchor="end" font-size="11" fill="var(--muted)">Item A</text>
<rect x="84" y="12" width="120" height="14" rx="2" fill="var(--c-1)"/><text x="210" y="22" font-size="11" fill="var(--ink)">00</text>
<text x="78" y="46" text-anchor="end" font-size="11" fill="var(--muted)">Item B</text>
<rect x="84" y="36" width="168" height="14" rx="2" fill="var(--c-1)"/><text x="258" y="46" font-size="11" fill="var(--ink)">00</text>
<text x="78" y="70" text-anchor="end" font-size="11" fill="var(--muted)">Item C</text>
<rect x="84" y="60" width="72" height="14" rx="2" fill="var(--c-1)"/><text x="162" y="70" font-size="11" fill="var(--ink)">00</text></svg>
END REFERENCE — the numbers and labels above are placeholders. Your charts must use ONLY the user's data.

Produce something a designer at The Pudding would be proud to ship — editorial prose AND original data graphics, in one file.`,
  },
  pdf_1pager: {
    id: 'pdf_1pager',
    label: 'PDF one-pager',
    icon: '1',
    category: 'document',
    timeEstimate: '20-40s',
    valueShort: 'A single-page executive summary — situation, finding, evidence, recommendation, next step. Fits on one printed page.',
    audience: 'Executives, board members, anyone with 60 seconds to absorb a decision.',
    downloadTruth: 'Paste into Word or Google Docs, set margins narrow, export to PDF. Or use HTML output + browser "Save as PDF".',
    injection: 'Format as a one-page executive summary that fits on a single printed page.\n\nStructure: Headline → Situation → Key Finding → Evidence → Recommendation → Next Step.\n\nKeep it tight — under 500 words. Every sentence earns its place. The reader should absorb the entire decision in 60 seconds.',
  },
  research_report: {
    id: 'research_report',
    label: 'Research report',
    icon: 'R',
    category: 'document',
    timeEstimate: '60-120s',
    valueShort: 'A full academic-grade report with executive summary, methodology, findings, analysis, recommendations, limitations, and appendix. 3,000-6,000 words.',
    audience: 'Academics, policy researchers, consulting deliverables, deep dives, white papers.',
    downloadTruth: 'Paste into Word or Google Docs, apply heading styles, export to PDF. Or output as Markdown then convert.',
    injection: 'Format as a comprehensive research report (3000-6000 words).\n\nInclude: Executive Summary, Background, Methodology, Findings, Analysis, Recommendations, Limitations, and Appendix.\n\nUse numbered sections and subsections. One subsection per major finding with supporting evidence. Recommendations should be prioritized with rationale.\n\nCite every external claim inline. No unverified speculation presented as fact.',
  },
  email: {
    id: 'email',
    label: 'Email draft',
    icon: 'E',
    category: 'text',
    valueShort: 'A ready-to-send email: subject line, opening, body, ask, and sign-off. Under 250 words. Paste into Gmail / Outlook and send.',
    audience: 'Anyone writing professional email — execs, sales, customer success, founders.',
    downloadTruth: 'Copy and paste into your email client. Subject line goes in the subject field, body goes in the body. No file.',
    injection: 'Format as a ready-to-send email:\n\nSubject: [specific, under 60 chars]\n\n[Greeting]\n[Context — 1-2 sentences]\n[The ask or key information]\n[Supporting details if needed]\n[Clear, unambiguous call to action]\n[Sign-off]\n\nMax 250 words. No filler. Active voice. The recipient should know exactly what you need within 30 seconds.',
  },
  power_bi: {
    id: 'power_bi',
    label: 'Power BI / Tableau spec',
    icon: 'B',
    category: 'data',
    valueShort: 'A dashboard specification: which charts to build, which fields to use, which DAX formulas to write, what filters and KPIs to expose. Hand to a BI developer or build it yourself.',
    audience: 'BI developers, data analysts, anyone briefing a dashboard build.',
    downloadTruth: 'Use the spec to build the dashboard yourself in Power BI or Tableau, or hand it to a BI dev as the build brief.',
    injection: 'Format as a Power BI / Tableau dashboard specification.\n\nInclude: Dashboard Purpose, Data Sources (tables, grain, key fields), KPI Tiles (name, formula, target, formatting), Visuals (chart type, axes, encoding, business question), Filters/Slicers, DAX/Calculated Measures, Drill-throughs, and Performance Notes.\n\nWrite exact DAX or Tableau formulas for non-trivial calculations. This is a build brief — no prose narrative.',
  },
  json: {
    id: 'json',
    label: 'JSON data',
    icon: 'J',
    category: 'data',
    valueShort: 'Structured machine-readable data. Use it as input to another tool, an API, or a script. No prose.',
    audience: 'Developers, automation builders, anyone piping AI output into another system.',
    downloadTruth: 'Copy the JSON, save as a .json file, or feed it directly to your code / API / workflow.',
    injection: 'Format the response as a single valid JSON object. Rules:\n- FIRST, silently design a JSON schema that fits this task: choose field names and types that capture the content faithfully. THEN populate it.\n- If your runtime supports native structured output (e.g., response_format with a json_schema), use it.\n- Output ONLY JSON. No prose before, no prose after, no markdown fences.\n- Use snake_case keys.\n- Use ISO 8601 for any dates ("2026-05-25") and ISO 8601 with timezone for timestamps ("2026-05-25T14:30:00Z").\n- Use null for missing values, not empty strings.\n- Arrays for repeated entities, objects for named groupings.\n- Include a top-level "schema_version": "1.0" and "generated_at": "<ISO timestamp>".\n- The output must parse cleanly with JSON.parse() — no trailing commas, no comments, no unescaped quotes inside strings.',
  },
};

// HTML lives at index 0 - it's the "recommended" showcase format.
// First-time users seeing HTML output understand Prompt Dolphin's value instantly.
export const OUTPUT_FORMAT_ORDER: OutputFormatId[] = [
  'html',
  'text', 'markdown', 'email', 'word', 'pdf_1pager', 'research_report',
  'powerpoint',
  'excel', 'csv', 'power_bi', 'json',
];

// ============================================================================
// CLASSIFIER
// ============================================================================

const compiledCache = new Map<string, RegExp>();
function compile(pattern: string): RegExp {
  if (!compiledCache.has(pattern)) compiledCache.set(pattern, new RegExp(pattern, 'i'));
  return compiledCache.get(pattern)!;
}

export interface ClassifyResult {
  archetype: ArchetypeId;
  confidence: number;
  runnerUp: ArchetypeId | null;
  scores: Record<string, { score: number; matches: number; specificity: number }>;
}

export function classify(task: string): ClassifyResult {
  const t = String(task);
  const scores: Record<string, { score: number; matches: number; specificity: number }> = {};
  for (const [id, arch] of Object.entries(ARCHETYPES)) {
    let score = 0; let matches = 0;
    for (const sig of arch.signals) {
      if (compile(sig.pattern).test(t)) { score += sig.weight; matches += 1; }
    }
    scores[id] = { score, matches, specificity: matches > 0 ? score / matches : 0 };
  }
  const ranked = Object.entries(scores)
    .filter(([id]) => id !== 'general')
    .sort((a, b) => {
      if (b[1].score !== a[1].score) return b[1].score - a[1].score;
      if (b[1].specificity !== a[1].specificity) return b[1].specificity - a[1].specificity;
      return a[0].localeCompare(b[0]);
    });
  const top = ranked[0];
  const winner = (top && top[1].score > 0 ? top[0] : 'general') as ArchetypeId;
  return { archetype: winner, confidence: top ? top[1].score : 0, runnerUp: (ranked[1]?.[0] as ArchetypeId) ?? null, scores };
}

// ============================================================================
// SPINE + RENDER
// ============================================================================

export interface Spine {
  role: string; task: string; context: string; reasoning: string;
  format: string; exclusions: string; examples: string; critique: string; extra: string;
}

export function buildSpine(args: {
  task: string; archetype: ArchetypeId; quality: QualityId;
  userConstraints?: string[]; examples?: string[];
  outputFormat?: OutputFormatId;
}): Spine {
  const arch = ARCHETYPES[args.archetype];
  const qa = QUALITY_AXIS[args.quality];
  const fmt = args.outputFormat ? OUTPUT_FORMATS[args.outputFormat] : null;
  const context = [arch.context, qa.depth.summary].filter(Boolean).join('\n\n');
  const reasoning = [REASONING_PRESETS[qa.reasoning] || '', arch.reasoning].filter(Boolean).join('\n\n');
  const exclParts = [arch.exclusions, `Max length: ${qa.depth.maxWords} words.`];
  if (args.userConstraints?.length) {
    exclParts.push('USER CONSTRAINTS (preserve verbatim, do not paraphrase):\n- ' + args.userConstraints.join('\n- '));
  }
  const exclusions = exclParts.filter(Boolean).join('\n\n');
  const exList = [...arch.examples, ...(args.examples ?? [])];
  const examples = exList.length ? exList.map((e, i) => `${i + 1}. ${e}`).join('\n') : '';
  // Format: archetype's preferred structure + (if user picked a specific output format) format-specific injection
  const formatParts = [arch.format];
  if (fmt && fmt.injection) {
    formatParts.push('=== OUTPUT FORMAT REQUIREMENTS ===');
    formatParts.push(fmt.injection);
  }
  const formatBlock = formatParts.join('\n\n');
  const extraParts = [
    qa.reviewMode ? REVIEW_MODES[qa.reviewMode] : '',
    qa.richMedia ? RICH_MEDIA[qa.richMedia] : '',
  ].filter(Boolean);
  return {
    role: arch.role, task: String(args.task).trim(),
    context, reasoning, format: formatBlock, exclusions,
    examples, critique: arch.critique, extra: extraParts.join('\n\n'),
  };
}

export function render(spine: Spine, adapterId: AdapterId): string {
  const adapter = ADAPTERS[adapterId];
  const parts: string[] = [];
  for (const block of adapter.blocks) {
    const content = (spine as unknown as Record<string, string>)[block.name];
    if (!content) continue;
    parts.push(`${block.open}${content}${block.close}`);
  }
  return parts.join(adapter.separator);
}

// ============================================================================
// PREFLIGHT
// ============================================================================

export interface PreflightIssue { severity: 'high' | 'medium'; code: string; message: string }
export interface PreflightResult { passed: boolean; issues: PreflightIssue[] }

const REQUIRED_SPINE_KEYS: (keyof Spine)[] = ['role', 'task', 'format', 'exclusions', 'critique'];

export function preflight(engineered: string, ctx: { task: string; userConstraints?: string[]; spine?: Spine }): PreflightResult {
  const issues: PreflightIssue[] = [];
  const text = String(engineered);
  const taskHead = String(ctx.task).trim().slice(0, 40);
  if (taskHead && !text.includes(taskHead)) issues.push({ severity: 'high', code: 'task_missing', message: 'Engineered prompt does not include the user task verbatim.' });
  for (const c of ctx.userConstraints ?? []) {
    if (!text.includes(c)) issues.push({ severity: 'high', code: 'constraint_dropped', message: `User constraint not preserved verbatim: "${c.slice(0, 80)}"` });
  }
  if (ctx.spine) {
    for (const key of REQUIRED_SPINE_KEYS) {
      if (!ctx.spine[key] || String(ctx.spine[key]).trim() === '') {
        issues.push({ severity: 'high', code: 'spine_missing', message: `Spine component missing or empty: ${key}` });
      }
    }
  }
  if (text.length < 120) issues.push({ severity: 'medium', code: 'too_short', message: `Engineered prompt suspiciously short (${text.length} chars).` });
  if (text.length > 25000) issues.push({ severity: 'medium', code: 'too_long', message: `Engineered prompt unusually long (${text.length} chars); check for runaway.` });
  return { passed: issues.filter((i) => i.severity === 'high').length === 0, issues };
}

// ============================================================================
// PUBLIC API
// ============================================================================

export interface EngineerOptions {
  adapter?: AdapterId;
  quality?: QualityId;
  archetype?: ArchetypeId;
  userConstraints?: string[];
  examples?: string[];
  outputFormat?: OutputFormatId;
}

export interface EngineerResult {
  engineered: string;
  archetype: ArchetypeId;
  quality: QualityId;
  adapter: AdapterId;
  outputFormat: OutputFormatId;
  spine: Spine;
  preflight: PreflightResult;
  classification: { winner: ArchetypeId; confidence: number; runnerUp: ArchetypeId | null; scores: Record<string, { score: number; matches: number; specificity: number }> };
}

export function engineer(task: string, options: EngineerOptions = {}): EngineerResult {
  const adapter = options.adapter ?? 'claude';
  const quality = options.quality ?? 'fast_detailed';
  const outputFormat = options.outputFormat ?? 'text';
  const userConstraints = options.userConstraints ?? [];
  const examples = options.examples ?? [];
  const cls = options.archetype
    ? { archetype: options.archetype, confidence: Infinity, runnerUp: null, scores: {} as ClassifyResult['scores'] }
    : classify(task);
  const archetype = cls.archetype;
  const spine = buildSpine({ task, archetype, quality, userConstraints, examples, outputFormat });
  const engineered = render(spine, adapter);
  const pf = preflight(engineered, { task, userConstraints, spine });
  return {
    engineered, archetype, quality, adapter, outputFormat, spine, preflight: pf,
    classification: { winner: cls.archetype, confidence: cls.confidence, runnerUp: cls.runnerUp, scores: cls.scores },
  };
}
