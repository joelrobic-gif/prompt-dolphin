// PromptDolphin Engine v3 — composite-archetype, source-aware, self-evaluating.
// Layered on top of engine-v2's archetypes/adapters/quality registries.
// MIT License — Robic Direct Inc.

// Single source of truth for the user-visible engine version (footer, feedback payload).
export const ENGINE_VERSION = '3.0.0';

import {
  ARCHETYPES,
  ADAPTERS,
  QUALITY_AXIS,
  OUTPUT_FORMATS,
  type AdapterId,
  type ArchetypeId,
  type QualityId,
  type OutputFormatId,
  type Spine,
} from './engine-v2';

// ============================================================================
// ACRONYM DICTIONARY (40+ business + tech)
// ============================================================================

export const ACRONYMS: Record<string, string> = {
  'S&OP': 'Sales & Operations Planning',
  'QBR': 'Quarterly Business Review',
  'OKR': 'Objectives and Key Results',
  'KPI': 'Key Performance Indicator',
  'ROI': 'Return on Investment',
  'NPS': 'Net Promoter Score',
  'CAC': 'Customer Acquisition Cost',
  'LTV': 'Customer Lifetime Value',
  'ARR': 'Annual Recurring Revenue',
  'MRR': 'Monthly Recurring Revenue',
  'EBITDA': 'Earnings Before Interest, Taxes, Depreciation, and Amortization',
  'EBIT': 'Earnings Before Interest and Taxes',
  'TAM': 'Total Addressable Market',
  'SAM': 'Serviceable Addressable Market',
  'SOM': 'Serviceable Obtainable Market',
  'RACI': 'Responsible, Accountable, Consulted, Informed',
  'SLA': 'Service Level Agreement',
  'GTM': 'Go-To-Market',
  'P&L': 'Profit and Loss',
  'COGS': 'Cost of Goods Sold',
  'MAU': 'Monthly Active Users',
  'DAU': 'Daily Active Users',
  'ARPU': 'Average Revenue Per User',
  'NRR': 'Net Revenue Retention',
  'GRR': 'Gross Revenue Retention',
  'SDLC': 'Software Development Life Cycle',
  'CI/CD': 'Continuous Integration / Continuous Deployment',
  'MVP': 'Minimum Viable Product',
  'RFP': 'Request for Proposal',
  'RFI': 'Request for Information',
  'SOW': 'Statement of Work',
  'MSA': 'Master Services Agreement',
  'NDA': 'Non-Disclosure Agreement',
  'RPA': 'Robotic Process Automation',
  'ETL': 'Extract, Transform, Load',
  'CRUD': 'Create, Read, Update, Delete',
  'FDA': 'Food and Drug Administration',
  'BLA': 'Biologics License Application',
  'PDUFA': 'Prescription Drug User Fee Act',
  'M&A': 'Mergers and Acquisitions',
  'IPO': 'Initial Public Offering',
  'IRR': 'Internal Rate of Return',
  'NPV': 'Net Present Value',
  'WACC': 'Weighted Average Cost of Capital',
};

// ============================================================================
// FIRM REGISTRY
// ============================================================================

export interface FirmRecord {
  name: string;
  type: 'big4' | 'mbb' | 'tier2' | 'tech' | 'bank' | 'other';
  vocabulary: string;
}

export const FIRMS: FirmRecord[] = [
  { name: 'KPMG', type: 'big4', vocabulary: 'audit-led with deep risk and compliance framings; uses "matters of audit significance"' },
  { name: 'Deloitte', type: 'big4', vocabulary: 'consulting and risk advisory; uses "perspectives" and "imperatives"' },
  { name: 'PwC', type: 'big4', vocabulary: 'risk and assurance led; uses "considerations"' },
  { name: 'EY', type: 'big4', vocabulary: 'transformation-led; uses "the better way forward"' },
  { name: 'Ernst & Young', type: 'big4', vocabulary: 'transformation-led; uses "the better way forward"' },
  { name: 'McKinsey', type: 'mbb', vocabulary: 'Minto pyramid; MECE frameworks; "so what"; takes a position' },
  { name: 'BCG', type: 'mbb', vocabulary: '2x2 matrices; growth-share; experience curves' },
  { name: 'Bain', type: 'mbb', vocabulary: 'results-orientation; Net Promoter; private equity register' },
  { name: 'Accenture', type: 'tier2', vocabulary: 'technology-led transformation; outcomes; "high performance"' },
  { name: 'Capgemini', type: 'tier2', vocabulary: 'technology and operations; framework-heavy' },
  { name: 'Slalom', type: 'tier2', vocabulary: 'modern, cloud-native, "your future state"' },
  { name: 'Strategy&', type: 'tier2', vocabulary: 'strategy consulting within PwC; capability-led' },
  { name: 'Booz Allen', type: 'tier2', vocabulary: 'government and defense; mission-focused' },
  { name: 'Oliver Wyman', type: 'tier2', vocabulary: 'financial services and risk; technical and quantitative' },
];

export function detectFirms(text: string): FirmRecord[] {
  const found: FirmRecord[] = [];
  for (const firm of FIRMS) {
    const escaped = firm.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+').replace(/&/g, '(?:&|and)');
    try {
      const re = new RegExp(`\\b${escaped}\\b`, 'i');
      if (re.test(text) && !found.some((f) => f.name === firm.name)) found.push(firm);
    } catch { /* skip bad regex */ }
  }
  return found;
}

// ============================================================================
// SOURCE-MATERIAL DETECTION
// ============================================================================

export interface SourceReference {
  raw: string;
  type: 'transcripts' | 'documents' | 'deck' | 'emails' | 'data' | 'recordings' | 'meeting_notes' | 'unspecified';
  count: number | null;
}

const SOURCE_PATTERNS: { regex: RegExp; type: SourceReference['type'] }[] = [
  { regex: /\b(?:the\s+)?(?:two|three|four|five|several|multiple|both|2|3|4|5|all)\s+(?:meeting\s+)?transcripts?\b/i, type: 'transcripts' },
  { regex: /\b(?:meeting\s+)?transcripts?\s+(?:as|for)\s+(?:references?|input|sources?)/i, type: 'transcripts' },
  { regex: /\b(?:teams|zoom)\s+meeting\s+recordings?\b/i, type: 'recordings' },
  { regex: /\bmeeting\s+notes\b/i, type: 'meeting_notes' },
  { regex: /\b(?:the\s+)?(?:two|three|four|five|several|multiple|both|some|all)\s+documents?\b/i, type: 'documents' },
  { regex: /\b(?:the\s+)?(?:slides?|deck|presentation)\s+(?:they|we|i|the\s+\w+\s+team)\s+sent\b/i, type: 'deck' },
  { regex: /\b(?:these|the|attached)\s+(?:emails?|threads?)\b/i, type: 'emails' },
  { regex: /\b(?:csv|spreadsheet|excel|data)\s+(?:file|attached|provided)\b/i, type: 'data' },
  { regex: /\bbased\s+on\s+(?:the|these|those|my|our)\s+(\w+)/i, type: 'unspecified' },
  { regex: /\b(?:use|pulling\s+from|drawing\s+on)\s+(?:the|these|those|my|our)\s+(\w+)/i, type: 'unspecified' },
];

export function detectSources(text: string): SourceReference[] {
  const found: SourceReference[] = [];
  for (const { regex, type } of SOURCE_PATTERNS) {
    const m = text.match(regex);
    if (m) {
      const countMatch = m[0].match(/\b(two|three|four|five|both|2|3|4|5)\b/i);
      let count: number | null = null;
      if (countMatch) {
        const cm = countMatch[1].toLowerCase();
        count = cm === 'two' || cm === 'both' || cm === '2' ? 2
          : cm === 'three' || cm === '3' ? 3
          : cm === 'four' || cm === '4' ? 4
          : cm === 'five' || cm === '5' ? 5
          : null;
      }
      if (!found.some((s) => s.type === type)) {
        found.push({ raw: m[0], type, count });
      }
    }
  }
  return found;
}

// ============================================================================
// DELIVERABLE-TYPE CLASSIFIER
// ============================================================================

