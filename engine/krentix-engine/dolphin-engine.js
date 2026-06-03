/**
 * Krentix Dolphin Engine
 *
 * Deterministic, sub-millisecond prompt engineer adapted from PromptDolphin
 * (MIT / Robic Direct Inc.). Vendored into Krentix to give the prompt suggester
 * an instant fast-path that doesn't burn an Anthropic API call.
 *
 * Differences from upstream engine.mjs:
 *   - MODELS selector REMOVED — Krentix is model-agnostic; we always emit the
 *     claude-style XML envelope, which is the most portable across providers
 *     (ChatGPT, Gemini, Grok all parse <role>/<context>/<format> tags fine).
 *   - Exported OPTION_LISTS map for UI generation (chip labels + descriptions).
 *   - Almost-pure module. Only import: ./brand/tokens.js (pure data).
 *
 * Public:
 *   detectArchetype(task) -> string
 *   engineer(task, options) -> { enhanced, archetype, options, techniques_used, original_issues }
 *   ARCHETYPES, CONNECTORS, FORMATS, REVIEW_MODES, DEPTHS, RICH_MEDIA  -> data
 *   OPTION_LISTS                                                       -> UI-friendly catalogs
 *   DOLPHIN_ENGINE_VERSION
 *
 * L99 PE-Phase 1+9 (v2.0.0):
 *   - Added html_news_report specialty archetype (visual editorial design).
 *   - engineer(task, { brandTokens }) — neutral default; opt-in branding.
 *   - HTML format now emits a full design contract (palette/typography/layout).
 */

import { resolveBrand, NEUTRAL_BRAND } from './brand/tokens.js';
import { renderExamplesXml } from './few-shot/examples-bank.js';
import { detectDomains } from './few-shot/domain-detect.js';
import { renderCapabilityRouting, renderCapabilityRoutingCompact } from './capabilities/capability-routing.js';
import { getRefinementDirective, recommendRefinement } from './directives/refinement.js';
import { shapeFor, detectProviderFromModel } from './providers/shape-variants.js';

