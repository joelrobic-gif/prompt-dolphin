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
    exclusions: 'No passive voice. No filler phrases (just/really/I hope this finds you well). Max 250 words. Ask must be unambiguous.',
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
    exclusions: 'No generic advice. One page max. Specific to this exact meeting and these exact attendees.',
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
    exclusions: 'No unverified claims. No paraphrased speculation as fact. Flag every uncertainty inline. Cite every external source.',
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
    exclusions: 'No descriptive slide titles (write the insight, not the topic). Max 35 words body. Max 12 slides unless explicitly approved.',
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
    exclusions: 'No insight without method. No causation language without supporting design. Flag missing data and sample limitations.',
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
    exclusions: 'No hype language. No buried bad news. No boilerplate. Label every forward-looking statement. No undisclosed material information.',
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
    exclusions: 'No assumed numbers. No verbatim regurgitation of the seller deck. Flag every reliance item and source provenance.',
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
    exclusions: 'No blame. No vague action items. Every action item must have owner and date. No hindsight bias dressed as foresight.',
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
    exclusions: 'No operating-level minutiae. No unresolved internal disagreement presented as consensus. Material risks must be named, not euphemized.',
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
    exclusions: 'No hedging without substance. No on-the-one-hand-on-the-other without a recommendation. Max 500 words main body.',
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
    exclusions: 'No Sharpe claims without backtest design disclosed. No \'set and forget\' framing. Name regulatory + tax surface. Flag overfitting risk.',
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
    exclusions: 'No magic. No buzzword stacks without justification. Every choice must name its trade-off. Flag prerequisites that don\'t exist yet.',
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
    exclusions: 'No padding. No generic advice. No restating the question. Specific to this exact task.',
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
    injection: 'Format as a Microsoft Word document:\n- Use # for H1 titles, ## for H2 section headings, ### for H3 subsections\n- Use plain dash bullets and numbered lists\n- Use | pipe | tables | for tabular data | (Word recognizes these)\n- No code fences or backticks\n- Include a 1-line title at the top in H1\n- Format paragraphs as full sentences, not telegraphic notes.',
  },
  powerpoint: {
    id: 'powerpoint',
    label: 'PowerPoint slides',
    icon: 'P',
    category: 'visual',
    valueShort: 'A slide-by-slide deck outline with titles, bullets, and speaker notes — ready to drop into PowerPoint or Keynote.',
    audience: 'Executives presenting to boards, sales teams pitching, anyone running a meeting with slides.',
    downloadTruth: 'Each "slide" is a chunk of text you paste into one PowerPoint slide. ChatGPT Plus / Claude can also export .pptx for some plans.',
    injection: 'Format as a PowerPoint slide deck. For each slide use this exact structure:\n\n[SLIDE 1 — Insight title (not a topic title)]\n• Bullet 1 (max 8 words)\n• Bullet 2 (max 8 words)\n• Bullet 3 (max 8 words)\n[SPEAKER NOTES: 2-3 sentences expanding what the presenter says aloud]\n\nFollow Minto pyramid: insight title first, supporting bullets below. Max 12 slides unless explicitly told otherwise. Max 35 words of body per slide.',
  },
  excel: {
    id: 'excel',
    label: 'Excel spreadsheet',
    icon: 'X',
    category: 'data',
    valueShort: 'A spreadsheet with columns, rows, headers, and formulas — paste into Excel or Google Sheets and it lays out correctly.',
    audience: 'Analysts, finance, ops — anyone working with tabular numeric data.',
    downloadTruth: 'Paste the table into Excel — column splits work automatically. Or ask the AI to export as .xlsx (Plus / Claude file output).',
    injection: 'Format as an Excel spreadsheet. Output as a single table (or multiple tables clearly separated by headings):\n\n- Row 1: column headers (bold, descriptive)\n- Use | pipe | separators | per row | (Excel paste recognizes tabs and pipes)\n- Include a SUMMARY row at the bottom with totals / averages where appropriate\n- For any computed columns, ALSO output the formula in a separate column labeled "Formula" using Excel syntax (=SUM(B2:B10), =AVERAGE(...), etc.)\n- No prose between rows. Tables only.\n- If multiple sheets are needed, separate with === SHEET: name === headers.',
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
    valueShort: 'A complete styled web page you can save and open in any browser — headings, sections, tables, even interactive elements.',
    audience: 'Anyone sharing a deliverable that needs to look polished on any device, no app required.',
    downloadTruth: 'Copy the HTML, save as `report.html`, double-click — opens as a website in your browser. Share via email or hosting.',
    injection: 'Format as a complete, standalone HTML5 document. Rules:\n- Start with <!DOCTYPE html><html lang="en"><head> ... </head><body> ... </body></html>\n- Include <meta charset="utf-8"> and <meta name="viewport" content="width=device-width, initial-scale=1">\n- Inline CSS in a <style> tag in the <head> — no external dependencies, no CDN links\n- Use semantic HTML: <header>, <main>, <section>, <article>, <footer>, <h1>-<h6>, <ul>/<ol>, <table>\n- Include a <summary> or hero block at the top, a <footer> with the date at the bottom\n- Make it print-friendly (use @media print rules)\n- Keep design clean and professional — system fonts, generous whitespace, max-width 800px content column.',
  },
  pdf_1pager: {
    id: 'pdf_1pager',
    label: 'PDF one-pager',
    icon: '1',
    category: 'document',
    valueShort: 'A single-page executive summary — situation, finding, evidence, recommendation, next step. Fits on one printed page.',
    audience: 'Executives, board members, anyone with 60 seconds to absorb a decision.',
    downloadTruth: 'Paste into Word or Google Docs, set margins narrow, export to PDF. Or use HTML output + browser "Save as PDF".',
    injection: 'Format as a one-page executive summary that fits on a single printed page. Use this exact 5-section structure:\n\n# [HEADLINE — one sentence stating the recommendation or finding]\n\n## SITUATION (2 sentences)\nWhat is happening and why we care.\n\n## KEY FINDING (1 bold sentence)\n**The single most important insight.**\n\n## EVIDENCE (3 bullets, one line each)\n• Data point or fact 1\n• Data point or fact 2\n• Data point or fact 3\n\n## RECOMMENDATION (1-2 sentences)\nThe specific action to take.\n\n## NEXT STEP (1 sentence)\nThe immediate next decision or action required and by whom.\n\nMax 500 words total. No filler. Every word earns its place.',
  },
  research_report: {
    id: 'research_report',
    label: 'Research report',
    icon: 'R',
    category: 'document',
    valueShort: 'A full academic-grade report with executive summary, methodology, findings, analysis, recommendations, limitations, and appendix. 3,000-6,000 words.',
    audience: 'Academics, policy researchers, consulting deliverables, deep dives, white papers.',
    downloadTruth: 'Paste into Word or Google Docs, apply heading styles, export to PDF. Or output as Markdown then convert.',
    injection: 'Format as a full long-form research report (3000-6000 words). Use this exact section structure:\n\n# [Report title — descriptive and specific]\n\n## 1. Executive Summary (≤ 300 words)\nFindings and recommendation in 1 paragraph + bullets.\n\n## 2. Background and Context\nWhy this question matters, what is already known, what gap exists.\n\n## 3. Methodology\n### 3.1 Data sources\n### 3.2 Analytical framework\n### 3.3 Scope and exclusions\n\n## 4. Findings\nOne subsection per major finding, with evidence and citations.\n\n## 5. Analysis and Implications\nWhat the findings mean, second-order effects.\n\n## 6. Recommendations\nNumbered, prioritized, each with a rationale and an owner.\n\n## 7. Limitations and Caveats\nHonest list of what we couldn\'t determine and why.\n\n## 8. Appendix\nSupporting data, additional charts, glossary, full source list.\n\nCite every external claim inline with [source name, year, page]. No unverified speculation as fact.',
  },
  email: {
    id: 'email',
    label: 'Email draft',
    icon: 'E',
    category: 'text',
    valueShort: 'A ready-to-send email: subject line, opening, body, ask, and sign-off. Under 250 words. Paste into Gmail / Outlook and send.',
    audience: 'Anyone writing professional email — execs, sales, customer success, founders.',
    downloadTruth: 'Copy and paste into your email client. Subject line goes in the subject field, body goes in the body. No file.',
    injection: 'Format as a complete email. Use this exact structure:\n\nSubject: [punchy, specific, under 60 chars — promises what is inside]\n\n[Greeting — match formality to recipient]\n\n[Body paragraph 1 — context in 1-2 sentences]\n\n[Body paragraph 2 — the ask or key info]\n\n[Body paragraph 3 if needed — supporting details]\n\n[Explicit ask: "Could you..." / "Please confirm by..."]\n\n[Sign-off — match formality]\n[Name]\n\nMax 250 words total. No filler ("just", "I hope this finds you well"). Active voice only. The ask must be unambiguous in 30 seconds of reading.',
  },
  power_bi: {
    id: 'power_bi',
    label: 'Power BI / Tableau spec',
    icon: 'B',
    category: 'data',
    valueShort: 'A dashboard specification: which charts to build, which fields to use, which DAX formulas to write, what filters and KPIs to expose. Hand to a BI developer or build it yourself.',
    audience: 'BI developers, data analysts, anyone briefing a dashboard build.',
    downloadTruth: 'Use the spec to build the dashboard yourself in Power BI or Tableau, or hand it to a BI dev as the build brief.',
    injection: 'Format as a Power BI / Tableau dashboard specification. Output these sections:\n\n## 1. Dashboard Purpose\nOne sentence: who uses it, what decision it supports.\n\n## 2. Data Sources\nList each table / dataset, its grain, key fields, refresh frequency.\n\n## 3. KPI Tiles (top of dashboard)\nFor each KPI: name, formula (DAX or calculation), target value, conditional formatting rule.\n\n## 4. Visuals\nFor each chart: chart type (bar/line/scatter/treemap/etc.), x-axis, y-axis, color encoding, filters applied, business question it answers.\n\n## 5. Filters / Slicers\nWhich dimensions users can filter on, default selections.\n\n## 6. DAX / Calculated Measures\nFor any non-trivial calculation, write the exact DAX or Tableau formula.\n\n## 7. Drill-throughs\nWhich charts drill to which detail views.\n\n## 8. Performance Notes\nIndexing, aggregation, query optimization guidance.\n\nNo prose narrative — this is a build brief.',
  },
  json: {
    id: 'json',
    label: 'JSON data',
    icon: 'J',
    category: 'data',
    valueShort: 'Structured machine-readable data. Use it as input to another tool, an API, or a script. No prose.',
    audience: 'Developers, automation builders, anyone piping AI output into another system.',
    downloadTruth: 'Copy the JSON, save as a .json file, or feed it directly to your code / API / workflow.',
    injection: 'Format the response as a single valid JSON object. Rules:\n- Output ONLY JSON. No prose before, no prose after, no markdown fences.\n- Use snake_case keys.\n- Use ISO 8601 for any dates ("2026-05-25") and ISO 8601 with timezone for timestamps ("2026-05-25T14:30:00Z").\n- Use null for missing values, not empty strings.\n- Arrays for repeated entities, objects for named groupings.\n- Include a top-level "schema_version": "1.0" and "generated_at": "<ISO timestamp>".\n- The output must parse cleanly with JSON.parse() — no trailing commas, no comments, no unescaped quotes inside strings.',
  },
};

export const OUTPUT_FORMAT_ORDER: OutputFormatId[] = [
  'text', 'markdown', 'email', 'word', 'pdf_1pager', 'research_report',
  'powerpoint', 'html',
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