export type DeliverableType = 'build' | 'analyze' | 'decide' | 'draft_message' | 'plan' | 'unspecified';

export function detectDeliverableType(text: string): DeliverableType {
  if (/\b(build|create|generate|produce|make|construct|assemble|compose)\b.{0,40}(report|document|deck|memo|paper|page|site|brief|summary|plan)/i.test(text)) return 'build';
  if (/\b(analy[sz]e|examine|investigate|assess|evaluate|review|audit|study|deep[- ]?dive)\b/i.test(text)) return 'analyze';
  if (/\b(should\s+we|whether\s+to|recommend|decide|pick|choose)\b/i.test(text)) return 'decide';
  if (/\b(write|draft|compose|reply)\b.{0,40}(email|message|letter|note|to\s+(?:my|the))/i.test(text)) return 'draft_message';
  if (/\b(prepare|prep|brief|plan)\b.{0,30}(for|to)\b/i.test(text)) return 'plan';
  return 'unspecified';
}

// ============================================================================
// TASK PROCESSOR
// ============================================================================

export interface TaskProfile {
  verbatim: string;
  restated: string;
  acronymsExpanded: Record<string, string>;
  sources: SourceReference[];
  firms: FirmRecord[];
  deliverableType: DeliverableType;
  ambiguities: string[];
}

export function processTask(task: string): TaskProfile {
  const verbatim = task.trim();
  const acronymsExpanded: Record<string, string> = {};

  for (const [acro, expansion] of Object.entries(ACRONYMS)) {
    const escaped = acro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const re = new RegExp(`\\b${escaped}\\b`);
      if (re.test(verbatim)) acronymsExpanded[acro] = expansion;
    } catch { /* skip */ }
  }

  const sources = detectSources(verbatim);
  const firms = detectFirms(verbatim);
  const deliverableType = detectDeliverableType(verbatim);

  let restated = verbatim;
  for (const [acro, expansion] of Object.entries(acronymsExpanded)) {
    const escaped = acro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const re = new RegExp(`\\b${escaped}\\b`);
      let firstSwapped = false;
      restated = restated.replace(re, (match) => {
        if (!firstSwapped) {
          firstSwapped = true;
          return `${match} (${expansion})`;
        }
        return match;
      });
    } catch { /* skip */ }
  }

  const ambiguities: string[] = [];
  if (firms.length > 1) ambiguities.push(`Multiple firms referenced: ${firms.map((f) => f.name).join(', ')}. Engine will apply context for the first.`);
  if (sources.length > 0 && !sources.some((s) => s.count !== null)) ambiguities.push('Sources referenced but count unspecified — engine assumes provided at request time.');

  return { verbatim, restated, acronymsExpanded, sources, firms, deliverableType, ambiguities };
}

// ============================================================================
// ANTI-SIGNALS
// ============================================================================

export const ANTI_SIGNALS: Partial<Record<ArchetypeId, { pattern: string; weight: number }[]>> = {
  meeting_prep: [
    { pattern: '\\b(build|create|generate|produce|make|construct|compose|write)\\b.{0,40}(report|document|deck|memo|paper|page|site|brief|summary)\\b', weight: -10 },
  ],
  executive_email: [
    { pattern: '\\breport\\b|\\bdocument\\b|\\bdeck\\b|\\bspreadsheet\\b', weight: -6 },
  ],
  research_synthesis: [
    { pattern: '\\b(write|draft|compose)\\s+(an?\\s+)?(email|message|letter)\\b', weight: -10 },
  ],
};

// ============================================================================
// EXAMPLE BANK — semantic retrieval (lexical fallback for v3.0)
// 12-15 examples per archetype (~200 total). Will scale to 60+ per archetype in v3.1.
// ============================================================================