export function detectArchetype(task) {
  const t = String(task || '').toLowerCase();
  // 1. html_news_report FIRST — most specific signal wins. Editorial HTML
  //    digest carries its own archetype regardless of email/investor noise.
  const _hasHtmlSignal = /\b(html\s+(?:report|page|file|document|version|summary|digest)|as\s+html|in\s+html|\.html|polished?\s+html|rich\s+html)\b/.test(t);
  const _hasNewsSignal = /\b(news|headlines?|digest|roundup|recap|briefing|weekly|monthly|update|landscape|state of|this week|developments?|happenings|what'?s\s+new)\b/.test(t);
  if (_hasHtmlSignal && _hasNewsSignal) return 'html_news_report';
  // 2. Email — only when the verb itself is writing an email, not when the
  //    user mentions "email" as a downstream channel ("I can email investors").
  if (/\b(?:write|draft|compose|send|reply\s+to)\s+(?:an?\s+)?(?:email|message|letter|note)\b|\bemail\s+(?:to|the|my)\b|\bcorrespondence\b/.test(t)) return 'email';
  if (/\b(?:regulatory|submission|fda|health canada|ema|tga|mhra|nda|bla)\b/.test(t)) return 'regulatory';
  // 3. Slides BEFORE investor — "investor pitch deck" should route to slides,
  //    not the investor-update archetype (the object is the deck).
  if (/\b(?:slide|slides|deck|presentation|board update|powerpoint|keynote|pitch\s+deck)\b/.test(t)) return 'slides';
  if (/\b(?:investor|investors|quarterly update|q[1-4] update|pipeline progress|biotech update|investor\s+update)\b/.test(t)) return 'investor';
  if (/\b(?:strategy|strategic|should we|recommend|options for|build or buy|make or buy)\b/.test(t)) return 'strategy';
  if (/\b(?:meeting|prep for|prepare for|qbr|agenda|brief for|debrief)\b/.test(t)) return 'meeting';
  // 4. Research — narrower: explicit research verbs + news/headlines/digest.
  //    Dropped bare "summary/report" — too ambiguous (exec summary of X
  //    findings should fall to general, not research).
  if (/\b(?:research|synthesis|synthesize|analy[sz]e|deep\s+dive|landscape|state of|news|headlines?|digest|roundup|recap|briefing|overview)\b/.test(t)) return 'research';
  return 'general';
}

/**
 * Detect an explicit OUTPUT FORMAT named in the task text ("HTML report",
 * "as a spreadsheet", "make a table"). Returns a FORMATS key or null. Without
 * this the engineer ignored "HTML report I can download" and defaulted to prose,
 * so the envelope steered the model AWAY from the format the user asked for.
 */
export function detectOutputFormat(task) {
  const t = String(task || '').toLowerCase();
  if (/\b(html\s+(?:report|page|file|document|version|output|summary|digest)|as\s+html|in\s+html|\.html|polished?\s+html|rich\s+html|\bhtml\b)\b/.test(t)) return 'html';
  if (/\b(spreadsheet|excel|\.xlsx|\.csv|csv\s+file)\b/.test(t)) return 'excel';
  if (/\b(slides?|deck|powerpoint|\.pptx|keynote|pitch\s+deck)\b/.test(t)) return 'powerpoint';
  if (/\b(word\s+doc(?:ument)?|\.docx)\b/.test(t)) return 'word';
  if (/\bjson\b/.test(t)) return 'json';
  if (/\b(?:write|draft|compose|send)\s+(?:an?\s+)?email\b|\bemail\s+(?:to|the|my)\b|^\s*email\b/.test(t)) return 'email';
  if (/\b(?:deep\s+research(?:\s+report)?|research\s+report|long[-\s]form\s+report|full\s+report|comprehensive\s+report|3[,\.]?000\s*[-+]\s*\d|3500|4000|5000\s*words?)\b/.test(t)) return 'research_report';
  if (/\b(one[- ]?pager|1[- ]?pager)\b/.test(t)) return 'pdf_1pager';
  if (/\b(markdown|\.md\b)\b/.test(t)) return 'markdown';
  if (/\btables?\b|\btabulate\b/.test(t)) return 'markdown';
  return null;
}

/** Does the task need current/live data (news, prices, "this week/today/latest")? */
export function needsFreshData(task) {
  const t = String(task || '').toLowerCase();
  return /\b(news|headlines?|this week|today'?s?|latest|current|breaking|trending|right now|as of|recent(?:ly)?|live\b|stock price|share price|exchange rate)\b/.test(t);
}

export const ARCHETYPES = Object.freeze({
  email: {
    role: 'a senior executive communications director with 20 years writing clear, direct business correspondence',
    context: 'Focus on clarity, tone, and a single specific ask. The reader is busy.',
    format: 'Subject line | Opening sentence | Body 2-3 paragraphs | Explicit ask | Sign-off',
    constraints: 'No passive voice. No filler phrases. Max 250 words. Unambiguous ask.',
    critique: 'Is the ask crystal clear in 30 seconds? Is the tone right? Under 250 words?',
  },
  strategy: {
    role: 'a senior strategy consultant and former McKinsey partner',
    context: 'Apply structured strategic thinking. Present options with rationale.',
    format: 'Exec summary (3 sentences) | Strategic options (3-5 bullets) | Recommended path | Top 3 risks + mitigations',
    constraints: 'No hedging without substance. Max 500 words. Defensible recommendations.',
    critique: 'Actionable? Every claim defensible? Advances a clear position?',
  },
  meeting: {
    role: 'a chief of staff and senior executive advisor',
    context: 'Synthesize context, objectives, decisions this meeting must drive.',
    format: 'Objective | Background (3 bullets) | Key questions (3-5) | Decision framework | Pre-read',
    constraints: 'No generic advice. One page max. Specific to this exact meeting.',
    critique: 'Would a senior leader walk in prepared? Questions sharp enough?',
  },
  slides: {
    role: 'a senior strategy consultant designing Minto pyramid presentations',
    context: 'Minto pyramid: answer first, support with evidence. Story holds without notes.',
    format: 'Insight-titled slides | Max 35 words body per slide | Situation/complication/resolution arc',
    constraints: 'No descriptive titles. Max 35 words body. Max 12 slides.',
    critique: 'Each title states insight? Deck flows coherently?',
  },
  research: {
    role: 'a senior research analyst',
    context: 'Synthesize into coherent argument. Distinguish fact from interpretation. Flag uncertainty.',
    format: 'Key findings (3-5) | Evidence per finding | Implications | Open questions',
    constraints: 'No unverified claims. Flag uncertainty. Max 400 words.',
    critique: 'Every finding evidenced? Implications clear? Uncertainty flagged?',
  },
  regulatory: {
    role: 'a senior regulatory affairs strategist with 15+ years FDA/HC/EMA/TGA experience',
    context: 'Regulatory-grade precision. No internal jargon, no unsupported superiority claims.',
    format: 'Formal structure | Agency + pathway reference | Specific requirements | Required data',
    constraints: 'No superiority claims without evidence. No internal codenames. Flag assumptions. Lawyer-grade precision.',
    critique: 'Meets regulatory standards? Claims qualified? Would a reviewer accept?',
  },
  investor: {
    role: 'a CFO and investor relations director, biotech/life sciences',
    context: 'Be candid. Bad news as prominent as good. No hype.',
    format: 'Pipeline progress | Catalysts ahead with timelines | Financial position | Candid outlook',
    constraints: 'No hype. No buried bad news. No boilerplate. Label forward-looking statements.',
    critique: 'Institutional investor would trust? Bad news visible? Timelines defensible?',
  },
  html_news_report: {
    role: 'a senior editorial designer + investigative news editor at a tier-1 publication (think Bloomberg, Stratechery, The Information). You ship beautiful, dense, scannable, source-cited HTML reports that a portfolio manager reads end-to-end on first open.',
    context: 'Visual editorial standards apply: typographic hierarchy, scannable density, every numeric claim sourced. Reader is a sophisticated operator — assume domain literacy, do not over-explain. Surface signal over volume.',
    format: 'Single-page HTML report. Sections: hero (headline + dek + as-of timestamp + 30-word TLDR) | top-3 ranked stories (image + headline + 2-paragraph synopsis + significance + sources) | secondary stories (5-8 brief items with one-line significance) | watchlist (3-5 emerging items) | sources appendix (URL + publication + date). Every story carries at least one inline citation.',
    constraints: 'NO fabricated quotes, NO fabricated statistics, NO fabricated outlet names. Every claim must trace to a real cited URL. If a fact cannot be sourced, omit it. NO marketing prose. NO breathless adjectives ("revolutionary", "groundbreaking", "game-changing"). Sentences average <22 words. Hero image required (use a real source-attributed image or a tasteful CSS-only gradient placeholder — never invent an image URL).',
    critique: 'Would a PM trust every number? Is the typography readable on first glance? Are top stories actually ranked by significance (not recency)? Every claim traceable to a source? No fabricated quotes or outlets? Hero scans in under 5 seconds?',
  },
  general: {
    role: 'a world-class domain expert combining deep knowledge with clear communication',
    context: 'Think carefully. Address the specific task, not a generic version.',
    format: 'Direct answer | Supporting reasoning | Concrete next steps',
    constraints: 'No padding. No generic advice. Specific to this exact task.',
    critique: 'Directly answers what was asked? Every claim specific?',
  },
});

export const CONNECTORS = Object.freeze({
  none: '',
  m365: 'Microsoft 365 access. Search Outlook, Teams, SharePoint, OneDrive. Reference by name. Do not fabricate.',
  m365_deep: 'Full M365 agent access. Scan Outlook 90d, Teams recordings, SharePoint, OneDrive, Calendar. Cite by name+date. Flag conflicts.',
  workspace: 'Google Workspace: Gmail, Drive, Meet, Calendar. Reference by name. Prioritize last 60d.',
  chatgpt_memory: 'Check memory + uploaded files. Reference memory items + filenames. Flag conflicts.',
  claude_project: 'Scan Project documents. Reference by name. Do not fabricate.',
  claude_web: 'Use web search. Cite sources inline. Flag limitations.',
  perplexity: 'Current info required. Search per claim. Cite publication + date. Flag unverified.',
});

export const FORMATS = Object.freeze({
  prose: '',
  word: 'Word format: # H1, ## H2, plain bullets, | tables, no code fences.',
  powerpoint: 'Slide-by-slide outline. [SLIDE N — Title] / bullets max 8 words / [SPEAKER NOTES: 2-3 sentences]. Insight titles. Max 12 slides.',
  excel: 'Excel tables. Row 1 headers, | separators. SUMMARY row. No prose.',
  email: 'Subject + 3 paragraphs + sign-off. Max 200 words.',
  html: 'Semantic HTML. <h1>/<h2>/<p>/<ul>/<table>. <summary> top. <footer> with date.',
  markdown: 'Markdown with proper heading hierarchy (#, ##, ###), bullets, tables, and code fences for code.',
  json: 'Pure JSON object. Keys camelCase. No prose preface, no code fences, no trailing commentary.',
  pdf_1pager: 'One-pager max 500 words. Situation/Key Finding/Evidence/Recommendation/Next Step.',
  research_report: '3000-6000 words. Exec Summary/Background/Methodology/Findings/Analysis/Recommendations/Limitations/Appendix.',
});

/**
 * Brand-aware HTML design contract. Replaces the bland FORMATS.html stub
 * for any html output. Reads brand tokens (palette/fonts/productName) so
 * the engine ships neutral by default; callers inject their brand via
 * engineer(task, { brandTokens }).
 */
export function buildHtmlDesignContract(brandTokens) {
  const b = brandTokens || NEUTRAL_BRAND;
  const ds = b.designSystem ? ` Follow the ${b.designSystem}.` : '';
  return [
    `Semantic HTML page (single self-contained <!doctype html> document). Magazine-grade editorial design - match The Information / Stratechery / Bloomberg / The Pudding tier.${ds}`,
    '',
    'STRUCTURE:',
    '  <head>: charset, viewport, <title>, ALL CSS inline in single <style>. No external CDN/fonts/scripts/preconnects.',
    '  <body>: <header class="hero"> + (optional) <nav class="toc"> for docs > 1500 words + <main> stacked <article>/<section> + <footer>.',
    '  Every numeric claim, quote, or named outlet carries an inline <a href="..." class="cite"><sup>[N]</sup></a> linking to footer source list.',
    '',
    'TYPOGRAPHY (editorial-grade):',
    `  Serif headlines: ${b.fontStack.serif}.`,
    `  Sans body: ${b.fontStack.sans}.`,
    `  Mono data/numerics: ${b.fontStack.mono}.`,
    '  Scale: H1 44-52px serif bold (text-wrap: balance); H2 28-32px serif semibold; H3 21px sans medium; Body 17px sans / line-height 1.65 / letter-spacing -0.005em / text-wrap: pretty; Caption 13px sans muted.',
    '  Max-width 720-760px content column. Generous trailing whitespace (96px+ between sections).',
    '  Hanging punctuation on blockquotes. Optical alignment on drop-caps when used.',
    '  font-feature-settings: "ss01","cv01","kern","liga". font-variant-numeric: tabular-nums on numeric columns.',
    '',
    'COLOR SYSTEM — 10-stop neutral + accent scale, light AND dark via media query:',
    '  Neutrals: --n50..--n900 (10 stops).',
    `  Accent: --a50..--a900 (from primary hue ${b.palette.primaryLight}).`,
    `  Light scheme: --bg:--n50; --ink:${b.palette.inkLight}; --ink-muted:--n600; --rule:--n200; --accent:${b.palette.primaryLight}; --accent-tint:--a100.`,
    `  @media (prefers-color-scheme: dark): --bg:${b.palette.paperDark}; --ink:${b.palette.inkDark}; --ink-muted:--n400; --rule:--n700; --accent:${b.palette.primaryDark}; --accent-tint:--a800.`,
    '  AAA contrast required on body text. -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility.',
    '',
    'HERO BLOCK:',
    '  Full-width container, 380-480px tall, 60px+ vertical padding.',
    '  Eyebrow (small uppercase, letter-spacing wide, accent): publication name + as-of timestamp.',
    '  Headline serif H1, balanced wrap, max 14 words.',
    '  Dek (serif italic 22-26px, ink-muted): one sentence summarizing the report.',
    '  Optional hero image: <img> with REAL source URL (NEVER invent), OR tasteful CSS gradient placeholder using accent hue.',
    '  Byline row: publication + reading time (computed: words / 220 wpm rounded).',
    '',
    'LAYOUT POLISH:',
    '  Section dividers: 1px hairline rule in --rule, 32px above + 16px below.',
    '  Cards: subtle 1px border, 12px border-radius, 28px padding, very soft shadow rgba(0,0,0,.04) 0 1px 3px.',
    '  Pull-quotes: large serif italic in accent color, hanging quote mark, 24px above/below.',
    '  Definition lists <dl class="defs"> for terms.',
    '  Sidenotes on desktop (Tufte-style margin notes): float-right 240px wide; full-width inline on mobile.',
    '  Inline CSS-only sparklines for trends: <svg class="spark" viewBox="0 0 60 20"><polyline points="..." fill="none" stroke="currentColor" stroke-width="1.5"/></svg>.',
    '',
    'TABLES:',
    '  Numerics right-aligned, monospace, tabular-nums.',
    '  Zebra striping alternating --n50/--n100 rows.',
    '  Sticky <th> (position: sticky; top: 0) on tables > 8 rows.',
    '  Cell padding 12px vertical / 16px horizontal. <caption> serif italic.',
    '',
    'SOURCES POLICY + LINKS:',
    '  Inline cite pattern: <a href="..." class="cite"><sup>[N]</sup></a>.',
    '  Footer <ol class="sources"> with publication + ISO date + URL + accessed ISO date.',
    '  Link style: subtle underline (text-decoration-thickness:1px; underline-offset:3px). Hover thickens + brightens.',
    '  Focus rings AAA: 2px solid --accent, 2px offset.',
    '  If you cannot cite a fact, OMIT it. Do NOT fabricate URLs, outlets, or quotes.',
    '',
    'RESPONSIVE (mobile-first):',
    '  Mobile (default): single column, sidenotes inline, hero 280px, typography 0.92x.',
    '  Tablet >= 768px: 700px content column, sidenotes inline cards.',
    '  Desktop >= 1024px: 760px column, sidenotes float right as margin notes. Container max-width 1100px.',
    '',
    'PRINT STYLESHEET (@media print):',
    '  Force light scheme. Sans 11pt. Page-break-inside: avoid on <article>/<table>/<figure>/<blockquote>.',
    '  Hide nav. Print source URLs verbatim in footnotes.',
    '',
    'ABSOLUTE NO:',
    '  No <link rel="stylesheet">. No external <script src=>. No font CDN preconnects.',
    '  No marketing prose ("revolutionary", "game-changing", "groundbreaking", "industry-leading", "synergies", "best-in-class", "next-generation", "paradigm-shift", "world-class", "cutting-edge", "leverage").',
    '  No invented quotes, statistics, outlets, URLs, images.',
    '  No emoji in body. No deprecated patterns: <font>, <center>, <table> for layout, <br> for spacing.',
    '',
    'DELIVERY:',
    '  Output ONLY the HTML document. No prose preface. No code-fence wrapper. Well-formed HTML5.',
    '  Must render correctly when opened via file:// (no server-required APIs).',
    '',
    `BRAND: published by "${b.productName}".${b.logoSvgRef ? ` Brand mark: <img src="${b.logoSvgRef}" alt="${b.productName}"> top-left.` : ' Wordmark of the brand name top-left in serif headings font.'}`,
    '',
    "Reader's first 5 seconds should communicate publication-grade quality. Beat that bar.",
  ].join('\n');
}

export const REVIEW_MODES = Object.freeze({
  standard: '',
  red_team: 'After primary response, switch to rigorous skeptic. Identify 3 objections + counters. Format: [RED TEAM ANALYSIS]',
  peer_review: 'After primary response, take role of senior editor. 3 specific improvements, then apply. Format: [EDITOR\'S NOTES] [REVISED OUTPUT]',
  steelman: 'After primary response, steelman strongest counterargument. Format: [STEELMAN] [RESPONSE TO STEELMAN]',
});

export const DEPTHS = Object.freeze({
  exec_summary: 'Max 300 words. Lead with recommendation.',
  standard: '',
  detailed_brief: '800-1200 words. Thorough, focused. Evidence per claim.',
  full_report: 'Comprehensive. No length limit.',
});

export const RICH_MEDIA = Object.freeze({
  none: '',
  visuals: 'After main response, add [VISUAL DIRECTION] per section: chart type, data encoded.',
  video_script: 'After main response, add [VIDEO SCRIPT] — 2-3 min talking head. [HOOK 15s] [BODY 90s] [CTA 30s].',
  image_prompts: 'After main response, add [IMAGE GENERATION PROMPTS] — 3 specific prompts. Subject/Style/Composition/Mood.',
  presentation_package: 'After main response: [SLIDE OUTLINE] / [VISUAL DIRECTION] / [SPEAKER NOTES] / [HANDOUT SUMMARY].',
});

// UI-friendly catalogs — labels + descriptions for chip rendering.
export const OPTION_LISTS = Object.freeze({
  outputFormat: [
    { key: 'prose',           label: 'Prose',             description: 'Default — flowing text' },
    { key: 'markdown',        label: 'Markdown',          description: 'Headings, bullets, tables' },
    { key: 'html',            label: 'HTML',              description: 'Semantic HTML page' },
    { key: 'word',            label: 'Word',              description: 'Doc-ready structure' },
    { key: 'powerpoint',      label: 'Slides',            description: 'Slide outline with notes' },
    { key: 'excel',           label: 'Excel',             description: 'Tabular data only' },
    { key: 'email',           label: 'Email',             description: 'Subject + 3 paras + sign-off' },
    { key: 'json',            label: 'JSON',              description: 'Pure JSON object' },
    { key: 'pdf_1pager',      label: '1-pager',           description: 'One-page brief, ≤500 words' },
    { key: 'research_report', label: 'Research report',   description: '3,000–6,000 word report' },
  ],
  depth: [
    { key: 'exec_summary',    label: 'Exec summary',      description: '≤300 words, lead with the call' },
    { key: 'standard',        label: 'Standard',          description: 'Default — balanced length' },
    { key: 'detailed_brief',  label: 'Detailed brief',    description: '800–1,200 words, evidence per claim' },
    { key: 'full_report',     label: 'Full report',       description: 'Comprehensive, no length cap' },
  ],
  reviewMode: [
    { key: 'standard',        label: 'Standard',          description: 'Just answer' },
    { key: 'red_team',        label: 'Red team',          description: 'Objections + counters appended' },
    { key: 'peer_review',     label: 'Peer review',       description: 'Editor notes + revised output' },
    { key: 'steelman',        label: 'Steelman',          description: 'Strongest counter, then rebut' },
  ],
  richMedia: [
    { key: 'none',            label: 'None',              description: 'Text only' },
    { key: 'visuals',         label: 'Visuals',           description: 'Chart directions per section' },
    { key: 'video_script',    label: 'Video script',      description: '2–3 min talking-head script' },
    { key: 'image_prompts',   label: 'Image prompts',     description: '3 image-gen prompts' },
    { key: 'presentation_package', label: 'Full package', description: 'Slides + visuals + notes + handout' },
  ],
  connector: [
    { key: 'none',            label: 'None',              description: 'No external data' },
    { key: 'm365',            label: 'Microsoft 365',     description: 'Outlook / Teams / SharePoint / OneDrive' },
    { key: 'm365_deep',       label: 'M365 deep',         description: 'Full agent — 90d scan, cite by name+date' },
    { key: 'workspace',       label: 'Google Workspace',  description: 'Gmail / Drive / Meet / Calendar' },
    { key: 'chatgpt_memory',  label: 'ChatGPT memory',    description: 'Memory + uploaded files' },
    { key: 'claude_project',  label: 'Claude project',    description: 'Project documents only' },
    { key: 'claude_web',      label: 'Web (Claude)',      description: 'Inline web search with sources' },
    { key: 'perplexity',      label: 'Perplexity',        description: 'Cite publication + date per claim' },
  ],
  archetype: [
    { key: 'auto',            label: 'Auto-detect',       description: 'Pick from prompt content' },
    { key: 'email',           label: 'Email',             description: 'Single explicit ask' },
    { key: 'strategy',        label: 'Strategy',          description: 'Options + recommendation' },
    { key: 'meeting',         label: 'Meeting prep',      description: 'Objective + questions + framework' },
    { key: 'slides',          label: 'Slides',            description: 'Minto pyramid deck' },
    { key: 'research',        label: 'Research',          description: 'Findings + evidence + implications' },
    { key: 'regulatory',      label: 'Regulatory',        description: 'FDA/HC/EMA-grade precision' },
    { key: 'investor',        label: 'Investor update',   description: 'Candid pipeline + catalysts' },
    { key: 'html_news_report', label: 'HTML news report', description: 'Tier-1 editorial design + sourced' },
    { key: 'general',         label: 'General',           description: 'World-class expert default' },
  ],
});

export const VALID_OUTPUT_FORMATS = Object.freeze(Object.keys(FORMATS));
export const VALID_ARCHETYPES = Object.freeze(Object.keys(ARCHETYPES));

/**
 * Build a portable XML-tagged prompt envelope.
 * Same shape as PromptDolphin's claude adapter (most portable across providers).
 */
function buildEnvelope({ task, archetype, connector, outputFormat, reviewMode, depth, richMedia, brand, fewShot, refinement, provider, promptDomains, capabilityRouting, capabilityRuntimes, capabilityCompact }) {
  const parts = ARCHETYPES[archetype] || ARCHETYPES.general;
  const { role, context: baseContext, format: baseFormat, constraints, critique } = parts;

  const fullContext = CONNECTORS[connector]
    ? `${baseContext}\n\n${CONNECTORS[connector]}`
    : baseContext;
  // HTML: swap the bland stub for the full brand-aware design contract.
  const formatString = outputFormat === 'html'
    ? buildHtmlDesignContract(brand)
    : (FORMATS[outputFormat] || '');
  const fullFormat = formatString
    ? `${baseFormat}\n\nAlso apply this output format:\n${formatString}`
    : baseFormat;
  const fullConstraints = DEPTHS[depth]
    ? `${constraints}\n\nDepth: ${DEPTHS[depth]}`
    : constraints;
  const suffix = [REVIEW_MODES[reviewMode], RICH_MEDIA[richMedia]].filter(Boolean).join('\n\n');

  // Domain-aware example picking - promptDomains arrives via fn args
  // (detected in engineer() scope where options + taskStr live).
  const examplesXml = fewShot && fewShot > 0
    ? renderExamplesXml(archetype, fewShot, { promptDomains: promptDomains || [] })
    : '';

  // Capability routing - LLM self-identifies and applies its own tool block.
  // capabilityRouting can be: true | false | 'compact'. Default true.
  const capabilityText = (() => {
    if (capabilityRouting === false) return '';
    const opts = capabilityRuntimes ? { runtimes: capabilityRuntimes } : {};
    if (capabilityCompact || capabilityRouting === 'compact') {
      return renderCapabilityRoutingCompact(opts);
    }
    return renderCapabilityRouting(opts);
  })();
  const refinementText = getRefinementDirective(refinement);

  const renderer = shapeFor(provider);
  return renderer({
    role,
    context: fullContext,
    format: fullFormat,
    constraints: fullConstraints,
    critique,
    examples: examplesXml,
    refinement: refinementText,
    capabilities: capabilityText,
    suffix,
    task,
  });
}

/**
 * Detect short follow-up prompts that reference the prior assistant turn.
 * When true, wrapping with the full role/context/format envelope obliterates
 * conversational continuity — the LLM sees a fresh standalone task instead of
 * "modify the previous answer". Pipeline passes prior turns to the model, so
 * for these we pass through unwrapped and let context do the work.
 *
 * @param {string} task
 * @returns {boolean}
 */
export function isFollowUp(task) {
  const s = String(task || '').trim();
  if (!s) return false;
  if (s.length > 200) return false;
  const t = s.toLowerCase();
  // Demonstratives / explicit back-reference
  if (/\b(?:the\s+(?:above|previous|prior|last|earlier)|that\s+answer|this\s+(?:answer|response|one)|previous\s+(?:answer|response)|above\s+answer)\b/.test(t)) return true;
  // Continuation verb + reformat keyword
  if (/^(?:now|then|and|but|also|please|can you|could you|just|actually|make|turn|let'?s)\s+/.test(t)) {
    if (/\b(?:html|markdown|json|word|excel|powerpoint|slides|email|table|shorter|longer|expand|condense|summarize|tldr|in\s+\w+\s+format|reformat|rerender|re-render|render|convert|translate|rephrase|polish|tighten|fix|add|remove|it)\b/.test(t)) return true;
  }
  // Imperative reformat — "convert this to X", "render as Y"
  if (/^(?:output|render|convert|format|give\s+me|show)\s+(?:(?:it|this|that|the\s+\w+)\s+)?(?:as|in|to)\s+/.test(t)) return true;
  if (/^(?:as|in)\s+(?:html|markdown|json|word|excel|ppt|powerpoint|slides|email|table|prose|a\s+table|a\s+list)\b/.test(t)) return true;
  // Single-word reformat
  if (s.length < 30 && /^(?:html|markdown|table|json|tldr|shorter|longer|expand|condense|continue|more)\b/.test(t)) return true;
  return false;
}

/**
 * Engineer a prompt deterministically. Sub-millisecond.
 *
 * @param {string} task - raw user prompt
 * @param {object} [options]
 * @returns {{ enhanced: string, archetype: string, options: object, techniques_used: string[], original_issues: string[], skipped?: string }}
 */
export function engineer(task, options = {}) {
  const taskStr = String(task || '').trim();
  if (!taskStr) {
    return {
      enhanced: '',
      archetype: 'general',
      options: { archetype: 'general', outputFormat: 'prose', depth: 'standard', reviewMode: 'standard', richMedia: 'none', connector: 'none' },
      techniques_used: [],
      original_issues: ['empty input'],
    };
  }

  // Short follow-up referencing prior turn — pass through unwrapped so
  // conversation history carries the meaning. Wrapping breaks continuity.
  if (isFollowUp(taskStr)) {
    return {
      enhanced: taskStr,
      archetype: detectArchetype(taskStr),
      options: { archetype: 'auto', outputFormat: options.outputFormat || 'prose', depth: options.depth || 'standard', reviewMode: options.reviewMode || 'standard', richMedia: options.richMedia || 'none', connector: options.connector || 'none' },
      techniques_used: ['conversational-passthrough'],
      original_issues: [],
      skipped: 'follow-up — preserved conversation context, no envelope wrap',
    };
  }

  const archetype = (options.archetype && options.archetype !== 'auto' && ARCHETYPES[options.archetype])
    ? options.archetype
    : detectArchetype(taskStr);

  // Honor an explicitly-passed option; otherwise infer the format and freshness
  // from the task text so the envelope REFLECTS the ask ("HTML report" -> html,
  // "this week's news" -> web connector) instead of burying it under a prose default.
  const _explicitFormat = options.outputFormat && options.outputFormat !== 'prose' && FORMATS[options.outputFormat] != null;
  const _explicitConnector = options.connector && options.connector !== 'none' && CONNECTORS[options.connector] != null;
  const resolved = {
    archetype,
    outputFormat: _explicitFormat ? options.outputFormat : (detectOutputFormat(taskStr) || (FORMATS[options.outputFormat] != null ? options.outputFormat : 'prose')),
    depth:        DEPTHS[options.depth] != null ? options.depth : 'standard',
    reviewMode:   REVIEW_MODES[options.reviewMode] != null ? options.reviewMode : 'standard',
    richMedia:    RICH_MEDIA[options.richMedia] != null ? options.richMedia : 'none',
    connector:    _explicitConnector ? options.connector : (needsFreshData(taskStr) ? 'claude_web' : (CONNECTORS[options.connector] != null ? options.connector : 'none')),
  };

  // Brand resolution: invalid/missing tokens collapse to NEUTRAL_BRAND.
  const brand = resolveBrand(options.brandTokens);

  // Phase 4: few-shot. 0 disables. Default = 1 example per archetype, but
  // skip for short / trivial inputs where the example dwarfs the task and
  // costs more than it adds. Threshold: 60 chars of input.
  const fewShot = Number.isInteger(options.fewShot) && options.fewShot >= 0
    ? options.fewShot
    : (taskStr.length >= 60 ? 1 : 0);

  // Phase 5: refinement directive. 'auto' picks recommended; explicit
  // mode honored; 'none' disables.
  const refinement = options.refinement === 'auto' || options.refinement === undefined
    ? recommendRefinement({ archetype, depth: resolved.depth, outputFormat: resolved.outputFormat })
    : options.refinement;

  // Phase 6: provider-aware envelope shape. Detect from model hint if not
  // explicit. Falls back to claude-XML (canonical).
  const provider = options.provider
    || detectProviderFromModel(options.model)
    || 'claude';

  // Domain detection - fixes biotech-leaks-into-retail bug. Caller may
  // override with explicit options.domains array; otherwise auto-detect.
  const promptDomains = Array.isArray(options.domains) && options.domains.length
    ? options.domains
    : detectDomains(taskStr);

  // Capability routing defaults ON for substantive inputs. For trivial /
  // follow-up prompts (under 60 chars) it inflates envelope without adding
  // value - skip it. Accepts: true (full), 'compact' (one-liner), false (off).
  const capabilityRouting = options.capabilityRouting === undefined
    ? (taskStr.length >= 60 ? true : false)
    : options.capabilityRouting;
  const capabilityRuntimes = Array.isArray(options.capabilityRuntimes)
    ? options.capabilityRuntimes
    : null;
  const capabilityCompact = options.capabilityCompact === true;

  const enhanced = buildEnvelope({
    task: taskStr,
    ...resolved,
    brand,
    fewShot,
    refinement,
    provider,
    promptDomains,
    capabilityRouting,
    capabilityRuntimes,
    capabilityCompact,
  });

  const techniques = ['role-priming', 'context-framing', 'explicit-format', 'do-not-list', 'self-critique-check'];
  if (resolved.outputFormat !== 'prose') techniques.push(`output-format:${resolved.outputFormat}`);
  if (resolved.depth !== 'standard') techniques.push(`depth:${resolved.depth}`);
  if (resolved.reviewMode !== 'standard') techniques.push(`review:${resolved.reviewMode}`);
  if (resolved.richMedia !== 'none') techniques.push(`rich-media:${resolved.richMedia}`);
  if (resolved.connector !== 'none') techniques.push(`connector:${resolved.connector}`);

  const issues = [];
  if (taskStr.length < 25) issues.push('prompt very short — added role + context scaffolding');
  if (!/[?.!]$/.test(taskStr)) issues.push('no terminal punctuation — wrapped as explicit task');
  if (!/\b(you|your|please|generate|write|create|build|produce|draft|design|analyze|compare|explain)\b/i.test(taskStr)) {
    issues.push('no explicit verb — archetype role makes intent unambiguous');
  }

  if (resolved.outputFormat === 'html') techniques.push(`brand:${brand.id}`);
  if (fewShot > 0) techniques.push(`few-shot:${fewShot}`);
  if (refinement && refinement !== 'none') techniques.push(`refinement:${refinement}`);
  if (provider && provider !== 'claude') techniques.push(`provider:${provider}`);

  return {
    enhanced,
    archetype,
    options: {
      ...resolved,
      brandId: brand.id,
      fewShot,
      refinement,
      provider,
      promptDomains,
      capabilityRouting,
    },
    techniques_used: techniques,
    original_issues: issues,
  };
}

export const DOLPHIN_ENGINE_VERSION = '2.4.0';
