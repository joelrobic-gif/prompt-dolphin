// PromptDolphin — deterministic LLM recommender.
// Pure function over (archetype, outputFormat). No LLM call, no network, no deps.
// Imports ONLY types from engine-v2 (erased at build — zero runtime coupling).
//
// Grounded in real 2026 consumer-LLM strengths:
//   Claude   — best self-contained HTML/artifacts + long structured reasoning
//   ChatGPT  — data analysis, charts-from-raw-data, Code Interpreter
//   Copilot  — sources living in Teams / SharePoint / Outlook (M365 Graph)
//   Gemini   — very long source synthesis, 1M context, NotebookLM
//   Grok     — real-time / current events / sentiment via X
// MIT License — Robic Direct Inc.

import type { AdapterId, ArchetypeId, OutputFormatId } from './engine-v2';

export interface ModelRecommendation {
  adapter: AdapterId;
  /** Consumer-facing surface name shown in the badge. Plain English; product
   *  feature names ("Artifacts", "Data Analysis") are allowed — these are not
   *  prompt-engineering jargon. */
  surface: string;
  /** One plain-English sentence — why this model fits. Capitalized, ends with
   *  a period. No prompt-engineering terms. */
  why: string;
}

// Consumer-facing surface names (2026). Centralized so the override <select>
// and the badge stay in sync.
export const ADAPTER_SURFACE: Record<AdapterId, string> = {
  claude: 'Claude (Opus 4.x) — Artifacts',
  chatgpt: 'ChatGPT (GPT-5) — Data Analysis',
  gemini: 'Gemini (2.x) — long context',
  copilot: 'Microsoft Copilot — M365',
  grok: 'Grok (xAI) — real-time',
};

// Generic plain-English rationale per adapter. Full sentences (capitalized,
// trailing period) so the badge reads cleanly after the em dash.
const ADAPTER_WHY: Record<AdapterId, string> = {
  claude: 'Best at building polished, self-contained documents and pages you can refine in place.',
  chatgpt: 'Best at crunching raw numbers and drawing charts straight from your data.',
  gemini: 'Best at reading very long source material in one pass and synthesizing it.',
  copilot: 'Best when the source material lives in your Teams, SharePoint, and Outlook.',
  grok: 'Best for anything that turns on real-time events, news, or public sentiment.',
};

// ---------------------------------------------------------------------------
// ARCHETYPE -> recommended adapter. All 15 mapped (exhaustive Record, so a
// missing archetype is a COMPILE error — the static guarantee).
// ---------------------------------------------------------------------------
const ARCHETYPE_ADAPTER: Record<ArchetypeId, AdapterId> = {
  executive_email:    'claude',   // crisp drafting + tone control
  meeting_prep:       'copilot',  // prep docs live in M365
  research_synthesis: 'gemini',   // many long sources, 1M context
  presentation_deck:  'claude',   // builds the deck, iterate in place
  data_analysis:      'chatgpt',  // Code Interpreter / charts from raw data
  pharma_regulatory:  'claude',   // long structured briefing documents
  biotech_investor:   'claude',   // polished investor-grade documents
  due_diligence:      'gemini',   // wide synthesis across a data room
  post_incident:      'claude',   // structured timeline / RCA document
  board_brief:        'claude',   // board-grade self-contained document
  strategy_brief:     'claude',   // option framing + long reasoning
  meta_prompt:        'claude',   // careful instruction authoring
  trading_system:     'chatgpt',  // backtest logic + computation
  system_design:      'claude',   // long design doc + diagrams
  general:            'claude',   // safe high-quality default
};

// Per-archetype custom rationale (overrides generic ADAPTER_WHY when set).
// One plain-English sentence each. Capitalized, trailing period.
const ARCHETYPE_WHY: Partial<Record<ArchetypeId, string>> = {
  meeting_prep:       'Best when your prep material lives in Teams, SharePoint, and Outlook.',
  research_synthesis: 'Best at reading many long sources at once and pulling them together.',
  data_analysis:      'Best at computing the numbers and charting them from your raw data.',
  due_diligence:      'Best at synthesizing a large data room of long documents in one pass.',
  trading_system:     'Best at writing and checking the calculation logic behind the strategy.',
  presentation_deck:  'Best at building the deck so you can refine the slides in place.',
};

// ---------------------------------------------------------------------------
// OUTPUT-FORMAT overrides. Deliverable shape is the stronger model signal:
// an HTML page wants Claude regardless of topic; an Excel deliverable wants
// ChatGPT's compute. Override WINS over the archetype mapping when present.
// ---------------------------------------------------------------------------
const FORMAT_ADAPTER: Partial<Record<OutputFormatId, AdapterId>> = {
  html:            'claude',
  excel:           'chatgpt',
  csv:             'chatgpt',
  power_bi:        'chatgpt',
  json:            'chatgpt',
  research_report: 'gemini',
};

const FORMAT_WHY: Partial<Record<OutputFormatId, string>> = {
  html:            'Best at producing a polished, self-contained web page you can open and print.',
  excel:           'Best at building a real spreadsheet with the numbers computed for you.',
  csv:             'Best at producing clean, computed tabular data.',
  power_bi:        'Best at preparing the data and the chart spec from your raw numbers.',
  json:            'Best at returning strictly valid, machine-readable data.',
  research_report: 'Best at reading many long sources and synthesizing one report.',
};

/**
 * Deterministic recommendation. Output-format override wins over the archetype
 * mapping when present. Pure — same inputs always yield byte-identical output.
 */
export function recommendFor(
  archetype: ArchetypeId,
  outputFormat: OutputFormatId,
): ModelRecommendation {
  const fmtAdapter = FORMAT_ADAPTER[outputFormat];
  if (fmtAdapter) {
    return {
      adapter: fmtAdapter,
      surface: ADAPTER_SURFACE[fmtAdapter],
      why: FORMAT_WHY[outputFormat] ?? ADAPTER_WHY[fmtAdapter],
    };
  }
  const adapter = ARCHETYPE_ADAPTER[archetype] ?? 'claude';
  return {
    adapter,
    surface: ADAPTER_SURFACE[adapter],
    why: ARCHETYPE_WHY[archetype] ?? ADAPTER_WHY[adapter],
  };
}

// Ordered list for the override <select> (stable, deterministic order).
export const ADAPTER_IDS: AdapterId[] = ['claude', 'chatgpt', 'gemini', 'copilot', 'grok'];