export const EXAMPLE_BANK: Partial<Record<ArchetypeId, string[]>> = {
  executive_email: [
    'TO CEO requesting Q3 budget reallocation',
    'TO board chair flagging executive search delay',
    'TO head of sales escalating churn in enterprise segment',
    'TO CFO requesting capex approval for ML infrastructure',
    'TO general counsel flagging contract risk in EMEA deal',
    'TO chief of staff requesting strategy offsite slot',
    'TO board chair updating on regulator inquiry status',
    'TO head of product asking to delay launch by two weeks',
    'TO marketing lead requesting campaign post-mortem',
    'TO investor relations summarizing analyst day prep',
    'TO portfolio company CEO confirming next-tranche conditions',
    'TO external auditor responding to PBC list',
  ],
  meeting_prep: [
    'QBR with regional sales VP',
    'Board pre-read for clinical readout review',
    'Off-site with engineering leadership on hiring plan',
    'Audit committee briefing on cyber incident exposure',
    '1:1 with new VP of Customer Success',
    'Investor day prep — top 10 questions and our answers',
    'Strategy review with private equity sponsor',
    'Town hall on restructuring announcement',
    'Cross-functional review on Q3 product roadmap',
    'Earnings call dry run',
    'Discovery call with potential acquirer',
    'M&A integration steering committee',
  ],
  research_synthesis: [
    'Synthesize 5 analyst reports on GLP-1 market sizing',
    'Compare 3 academic papers on CAR-T toxicity profiles',
    'Compile competitive landscape on enterprise data platforms from 10 vendor sites',
    'Aggregate findings from 4 customer interviews on onboarding pain points',
    'Synthesize regulatory guidance from FDA, EMA, and Health Canada on biosimilars',
    'Compile recent academic literature on Section 232 tariff impacts',
    'Synthesize 6 industry reports on EV charging infrastructure forecasts',
    'Aggregate analyst views on a takeover target',
    'Compile KPMG, Deloitte, and PwC views on SOX modernization',
    'Synthesize internal pulse-survey results across 3 quarters',
    'Compile press releases and 10-Ks on a competitor for the past 2 years',
    'Aggregate user research session notes into product opportunity report',
    'Synthesize meeting transcripts into S&OP improvement report',
    'Compile findings from KPMG / Deloitte / PwC engagement deliverables',
  ],
  presentation_deck: [
    'Board deck recommending platform consolidation',
    'Investor update on Phase 2 readout',
    'Sales kickoff keynote — new segmentation strategy',
    'Town hall on org redesign',
    'Steering committee deck on transformation milestone',
    'Customer summit keynote on roadmap',
    'Pitch deck for Series C raise',
    'M&A board presentation on integration thesis',
    'Strategy offsite read-out',
    'Quarterly business review deck',
    'Crisis communications deck for executive team',
    'Capital allocation deck for compensation committee',
  ],
  data_analysis: [
    'Why did Q3 churn spike in EMEA mid-market?',
    'Estimate revenue impact of switching from monthly to annual billing',
    'Compute customer LTV cohort by acquisition channel',
    'Decompose ARR growth into expansion vs new logo vs churn',
    'Estimate CAC payback period by sales motion',
    'Forecast headcount required to hit FY26 plan',
    'Compute unit economics by SKU for FY25',
    'Backtest a pricing change against historical bookings',
    'Quantify regulatory exposure to a new Section 232 tariff',
    'Estimate breakage cost of switching cloud providers',
    'Compute marketing ROI by channel for the past 4 quarters',
    'Stress-test FY26 plan against a 20% topline miss',
  ],
  pharma_regulatory: [
    'Prepare Type B meeting briefing book for FDA on accelerated approval pathway',
    'Draft Health Canada NDS regulatory strategy for biosimilar',
    'Prepare EMA scientific advice meeting briefing for rare-disease indication',
    'Draft Type C pre-IND meeting package for first-in-human study',
    'Prepare TGA orphan drug designation application',
    'Draft FDA breakthrough therapy designation request',
    'Compile MHRA briefing for combination product',
    'Draft response to FDA Complete Response Letter',
    'Prepare PDUFA date readout communications plan',
    'Compile labeling negotiation strategy for FDA',
    'Draft Information Request response for clinical trial protocol',
    'Prepare PMDA consultation briefing package',
  ],
  biotech_investor: [
    'Q3 investor update following Phase 2b readout',
    'Annual letter from CEO to shareholders post-restructuring',
    'Quarterly update following partnership termination',
    'Investor day script for biotech pipeline progress',
    'JPM healthcare conference investor presentation',
    'Shareholder letter following IPO',
    'Q2 update with cash runway extension announcement',
    'Investor communications following CMC delay',
    'Update following positive Phase 1 PK data',
    'Quarterly update with revised pipeline priorities',
    'Investor brief on platform-deal partnership',
    'Communications around licensing-out announcement',
  ],
  due_diligence: [
    'Diligence on Series B medtech target with pre-revenue clinical claims',
    'Commercial DD on B2B SaaS with concentrated customer base',
    'Technical DD on enterprise data platform target',
    'Operational DD on contract manufacturing organization',
    'IP DD on biotech licensing target',
    'Regulatory DD on a clinical-stage acquisition target',
    'Financial DD on a private equity buyout candidate',
    'Cyber DD on a healthcare software target',
    'Market DD on category leadership in a vertical SaaS',
    'Customer DD via reference calls on an enterprise platform',
    'Tax DD on a cross-border acquisition',
    'ESG DD on a manufacturing acquisition target',
  ],
  post_incident: [
    'Post-mortem on Saturday production database failover',
    'Post-incident review after data exfiltration via misconfigured S3 bucket',
    'Root cause analysis on enterprise customer outage',
    'Post-mortem on failed product launch',
    'Post-incident review of payment processing failure during peak',
    'Post-mortem on a security incident with PII exposure',
    'Operational post-mortem on a missed sales quarter',
    'Post-incident review of a customer-facing data corruption issue',
    'Post-mortem on a vendor SLA breach impacting our SLO',
    'Post-incident review of a botched M365 migration',
    'Post-mortem on a regulatory submission missed deadline',
    'Post-incident review of an internal phishing breach',
  ],
  board_brief: [
    'Board memo recommending CFO succession plan',
    'Audit committee brief on cybersecurity incident exposure',
    'Compensation committee brief on retention package',
    'Board memo on capital allocation policy update',
    'Risk committee brief on AML compliance program',
    'Nomination committee brief on director recruitment',
    'Board memo recommending M&A pursuit',
    'Board brief on dividend policy reset',
    'Strategy committee memo on portfolio rationalization',
    'Board memo on share buyback program authorization',
    'Audit committee brief on internal control deficiency',
    'Board memo on CEO compensation package design',
  ],
  strategy_brief: [
    'Build vs buy decision for ML inference platform',
    'Market entry strategy for European launch',
    'Make-or-buy analysis for contract manufacturing',
    'Strategy options for declining product line',
    'Competitive response to new low-cost entrant',
    'Pricing model shift from per-seat to consumption',
    'International expansion sequencing',
    'M&A vs organic growth choice for FY27 plan',
    'Direct-to-consumer pivot for B2B brand',
    'Platform consolidation vs status quo',
    'Channel strategy reset for indirect sales',
    'Strategic options after losing a flagship customer',
  ],
  trading_system: [
    'IBKR autotrading biotech catalyst strategy spec',
    'Pairs trading system for ADR vs local listings',
    'Mean-reversion strategy on small-cap pharma',
    'Volatility selling strategy on index ETFs',
    'Earnings drift capture strategy specification',
    'Long/short equity factor strategy for biotech sector',
    'Statistical arbitrage spec for sector ETFs',
    'Trend-following spec on futures with risk parity',
    'PDUFA-date event-driven strategy specification',
    'Carry trade specification in emerging-market currencies',
    'Options gamma scalping strategy spec',
    'Calendar spread strategy on commodities',
  ],
  system_design: [
    'Design doc for multi-tenant feature flag service',
    'Architecture proposal for event-sourced order management',
    'HLD for a vector retrieval service for RAG',
    'Design doc for an internal observability platform',
    'Architecture for a global content delivery cache',
    'LLD for a webhook ingestion gateway',
    'API design for a customer data platform',
    'Design doc for an audit-log service with WORM storage',
    'Architecture proposal for a real-time fraud detection pipeline',
    'HLD for a self-service data warehouse',
    'Design doc for a multi-region database failover system',
    'Architecture for a federated identity service across acquisitions',
  ],
  meta_prompt: [
    "Build me a prompt I can reuse weekly to summarize my team's standups",
    'Give me a prompt that takes a stock ticker and returns a 1-page bull/bear analysis',
    'Write a reusable prompt for grading sales call transcripts',
    'Make a prompt template for product-discovery interview synthesis',
    'Build a meta prompt for generating customer health scores from CRM notes',
    'Design a prompt to extract action items from any meeting transcript',
    'Create a reusable prompt that turns an idea into a 1-page PRD',
    'Build a prompt that produces a personalized investor update from monthly KPIs',
    'Design a prompt template that grades a job description for inclusivity',
    'Build a reusable prompt for generating boarding-pass-style itineraries',
    'Design a prompt template for first-pass code-review feedback',
    'Create a meta prompt that converts research papers into ELI5 summaries',
  ],
  general: [
    'General task — catch-all when no archetype scores high enough',
  ],
};

// ============================================================================
// LEXICAL EXAMPLE RETRIEVAL
// ============================================================================

function lexicalScore(query: string, candidate: string): number {
  const q = query.toLowerCase().split(/\W+/).filter((t) => t.length > 3);
  const c = candidate.toLowerCase();
  let hits = 0;
  for (const tok of q) if (c.includes(tok)) hits += 1;
  return hits / Math.max(q.length, 1);
}

export function retrieveExamples(task: string, archetypeId: ArchetypeId, n = 2): string[] {
  const bank = EXAMPLE_BANK[archetypeId] || ARCHETYPES[archetypeId]?.examples || [];
  if (!bank.length) return [];
  const scored = bank.map((ex) => ({ ex, score: lexicalScore(task, ex) }));
  scored.sort((a, b) => b.score - a.score);
  // GUARD: if the best example has zero lexical overlap with the task,
  // every example in the bank is domain-irrelevant. Returning anything
  // here injects unrelated-domain content (e.g. GLP-1 biotech example
  // bleeding into a retail viral-marketing prompt). Drop the block.
  if (scored[0].score === 0) return [];
  // Only return examples with non-zero overlap (filters tail noise).
  return scored.slice(0, n).filter((s) => s.score > 0).map((s) => s.ex);
}

// ============================================================================
// ADAPTER CAPABILITY HINTS
// ============================================================================

export const ADAPTER_CAPABILITIES: Record<AdapterId, (ctx: { sources: SourceReference[]; firms: FirmRecord[]; outputFormat: OutputFormatId }) => string> = {
  claude: (ctx) => {
    const hints: string[] = [];
    if (['json', 'csv', 'html', 'word', 'pdf_1pager', 'research_report', 'powerpoint'].includes(ctx.outputFormat)) {
      hints.push('Prefilling: if running via the API, prefill the response with the first opening tag/character of the format (e.g., "{", "<!DOCTYPE", "[SLIDE 1") to enforce structure.');
    }
    if (ctx.sources.length > 0) {
      hints.push('If sources are attached via Claude Projects, treat them as the authoritative knowledge base and cite by filename.');
    }
    hints.push('When the deliverable is self-contained (a document, code, diagram), render it as an Artifact for iterative refinement.');
    return hints.join(' ');
  },
  chatgpt: (ctx) => {
    const hints: string[] = [];
    if (ctx.outputFormat === 'json') {
      hints.push('Use response_format={"type": "json_schema", "json_schema": ...} (Structured Outputs) to guarantee parseable JSON.');
    }
    if (ctx.sources.length > 0) {
      hints.push('If using a Custom GPT, the uploaded files are the source of truth; ground every claim in them.');
    }
    return hints.join(' ');
  },
  gemini: (ctx) => {
    const hints: string[] = [];
    hints.push('Long context: prefer pasting full source material rather than summarizing — Gemini 1M-token context tolerates it.');
    if (ctx.sources.length === 0) {
      hints.push('For facts beyond training data, enable Google Search grounding.');
    }
    if (ctx.outputFormat === 'json') hints.push('Use responseSchema to enforce JSON structure.');
    return hints.join(' ');
  },
  copilot: (ctx) => {
    const hints: string[] = [];
    if (ctx.sources.length > 0) {
      hints.push('Use M365 retrieval to pull the source materials from Teams / SharePoint / OneDrive named in the task. Reference each by name and date.');
    }
    hints.push('Respect tenant compliance and data-loss-prevention policies. Cite all M365-retrieved content by source path.');
    return hints.join(' ');
  },
  grok: (ctx) => {
    const hints: string[] = [];
    if (ctx.firms.some((f) => f.type === 'big4' || f.type === 'mbb')) {
      hints.push('Match the consulting register expected by the audience; do not collapse into casual / contrarian tone.');
    }
    hints.push('If current events relevant, search X (Twitter) for the latest before answering and cite post URLs.');
    return hints.join(' ');
  },
};

