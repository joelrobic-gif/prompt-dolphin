/**
 * src/prompt-engineer/telemetry/cost-tracker.js
 *
 * L99 PE-Phase 7: cost telemetry for engineered prompts.
 *
 * Two responsibilities:
 *   1. Estimate the per-call cost of an engineered prompt across the
 *      provider price list (rough cents-per-call) so the engine can
 *      surface budget impact at suggest-time.
 *   2. Build per-call telemetry records and roll up to daily aggregates.
 *
 * Pure module - callers handle persistence (writeJsonlAppend, Sentry, etc).
 */

export const COST_TRACKER_VERSION = '1.0.0';

// USD per 1M tokens. Refresh quarterly from each provider's price page.
export const PRICE_TABLE_VERSION = '2026-Q2';
export const PRICE_TABLE = Object.freeze({
  'claude-opus-4-5':           { input:  15,   output:  75 },
  'claude-sonnet-4-5':         { input:   3,   output:  15 },
  'claude-haiku-4-5':          { input:   0.8, output:   4 },
  'gpt-4o':                    { input:   2.5, output:  10 },
  'gpt-4o-mini':               { input:   0.15, output: 0.6 },
  'o1':                        { input:  15,   output:  60 },
  'gemini-2.5-pro':            { input:   1.25, output:  5 },
  'gemini-2.5-flash':          { input:   0.3, output:  2.5 },
  'generic-frontier':          { input:   3,   output:  15 },
  'generic-economy':           { input:   1,   output:   3 },
});

/**
 * Rough character-to-token estimate. ~4 chars per token across providers.
 * Use a real tokenizer for billing reconciliation.
 */
export function estimateTokens(text) {
  return Math.ceil(String(text || '').length / 4);
}

/**
 * Estimate USD cost for a single call. Accepts either text or token counts.
 */
export function estimateCost(model, inputArg, outputArg) {
  const price = PRICE_TABLE[model] || PRICE_TABLE['generic-frontier'];
  const inputTokens  = typeof inputArg  === 'number' ? inputArg  : estimateTokens(inputArg);
  const outputTokens = typeof outputArg === 'number' ? outputArg : estimateTokens(outputArg);
  const inputCost  = (inputTokens  / 1_000_000) * price.input;
  const outputCost = (outputTokens / 1_000_000) * price.output;
  return {
    model,
    priceTableVersion: PRICE_TABLE_VERSION,
    inputTokens, outputTokens,
    inputCostUsd:  +inputCost.toFixed(6),
    outputCostUsd: +outputCost.toFixed(6),
    totalCostUsd:  +(inputCost + outputCost).toFixed(6),
  };
}

/**
 * Compare cost between vanilla user prompt vs engineered prompt.
 * Returns { vanilla, engineered, deltaCostUsd, multiplier }.
 */
export function deltaCost({ vanillaText, engineeredText, model, expectedOutputTokens = 800 }) {
  const v = estimateCost(model, vanillaText, expectedOutputTokens);
  const e = estimateCost(model, engineeredText, expectedOutputTokens);
  const deltaUsd = +(e.totalCostUsd - v.totalCostUsd).toFixed(6);
  const multiplier = v.totalCostUsd > 0 ? +(e.totalCostUsd / v.totalCostUsd).toFixed(3) : null;
  return { vanilla: v, engineered: e, deltaCostUsd: deltaUsd, multiplier };
}

/**
 * Build a single telemetry record. Caller persists (Postgres / JSONL / etc).
 * tsIso is supplied by caller to keep this fn pure.
 */
export function buildTelemetryRecord({
  archetype,
  outputFormat,
  model,
  engineerVersion,
  brandId,
  engineeredInputTokens,
  observedOutputTokens,
  tsIso,
}) {
  const cost = estimateCost(model, engineeredInputTokens, observedOutputTokens);
  return {
    ts: tsIso,
    engineerVersion,
    archetype,
    outputFormat,
    brandId,
    ...cost,
  };
}

/**
 * Aggregate a list of telemetry records into a daily roll-up.
 */
export function rollupDaily(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      n: 0, totalCostUsd: 0, meanCostUsd: 0,
      meanInputTokens: 0, meanOutputTokens: 0,
      byArchetype: {}, byModel: {},
    };
  }
  const n = records.length;
  const totalCost = records.reduce((s, r) => s + (r.totalCostUsd || 0), 0);
  const totalIn   = records.reduce((s, r) => s + (r.inputTokens  || 0), 0);
  const totalOut  = records.reduce((s, r) => s + (r.outputTokens || 0), 0);
  const byArchetype = {};
  const byModel = {};
  for (const r of records) {
    const a = r.archetype || 'unknown';
    const m = r.model || 'unknown';
    byArchetype[a] = byArchetype[a] || { n: 0, costUsd: 0 };
    byArchetype[a].n += 1;
    byArchetype[a].costUsd += r.totalCostUsd || 0;
    byModel[m] = byModel[m] || { n: 0, costUsd: 0 };
    byModel[m].n += 1;
    byModel[m].costUsd += r.totalCostUsd || 0;
  }
  for (const v of Object.values(byArchetype)) v.costUsd = +v.costUsd.toFixed(4);
  for (const v of Object.values(byModel))     v.costUsd = +v.costUsd.toFixed(4);
  return {
    n,
    totalCostUsd:     +totalCost.toFixed(4),
    meanCostUsd:      +(totalCost / n).toFixed(6),
    meanInputTokens:  Math.round(totalIn  / n),
    meanOutputTokens: Math.round(totalOut / n),
    byArchetype,
    byModel,
  };
}