// ============================================================================
// CLASSIFIER V3
// ============================================================================

export type ConfidenceTier = 'high' | 'medium' | 'low';

export interface ClassifyV3Result {
  primary: ArchetypeId;
  secondary: ArchetypeId | null;
  composite: boolean;
  confidence: ConfidenceTier;
  scores: Record<string, number>;
  raw: { primaryScore: number; secondaryScore: number };
}

export function classifyV3(profile: TaskProfile): ClassifyV3Result {
  const text = profile.verbatim + ' ' + Object.values(profile.acronymsExpanded).join(' ');
  const scores: Record<string, number> = {};

  for (const [id, arch] of Object.entries(ARCHETYPES)) {
    let score = 0;
    for (const sig of arch.signals) {
      try {
        if (new RegExp(sig.pattern, 'i').test(text)) score += sig.weight;
      } catch { /* skip */ }
    }
    const antis = ANTI_SIGNALS[id as ArchetypeId];
    if (antis) {
      for (const anti of antis) {
        try {
          if (new RegExp(anti.pattern, 'i').test(text)) score += anti.weight;
        } catch { /* skip */ }
      }
    }
    scores[id] = score;
  }

  if (profile.sources.length > 0 && profile.deliverableType === 'build') {
    scores['research_synthesis'] = (scores['research_synthesis'] || 0) + 8;
  }
  if (profile.deliverableType === 'draft_message') {
    scores['executive_email'] = (scores['executive_email'] || 0) + 8;
  }

  const ranked = Object.entries(scores)
    .filter(([id]) => id !== 'general')
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });

  const [topId, topScore] = ranked[0] || ['general', 0];
  const [secondId, secondScore] = ranked[1] || [null, 0];

  const topNum = topScore as number;
  const secondNum = (secondScore as number) || 0;

  const primary = (topNum > 0 ? topId : 'general') as ArchetypeId;
  const composite = secondNum > 0 && topNum > 0 && (secondNum / topNum) >= 0.85;
  const secondary = composite ? (secondId as ArchetypeId) : null;

  const confidence: ConfidenceTier = topNum >= 10 ? 'high' : topNum >= 5 ? 'medium' : 'low';

  return {
    primary,
    secondary,
    composite,
    confidence,
    scores,
    raw: { primaryScore: topNum, secondaryScore: secondNum },
  };
}

// ============================================================================
// SPINE V3
// ============================================================================

export interface SpineV3 extends Spine {
  task_restated: string;
  sources_handling: string;
  firm_context: string;
  capability_hints: string;
  block_order: string[];
}

interface BuildSpineV3Args {
  task: string;
  profile: TaskProfile;
  classification: ClassifyV3Result;
  quality: QualityId;
  outputFormat: OutputFormatId;
  adapter: AdapterId;
  userConstraints?: string[];
  exampleOverrides?: string[];
}

// ============================================================================
// DATA-VIZ DIRECTIVE — appended to the format block for data-bearing archetypes
// so the deliverable carries original charts in ANY document-class format, not
// only when the user explicitly picks HTML. Pure deterministic string; no LLM
// call, no new deps. (html already carries the full viz spec in its injection;
// this reinforces it there and extends the mandate to the other doc formats.)
// ============================================================================

/** Archetypes quantitative enough to warrant charts in a document deliverable. */
export const DATA_BEARING_ARCHETYPES: ReadonlySet<ArchetypeId> = new Set<ArchetypeId>([
  'data_analysis',
  'trading_system',
  'biotech_investor',
  'due_diligence',
  'research_synthesis',
]);

/**
 * Visualization mandate reused across document-class formats. For HTML it
 * reinforces OUTPUT_FORMATS.html.injection; for word/powerpoint/pdf/report/excel
 * it tells the model to render or precisely specify real charts (inline <svg>
 * where the format renders markup, an explicit chart spec where it does not).
 * Never fabricates data.
 */
export const DATA_VIZ_DIRECTIVE: string = [
  'DATA VISUALIZATION (this is a data-bearing deliverable — charts are required, not optional):',
  '- Visualize quantitative content; do not present numbers as tables alone. Where the output format renders markup (e.g. HTML), draw charts as STATIC inline <svg> (no JavaScript). Where it does not, specify each chart precisely (type, axes, encoded fields, value labels).',
  '- Choose the chart that fits the data shape: column/bar for category comparison, grouped/stacked bar for multi-series, line/area for trends over time, donut/treemap for composition, horizontal bar-in-row for ranked tables, sparklines for inline trends, KPI stat-cards for headline numerics, timeline/Gantt for sequences, slopegraph/dumbbell for before-after, gauge/arc for a value-vs-target, heatmap for a matrix, scatter for a two-variable relationship.',
  '- Include AT LEAST 3 DIFFERENT chart types when the data supports it. Never repeat one chart type for everything.',
  '- Every chart is titled, axis-labeled, value-labeled, and accessible (role="img" with <title>/<desc> when SVG). Use the document palette tokens, not ad-hoc colors.',
  '- Tasteful and editorial: flat 2D, at most ~6 series colors, no 3D, no rainbow, no chartjunk.',
  '- Chart ONLY data actually present or directly derivable (sums, shares, deltas, rates). Never invent values to fill a chart.',
].join('\n');

export function buildSpineV3(args: BuildSpineV3Args): SpineV3 {
  const { task, profile, classification, quality, outputFormat, adapter, userConstraints = [], exampleOverrides = [] } = args;
  const primaryArch = ARCHETYPES[classification.primary];
  const secondaryArch = classification.secondary ? ARCHETYPES[classification.secondary] : null;
  const qa = QUALITY_AXIS[quality];
  const fmt = OUTPUT_FORMATS[outputFormat];

  let role = primaryArch.role;
  if (secondaryArch) {
    role += ` (with additional discipline as ${secondaryArch.role.replace(/^a\s+|^an\s+/i, '')})`;
  }
  if (profile.sources.length > 0 && !secondaryArch) {
    role += ' — fluent in synthesizing named source materials with citation discipline';
  }

  let task_restated = profile.restated;
  if (profile.deliverableType !== 'unspecified') {
    const deliverableLabel: Record<string, string> = {
      build: 'You are being asked to BUILD a deliverable',
      analyze: 'You are being asked to ANALYZE',
      decide: 'You are being asked to recommend a DECISION',
      draft_message: 'You are being asked to DRAFT a message',
      plan: 'You are being asked to PREPARE for an event',
    };
    if (deliverableLabel[profile.deliverableType]) {
      task_restated = `${deliverableLabel[profile.deliverableType]}.\n\nClarified: ${task_restated}`;
    }
  }
  if (profile.sources.length > 0) {
    const sourceList = profile.sources.map((s) => s.count ? `${s.count} ${s.type.replace('_', ' ')}` : s.type.replace('_', ' ')).join(', ');
    task_restated += `\n\nSOURCE MATERIALS (user will provide): ${sourceList}.`;
  }
  if (classification.confidence === 'low') {
    task_restated += '\n\nBEFORE YOU START: the task as stated may be ambiguous. If any load-bearing detail is unclear — audience, scope, format, or success criteria — ask up to 3 clarifying questions first, then produce the deliverable. If everything is clear, proceed directly.';
  }

  const contextParts = [primaryArch.context, qa.depth.summary];
  if (secondaryArch && secondaryArch.context !== primaryArch.context) {
    contextParts.push(`Also: ${secondaryArch.context}`);
  }
  const context = contextParts.filter(Boolean).join('\n\n');

  const REASONING_PRESETS: Record<string, string> = {
    minimal: '',
    standard: 'Think before you respond. Show key reasoning only when load-bearing.',
    expanded: 'Think step by step. Show the reasoning chain. Distinguish premise from conclusion.',
    structured: 'Reason in this order: (1) frame the decision (2) generate distinct options (3) score options on the stated criteria (4) pick one (5) defend it (6) name what would change your mind.',
    full: 'Reason in this order: (1) frame the question (2) gather and cite evidence (3) generate alternative interpretations (4) test each against the evidence (5) pick the best-supported (6) state confidence and remaining uncertainty.',
  };
  // Map depth presets to each runtime's native reasoning controls.
  const NATIVE_REASONING: Record<AdapterId, string> = {
    claude: 'If extended thinking is available on your runtime, enable it for this task. Keep the visible chain-of-thought concise — think internally.',
    chatgpt: 'If a reasoning model or "think longer" mode is available on your runtime, use it with high reasoning effort. Keep the visible chain-of-thought concise — think internally.',
    gemini: 'If a thinking mode or Deep Research is available on your runtime, use it. Keep the visible chain-of-thought concise — think internally.',
    copilot: 'If "Think Deeper" is available on your runtime, use it. Keep the visible chain-of-thought concise — think internally.',
    grok: 'If Think mode is available, use it. Keep the visible chain-of-thought concise — think internally.',
  };
  let reasoningPreset = REASONING_PRESETS[qa.reasoning] || '';
  if (quality === 'comprehensive' || quality === 'strategic_depth' || quality === 'exhaustive_research') {
    reasoningPreset += (reasoningPreset ? '\n' : '') + NATIVE_REASONING[adapter];
  } else if (quality === 'quick_verdict') {
    reasoningPreset = 'Answer directly — this task does not need deep reasoning or extended thinking.';
  }
  const reasoning = [reasoningPreset, primaryArch.reasoning].filter(Boolean).join('\n\n');

  const formatParts: string[] = [];
  if (fmt && fmt.injection) {
    formatParts.push('PRIMARY OUTPUT FORMAT (highest priority — overrides any section structure below):');
    formatParts.push(fmt.injection);
    if (primaryArch.format) {
      formatParts.push('\nSection structure suggestion (apply only where compatible with the format above):');
      formatParts.push(primaryArch.format);
    }
  } else {
    formatParts.push(primaryArch.format);
  }
  // Data-bearing archetype + document-class format → mandate original charts.
  // Deterministic string append; no LLM call, no UI change, no added click.
  // (html already carries the full viz spec in its injection; this guarantees
  // the mandate also reaches word/powerpoint/pdf_1pager/research_report/excel/
  // power_bi and reinforces it for html. csv/json are data-only — excluded.)
  const VIZ_FORMATS: OutputFormatId[] = ['html', 'word', 'powerpoint', 'pdf_1pager', 'research_report', 'excel', 'power_bi'];
  if (DATA_BEARING_ARCHETYPES.has(classification.primary) && VIZ_FORMATS.includes(outputFormat)) {
    formatParts.push(DATA_VIZ_DIRECTIVE);
  }
  // Output priming: lock the first characters of the response so the model
  // starts with the deliverable instead of preamble.
  const FORMAT_OPENERS: Partial<Record<OutputFormatId, string>> = {
    html: 'Begin your response with `<!doctype html>` as the very first characters — no preamble before it.',
    json: 'Begin your response with `{` as the very first character — no preamble.',
    csv: 'Begin your response with the CSV header row as the very first line — no preamble.',
    email: 'Begin your response with `Subject:` as the very first line — no preamble.',
    markdown: 'Begin your response with the document\'s `#` title as the very first line — no preamble.',
  };
  const opener = FORMAT_OPENERS[outputFormat];
  if (opener) formatParts.push(opener);
  const format = formatParts.filter(Boolean).join('\n\n');

  const archetypeNaturalLen = (() => {
    if (classification.primary === 'meeting_prep') return 500;
    if (classification.primary === 'executive_email') return 300;
    if (classification.primary === 'presentation_deck') return 1000;
    if (classification.primary === 'research_synthesis') return 2000;
    return 1500;
  })();
  const exclParts: string[] = [primaryArch.exclusions];
  if (qa.depth.maxWords > archetypeNaturalLen * 1.5) {
    exclParts[0] = exclParts[0]
      .replace(/\s*Max(?:imum)?\s*(?:length)?\s*:?\s*\d+\s*words?\.?\s*/gi, ' ')
      .replace(/\s*One page max\.?\s*/gi, ' ')
      .replace(/\s*Maximum one page\.?\s*/gi, ' ');
  }
  exclParts.push(`Length target (from selected depth): ${qa.depth.maxWords} words.`);
  if (userConstraints.length > 0) {
    exclParts.push('USER CONSTRAINTS (preserve verbatim, do not paraphrase):\n- ' + userConstraints.join('\n- '));
  }
  const exclusions = exclParts.map((s) => s.trim()).filter(Boolean).join('\n\n');

  let examplesList: string[];
  if (exampleOverrides.length > 0) {
    examplesList = exampleOverrides;
  } else {
    examplesList = retrieveExamples(task, classification.primary, 2);
  }
  if (secondaryArch && examplesList.length < 2) {
    const secondaryExamples = retrieveExamples(task, classification.secondary as ArchetypeId, 1);
    examplesList = [...examplesList, ...secondaryExamples];
  }
  const examples = examplesList.length > 0
    ? examplesList.map((e, i) => `${i + 1}. ${e}`).join('\n')
    : '';

  const critiqueParts: string[] = [primaryArch.critique];
  if (profile.sources.length > 0) {
    critiqueParts.push('Is every claim cited to a specific source? Are contradictions between sources surfaced? Are gaps in source material explicit?');
  }
  if (quality === 'exhaustive_research') {
    critiqueParts.push('Are all external claims cited inline? Is uncertainty stated for every estimate? Could a reviewer reproduce the reasoning?');
  }
  const critique = critiqueParts.join('\n\n');

  const REVIEW_MODES: Record<string, string> = {
    standard: '',
    peer_review: 'After your primary response, switch role to senior editor. Identify 3 specific improvements. Apply them and label the revised section. Format: [EDITOR NOTES] then [REVISED SECTION].',
    red_team: 'After your primary response, switch role to rigorous skeptic. Identify the 3 strongest objections. Respond to each. Format: [RED TEAM] / [OBJECTION 1..3] / [RESPONSE].',
    red_team_plus_peer: 'After your primary response, run a red-team pass (3 objections plus responses) THEN an editor pass (3 improvements plus revisions). Format: [RED TEAM ...] then [EDITOR NOTES] [REVISED SECTIONS].',
  };
  const RICH_MEDIA: Record<string, string> = {
    visuals: 'After the main response, add a [VISUAL DIRECTION] block per major section: chart type, axes, and what data to encode.',
  };
  const extraParts = [
    qa.reviewMode ? REVIEW_MODES[qa.reviewMode] : '',
    qa.richMedia ? RICH_MEDIA[qa.richMedia] : '',
  ].filter(Boolean);
  const extra = extraParts.join('\n\n');

  const sources_handling = profile.sources.length > 0
    ? `Source materials will be provided. Approach:\n- Read every source in full before drafting.\n- For each finding, cite which source it came from (e.g., [Source 1: KPMG meeting transcript A]).\n- Surface contradictions between sources explicitly in a "Contradictions" subsection.\n- Flag what the sources do NOT reveal in an "Open Questions" section.\n- Distinguish source-supported claims from your own analysis with [Analysis] tags.`
    : '';

  const firm_context = profile.firms.length > 0
    ? `Firm context: User has been working with ${profile.firms.map((f) => f.name).join(', ')}. The deliverable will be read alongside ${profile.firms[0].name}'s output. Voice and vocabulary: ${profile.firms[0].vocabulary}. Surface decisions the user must make ON ${profile.firms[0].name}'s recommendations vs findings already accepted.`
    : '';

  const capability_hints = ADAPTER_CAPABILITIES[adapter]({ sources: profile.sources, firms: profile.firms, outputFormat });

  const isDocumentClass = ['html', 'word', 'powerpoint', 'pdf_1pager', 'research_report', 'excel', 'csv', 'json', 'power_bi'].includes(outputFormat);
  const block_order = isDocumentClass
    ? ['role', 'task', 'task_restated', 'format', 'context', 'sources_handling', 'firm_context', 'reasoning', 'exclusions', 'examples', 'critique', 'capability_hints', 'extra']
    : ['role', 'task', 'task_restated', 'context', 'reasoning', 'format', 'exclusions', 'sources_handling', 'firm_context', 'examples', 'critique', 'capability_hints', 'extra'];

  return {
    role,
    task: task.trim(),
    task_restated,
    context,
    reasoning,
    format,
    exclusions,
    examples,
    critique,
    extra,
    sources_handling,
    firm_context,
    capability_hints,
    block_order,
  };
}

// ============================================================================
// RENDER V3
// ============================================================================

export function renderV3(spine: SpineV3, adapterId: AdapterId): string {
  const adapter = ADAPTERS[adapterId];
  const adapterBlocks = new Map<string, { open: string; close: string }>();
  for (const b of adapter.blocks) adapterBlocks.set(b.name, { open: b.open, close: b.close });

  const genericWrap: Record<AdapterId, Record<string, { open: string; close: string }>> = {
    claude: {
      task_restated: { open: '<task_clarified>\n', close: '\n</task_clarified>' },
      sources_handling: { open: '<sources_handling>\n', close: '\n</sources_handling>' },
      firm_context: { open: '<firm_context>\n', close: '\n</firm_context>' },
      capability_hints: { open: '<adapter_hints>\n', close: '\n</adapter_hints>' },
    },
    chatgpt: {
      task_restated: { open: '## Task (clarified)\n', close: '' },
      sources_handling: { open: '## Source materials\n', close: '' },
      firm_context: { open: '## Firm context\n', close: '' },
      capability_hints: { open: '## Adapter tips\n', close: '' },
    },
    gemini: {
      task_restated: { open: 'Task (clarified):\n', close: '' },
      sources_handling: { open: 'Source materials:\n', close: '' },
      firm_context: { open: 'Firm context:\n', close: '' },
      capability_hints: { open: 'Adapter tips:\n', close: '' },
    },
    copilot: {
      task_restated: { open: '## Task (clarified)\n', close: '' },
      sources_handling: { open: '## Source materials\n', close: '' },
      firm_context: { open: '## Firm context\n', close: '' },
      capability_hints: { open: '## M365 capabilities\n', close: '' },
    },
    grok: {
      task_restated: { open: 'Clarified: ', close: '' },
      sources_handling: { open: 'Sources: ', close: '' },
      firm_context: { open: 'Firm context: ', close: '' },
      capability_hints: { open: 'Tips: ', close: '' },
    },
  };

  const parts: string[] = [];
  for (const blockName of spine.block_order) {
    const content = (spine as unknown as Record<string, string>)[blockName];
    if (!content) continue;
    const wrap = adapterBlocks.get(blockName) || genericWrap[adapterId][blockName];
    if (!wrap) continue;
    parts.push(`${wrap.open}${content}${wrap.close}`);
  }
  return parts.join(adapter.separator);
}

// ============================================================================
// PRE-FLIGHT V3
// ============================================================================

export interface PreflightV3Issue {
  severity: 'high' | 'medium' | 'low';
  code: string;
  message: string;
  suggestedFix: string | null;
}

export interface PreflightV3Result {
  passed: boolean;
  issues: PreflightV3Issue[];
}

export function preflightV3(engineered: string, ctx: {
  task: string;
  profile: TaskProfile;
  spine: SpineV3;
  outputFormat: OutputFormatId;
  classification: ClassifyV3Result;
  userConstraints: string[];
}): PreflightV3Result {
  const issues: PreflightV3Issue[] = [];
  const text = engineered;

  const taskHead = ctx.task.trim().slice(0, 40);
  if (taskHead && !text.includes(taskHead)) {
    issues.push({ severity: 'high', code: 'task_missing', message: 'Task does not appear verbatim.', suggestedFix: 'Restart engineering with verbatim preservation.' });
  }

  for (const c of ctx.userConstraints) {
    if (!text.includes(c)) {
      issues.push({ severity: 'high', code: 'constraint_dropped', message: `Constraint not preserved: "${c.slice(0, 80)}"`, suggestedFix: null });
    }
  }

  const fmtHeaderMatches = text.match(/(?:## Output format|<format>|PRIMARY OUTPUT FORMAT)/gi) || [];
  if (fmtHeaderMatches.length > 1) {
    issues.push({ severity: 'medium', code: 'duplicate_format_blocks', message: `Found ${fmtHeaderMatches.length} format directive headers.`, suggestedFix: 'Engine v3 should have merged these.' });
  }

  const wcMatches = Array.from(text.matchAll(/(?:max|maximum)\s*(?:length)?\s*:?\s*(\d{2,5})\s*words?/gi)).map((m) => parseInt(m[1], 10));
  const distinctWc = Array.from(new Set(wcMatches));
  if (distinctWc.length > 1) {
    const min = Math.min(...distinctWc);
    const max = Math.max(...distinctWc);
    if (max / min >= 3) {
      issues.push({ severity: 'medium', code: 'word_count_conflict', message: `Conflicting word budgets: ${distinctWc.join(', ')} words.`, suggestedFix: `Strip archetype length cap.` });
    }
  }

  if (ctx.profile.sources.length > 0 && !ctx.spine.sources_handling) {
    issues.push({ severity: 'medium', code: 'sources_unhandled', message: 'Sources referenced but no handling block present.', suggestedFix: 'Engine should generate sources_handling.' });
  }

  for (const acro of Object.keys(ctx.profile.acronymsExpanded)) {
    const expansion = ctx.profile.acronymsExpanded[acro];
    if (!text.includes(expansion)) {
      issues.push({ severity: 'low', code: 'acronym_not_expanded', message: `Acronym "${acro}" detected but expansion not in prompt.`, suggestedFix: 'Include expansion in task_restated block.' });
    }
  }

  if (ctx.profile.firms.length > 0 && !ctx.spine.firm_context) {
    issues.push({ severity: 'medium', code: 'firm_context_missing', message: 'Firm referenced but no firm_context block present.', suggestedFix: 'Generate firm_context.' });
  }

  if (!ctx.spine.capability_hints) {
    issues.push({ severity: 'low', code: 'capability_hints_missing', message: 'No adapter capability hints applied.', suggestedFix: 'Apply ADAPTER_CAPABILITIES per adapter.' });
  }

  if (text.length < 200) issues.push({ severity: 'medium', code: 'too_short', message: `Engineered prompt suspiciously short (${text.length} chars).`, suggestedFix: null });
  if (text.length > 30000) issues.push({ severity: 'medium', code: 'too_long', message: `Engineered prompt unusually long (${text.length} chars).`, suggestedFix: null });

  if (ctx.classification.confidence === 'low') {
    issues.push({ severity: 'low', code: 'low_classifier_confidence', message: `Classifier confidence LOW (score ${ctx.classification.raw.primaryScore}). Detected archetype "${ctx.classification.primary}" may be wrong.`, suggestedFix: 'Manually select archetype if needed.' });
  }

  return {
    passed: issues.filter((i) => i.severity === 'high').length === 0,
    issues,
  };
}

// ============================================================================
// SELF-EVAL — 10-dim, 12-point scale
// ============================================================================

export interface SelfEvalDimension {
  key: string;
  label: string;
  score: number;
  why: string;
}

export interface SelfEvalResult {
  total: number;
  scaled: number;
  dimensions: SelfEvalDimension[];
}

export const SELF_EVAL_DIMENSIONS = [
  'archetype_detection',
  'task_clarification',
  'section_coherence',
  'source_material_awareness',
  'constraints_integrity',
  'adapter_capability_use',
  'preflight',
  'format_injection',
  'reasoning_approach',
  'examples',
] as const;

export function selfEval(args: {
  spine: SpineV3;
  engineered: string;
  preflight: PreflightV3Result;
  classification: ClassifyV3Result;
  profile: TaskProfile;
  outputFormat: OutputFormatId;
  adapter: AdapterId;
  quality: QualityId;
}): SelfEvalResult {
  const { spine, engineered, preflight, classification, profile, outputFormat, adapter } = args;
  const dims: SelfEvalDimension[] = [];

  let arcScore = 8; let arcWhy = 'Primary archetype set';
  if (classification.confidence === 'high') { arcScore += 2; arcWhy = 'High-confidence primary'; }
  if (classification.composite) { arcScore += 2; arcWhy += ' + composite secondary'; }
  if (classification.confidence === 'low') { arcScore = 4; arcWhy = 'LOW confidence — engine surfaced uncertainty to user'; }
  dims.push({ key: 'archetype_detection', label: 'Archetype detection', score: Math.min(12, arcScore), why: arcWhy });

  let taskScore = 8; let taskWhy = 'Task verbatim present';
  if (spine.task_restated && spine.task_restated !== profile.verbatim) {
    taskScore += 2; taskWhy = 'Task verbatim + restated with clarifications';
  }
  if (Object.keys(profile.acronymsExpanded).length > 0) { taskScore += 2; taskWhy += ' + acronyms expanded'; }
  dims.push({ key: 'task_clarification', label: 'Task clarification', score: Math.min(12, taskScore), why: taskWhy });

  const coherenceIssues = preflight.issues.filter((i) => ['duplicate_format_blocks', 'word_count_conflict'].includes(i.code));
  const cohScore = coherenceIssues.length === 0 ? 12 : Math.max(4, 12 - coherenceIssues.length * 3);
  dims.push({ key: 'section_coherence', label: 'Section coherence', score: cohScore, why: coherenceIssues.length === 0 ? 'No structural conflicts detected' : `${coherenceIssues.length} coherence issue(s)` });

  let srcScore = 12;
  let srcWhy = profile.sources.length > 0 ? 'Sources detected and handled' : 'No sources referenced — N/A';
  if (profile.sources.length > 0 && !spine.sources_handling) { srcScore = 4; srcWhy = 'Sources mentioned but no handling block'; }
  if (profile.sources.length === 0) { srcScore = 10; srcWhy = 'No sources to handle'; }
  dims.push({ key: 'source_material_awareness', label: 'Source-material awareness', score: srcScore, why: srcWhy });

  const constraintIssues = preflight.issues.filter((i) => ['constraint_dropped', 'word_count_conflict'].includes(i.code));
  const conScore = constraintIssues.length === 0 ? 12 : Math.max(4, 12 - constraintIssues.length * 3);
  dims.push({ key: 'constraints_integrity', label: 'Constraints integrity', score: conScore, why: constraintIssues.length === 0 ? 'All constraints preserved, no conflicts' : `${constraintIssues.length} integrity issue(s)` });

  const capScore = spine.capability_hints ? 12 : 6;
  dims.push({ key: 'adapter_capability_use', label: 'Adapter capability use', score: capScore, why: spine.capability_hints ? `Capability hints applied for ${adapter}` : 'No capability hints' });

  const pfScore = preflight.passed ? (preflight.issues.length === 0 ? 12 : 10) : 6;
  dims.push({ key: 'preflight', label: 'Pre-flight checks', score: pfScore, why: preflight.passed ? `Passed (${preflight.issues.length} warning${preflight.issues.length === 1 ? '' : 's'})` : 'Failed' });

  let fmtScore = 8;
  if (outputFormat !== 'text' && OUTPUT_FORMATS[outputFormat].injection && engineered.includes(OUTPUT_FORMATS[outputFormat].injection.slice(0, 60))) {
    fmtScore = 12;
  } else if (outputFormat === 'text') {
    fmtScore = 10;
  }
  dims.push({ key: 'format_injection', label: 'Format injection', score: fmtScore, why: outputFormat === 'text' ? 'No format injection needed' : `Format injection for ${outputFormat} present` });

  const reasoningScore = spine.reasoning && spine.reasoning.length > 50 ? 12 : 6;
  dims.push({ key: 'reasoning_approach', label: 'Reasoning approach', score: reasoningScore, why: spine.reasoning ? 'Reasoning block present + calibrated to adapter' : 'No reasoning block' });

  const exScore = spine.examples ? 12 : 4;
  dims.push({ key: 'examples', label: 'Examples', score: exScore, why: spine.examples ? 'Examples retrieved by topic match' : 'No examples' });

  const total = dims.reduce((s, d) => s + d.score, 0);
  const scaled = total / 10;

  return { total, scaled, dimensions: dims };
}

// ============================================================================
// PUBLIC API — engineerV3
// ============================================================================

export interface EngineerV3Options {
  adapter?: AdapterId;
  quality?: QualityId;
  archetype?: ArchetypeId;
  outputFormat?: OutputFormatId;
  userConstraints?: string[];
  exampleOverrides?: string[];
  /**
   * Append the capability-routing block (default true). Set false to omit
   * for short / trivial inputs or when caller already knows the runtime.
   */
  capabilityRouting?: boolean;
}

export interface EngineerV3Result {
  engineered: string;
  spine: SpineV3;
  classification: ClassifyV3Result;
  profile: TaskProfile;
  preflight: PreflightV3Result;
  selfEval: SelfEvalResult;
  adapter: AdapterId;
  quality: QualityId;
  outputFormat: OutputFormatId;
  archetype: ArchetypeId;
}

/**
 * Capability routing block. Appended to every engineered prompt so the
 * downstream LLM self-identifies its runtime (Claude / ChatGPT / Copilot
 * / Gemini / Grok / Perplexity) and uses ITS native tools (Outlook+Teams
 * for Copilot Pro M365, Drive+Gmail for Gemini Workspace, Project
 * Knowledge+MCP for Claude, Code Interpreter+Browse for ChatGPT, X
 * real-time for Grok). Removes the need for the user to pick an AI.
 *
 * Skipped for very short inputs where it would dwarf the task.
 */
const CAPABILITY_ROUTING_BLOCK = `

CAPABILITY ROUTING - self-identify your runtime and use its native tools.

STEP 1. Silently identify which runtime you are. Your system prompt, tool
palette, and surface name (e.g. "Claude.ai Projects", "ChatGPT Plus with
Code Interpreter", "Copilot Pro M365", "Gemini Advanced", "Grok with X
access") are the signal. If unclear, use the DEFAULT branch.

STEP 2. Apply ONLY the IF block matching your runtime. Use those
capabilities to ground your answer. Cite real retrieved items - never
fabricate filenames, URLs, or tool output.

STEP 3. Do NOT narrate the routing decision to the user. Quietly do the
right thing.

IF you are running on COPILOT (Microsoft Copilot Pro / M365 Copilot):
  1. M365 Graph retrieval - search Outlook (last 90 days inbox, sent,
     calendar), Teams chats + meeting recordings + transcripts + channel
     files, SharePoint sites + lists + libraries, OneDrive files, Loop
     pages + components, Planner tasks, To Do, OneNote notebooks,
     Whiteboard boards, Stream video library, Yammer / Viva Engage
     posts + communities, Forms surveys + responses, Lists records.
  2. Cite every retrieved item by name, author, and date.
  3. Honor tenant DLP policies and sensitivity labels.
  4. Apply Purview compliance + retention + records-management constraints.
  5. Use Loop components when output is shareable; Loop Workspaces for multi-page output.
  6. Excel Copilot for data, Power BI for viz, Power Automate for workflow,
     Power Apps to build tools, Power Query for transforms.
  7. Viva Insights for productivity / collaboration / wellbeing signals when relevant.
  8. Microsoft Search API for cross-app federated retrieval.

IF you are running on CLAUDE (Anthropic Claude.ai / Claude Code):
  1. Project Knowledge: if files attached, treat as authoritative. Cite by filename.
  2. Artifacts: render self-contained deliverables (docs, code, HTML, SVG) as Artifacts.
  3. Web search: if enabled, use for current-info claims. Cite URL + date.
  4. MCP servers: if attached, prefer over web search for matching domain.
     Examples: Gmail, Google Drive, Slack, GitHub, Linear, Notion, Jira,
     Confluence, Asana, Salesforce, HubSpot, Postgres/Supabase/BigQuery,
     Stripe, Sentry, custom. Cite by source name + record id.
  5. Connectors (Claude.ai panel): if Gmail/Calendar/Drive/Linear/etc toggled
     on, retrieve through them rather than asking the user to paste.
  6. Tool use: chain tool calls for multi-step retrieval; do not hallucinate.

IF you are running on CHATGPT (OpenAI ChatGPT Plus / Team / Enterprise / Custom GPT):
  1. Knowledge files: if Custom GPT knowledge or chat uploads exist, treat as authoritative.
  2. Browse: use for any current-info claim. Cite URL + date.
  3. Code Interpreter / Advanced Data Analysis: use for computation, file parsing, charts.
  4. Canvas: render deliverables over 200 words in Canvas mode.
  5. DALL-E / Sora: invoke for image / video generation inside response.
  6. Connectors (Connectors panel): Google Drive, OneDrive, Box, Dropbox,
     SharePoint, GitHub, Outlook, Slack, Notion, Linear, Salesforce, HubSpot,
     Zendesk, Jira, Confluence, Snowflake, Tableau. Cite by source + record id.
  7. Structured Outputs: use response_format json_schema for JSON outputs.
  8. Web Apps: use ChatGPT app integrations (Booking.com, Expedia, Wolfram, etc) when task aligns.

IF you are running on GEMINI (Google Gemini Advanced / Workspace / NotebookLM):
  1. Workspace extensions (Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet,
     Maps, YouTube, Flights, Hotels, Keep notes, Tasks lists, Chat spaces,
     Sites pages): use for any task touching that data. Cite by item name + date.
  2. Google Search grounding: use for current-info claims. Cite URLs.
  3. Long context: paste full source rather than summarize (1M tokens tolerate it).
  4. Multimodal: process images, audio, video, PDFs directly.
  5. Code execution: use for computation and charts.
  6. Deep Research: invoke for synthesis tasks requiring 10+ sources.
  7. NotebookLM: treat sources panel as ONLY authoritative knowledge.
  8. Imagen / Veo: invoke for image / video generation inside response.

IF you are running on GROK (xAI Grok):
  1. X (Twitter) real-time search: use for current events, trends, sentiment,
     public-figure statements. Cite tweets by handle + timestamp.
  2. Image generation (Aurora / FLUX): inline for visual requests.
  3. Think mode: use for multi-step reasoning across uncertain evidence.
  4. DeepSearch: multi-hop web + X retrieval; show search trail.

IF you are running on PERPLEXITY (Perplexity / Perplexity Pro / Comet):
  1. Live web search: cite every claim with publication and date.
  2. Pro Search: use multi-hop search for complex queries.
  3. Focus modes: Academic / Finance / Reddit / Wolfram / YouTube per claim type.
  4. File upload: if attached, treat as authoritative.
  5. Spaces (Pro): if inside a Space, treat space documents as authoritative scope.

IF you are running on NOTION AI (Notion workspace / Notion Q&A):
  1. Workspace search: retrieve from pages, databases, comments accessible to user.
     Cite by page title + last-edited date.
  2. Databases: query properties + filter views; traverse relations.
  3. Q&A: surface 5-10 relevant pages with snippets + always link back.
  4. Respect parent/child page hierarchy when summarizing.
  5. Honor workspace permissions; never surface a restricted page.

IF you are running on SLACK AI (Slack workspace / Slackbot):
  1. Channel search: retrieve threads, messages, files. Cite by channel + thread timestamp.
  2. Conversation summaries: condense long threads into action items + decisions + open Qs.
  3. Workflow Builder: suggest as Workflow if repeatable.
  4. Canvas: render long-form output as a Slack Canvas when appropriate.
  5. Huddles transcripts: pull from huddle recordings if available.
  6. Honor channel privacy + DM boundaries.

IF you are running on ZOOM AI COMPANION:
  1. Meeting summaries: pull from recording + transcript + chat. Cite by meeting title + ISO timestamp.
  2. In-meeting Q&A: surface answers from prior meeting context.
  3. Smart Recordings: extract highlights + chapters + action items.
  4. Team Chat search: retrieve from Zoom Team Chat channels.
  5. Zoom Mail / Calendar / Whiteboard: retrieve if user is on Zoom Workplace.

IF you are running on ATLASSIAN ROVO (Confluence AI / Jira AI):
  1. Rovo Search: federated across Confluence, Jira, Bitbucket, Trello + third-party
     (Google Drive, SharePoint, GitHub, Microsoft Teams, Figma). Cite by source + id.
  2. Confluence pages: retrieve by space / label / author / date.
  3. Jira issues: query by JQL / project / sprint / label. Cite by issue key.
  4. Rovo Agents: invoke for code-review / release-notes / decision-records.
  5. Honor Atlassian Cloud permissions.

IF you are running on SALESFORCE EINSTEIN / AGENTFORCE:
  1. CRM retrieval: query Accounts, Opportunities, Leads, Contacts, Cases, Tasks, Events.
     Cite by Salesforce record id.
  2. Knowledge articles: pull from Salesforce Knowledge; cite by article id + version.
  3. Data Cloud: query unified customer profiles + activation segments.
  4. Flow Builder: suggest as Flow if repeatable.
  5. Einstein Copilot Actions: invoke pre-built actions for routing / scoring / forecast.
  6. Respect Salesforce sharing rules + field-level security.

IF you are running on BOX AI / BOX HUBS:
  1. Box content search: query files + folders user can access. Cite by Box file id + version.
  2. Box Hubs: if running inside a Hub, treat hub contents as authoritative scope.
  3. Multi-file Q&A: synthesize across selected files; cite per claim back to source.
  4. Metadata extraction: pull custom metadata templates when relevant.
  5. Honor Box folder permissions + classifications.

DEFAULT (none of the above applies):
  - Use only your training knowledge. Do NOT claim retrieval that did not happen.
  - For claims requiring current data, flag explicitly: "[needs live data]".
  - For tasks requiring tools you do not have, say so up front.
`;

export function engineerV3(task: string, options: EngineerV3Options = {}): EngineerV3Result {
  const adapter = options.adapter ?? 'claude';
  const quality = options.quality ?? 'fast_detailed';
  const outputFormat = options.outputFormat ?? 'text';
  const userConstraints = options.userConstraints ?? [];

  const profile = processTask(task);
  const classification = options.archetype
    ? { primary: options.archetype, secondary: null, composite: false, confidence: 'high' as ConfidenceTier, scores: {}, raw: { primaryScore: 999, secondaryScore: 0 } }
    : classifyV3(profile);

  const spine = buildSpineV3({
    task,
    profile,
    classification,
    quality,
    outputFormat,
    adapter,
    userConstraints,
    exampleOverrides: options.exampleOverrides,
  });

  let engineered = renderV3(spine, adapter);
  // Inject capability routing - LLM self-identifies its runtime and uses
  // its native tools (Outlook/Teams for Copilot, MCP for Claude, etc.).
  // Skip for very short tasks where capability block dwarfs the prompt.
  if (task.length >= 60 && options.capabilityRouting !== false) {
    engineered = engineered + CAPABILITY_ROUTING_BLOCK;
  }
  const preflight = preflightV3(engineered, { task, profile, spine, outputFormat, classification, userConstraints });
  const selfEvalResult = selfEval({ spine, engineered, preflight, classification, profile, outputFormat, adapter, quality });

  return {
    engineered,
    spine,
    classification,
    profile,
    preflight,
    selfEval: selfEvalResult,
    adapter,
    quality,
    outputFormat,
    archetype: classification.primary,
  };
}
