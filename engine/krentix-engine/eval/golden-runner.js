#!/usr/bin/env node
/**
 * src/prompt-engineer/eval/golden-runner.js
 *
 * L99 PE-Phase 2: golden-set runner. Pipes every golden prompt through
 * the engineer + grades the output. Writes results to
 * data/prompt-engine-eval/<ISO-date>.json.
 *
 * CLI:  node src/prompt-engineer/eval/golden-runner.js
 * Lib:  import { runGoldenSet } from './eval/golden-runner.js'
 *
 * Without API key set, runs DETERMINISTIC-ONLY (zero cost). Set
 * KRENTIX_PE_EVAL_LLM=1 + provider key to enable LLM grader leg.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { engineer, DOLPHIN_ENGINE_VERSION } from '../dolphin-engine.js';
import { GOLDEN_PROMPTS, GOLDEN_SET_VERSION } from './golden-set.js';
import { gradeDeterministic, gradeLlm, composite, GRADER_VERSION } from './grader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.resolve(path.join(__dirname, '..', '..', '..', 'data', 'prompt-engine-eval'));

async function ensureDir() { try { await fs.mkdir(RESULTS_DIR, { recursive: true }); } catch { /* ignore */ } }

async function buildDefaultGraderCallModel() {
  try {
    const cfgModule = await import('../../config.js').catch(() => null);
    const cfg = cfgModule?.config || {};
    if (cfg.CEREBRAS_API_KEY) {
      const { callCerebras } = await import('../../agent/speed-path.js');
      return async (prompt) => {
        const r = await callCerebras('You are a strict prompt-engineering reviewer.', prompt, { maxTokens: 320, temperature: 0.1 });
        return r?.answer || '';
      };
    }
    if (cfg.ANTHROPIC_API_KEY) {
      const { callAnthropicHaiku } = await import('../../agent/speed-path.js');
      return async (prompt) => {
        const r = await callAnthropicHaiku('You are a strict prompt-engineering reviewer.', prompt, { maxTokens: 320, temperature: 0.1 });
        return r?.answer || '';
      };
    }
  } catch { /* fall through */ }
  return null;
}

export async function runGoldenSet(opts = {}) {
  const wantLlm = !!opts.llm;
  let callModel = opts.callModel;
  if (wantLlm && !callModel) callModel = await buildDefaultGraderCallModel();
  const brandNeutral = opts.brandNeutral !== false;

  const results = [];
  for (const item of GOLDEN_PROMPTS) {
    let engineered;
    try {
      engineered = engineer(item.input, opts.engineerOpts || {});
    } catch (e) {
      results.push({ id: item.id, error: `engineer threw: ${e?.message || e}` });
      continue;
    }
    const det = gradeDeterministic(engineered, item.expected, item.input, { brandNeutral });
    let llm = null;
    if (callModel) {
      llm = await gradeLlm({
        original: item.input,
        enhanced: engineered.enhanced,
        expectedFormat: item.expected.outputFormat,
        callModel,
      });
    }
    const comp = composite(det, llm);
    results.push({
      id: item.id,
      input: item.input,
      expected: item.expected,
      detectedArchetype: engineered.archetype,
      detectedFormat: engineered.options?.outputFormat,
      enhancedLen: (engineered.enhanced || '').length,
      compositeScore: comp.compositeScore,
      det,
      llm,
    });
  }

  const scored = results.filter((r) => typeof r.compositeScore === 'number');
  const mean = scored.length
    ? +(scored.reduce((a, b) => a + b.compositeScore, 0) / scored.length).toFixed(1)
    : 0;
  const archetypeAcc = +(scored.filter((r) => r.det?.archetypeMatch).length / Math.max(1, scored.length) * 100).toFixed(1);
  const formatAcc = +(scored.filter((r) => r.det?.formatMatch).length / Math.max(1, scored.length) * 100).toFixed(1);
  const brandLeaks = scored.filter((r) => r.det?.brandLeak).length;
  const injectionRelays = scored.filter((r) => r.det?.injectionRelay).length;
  const tokenBloats = scored.filter((r) => r.det?.tokenBloat).length;

  const summary = {
    n: results.length,
    scoredN: scored.length,
    meanCompositeScore: mean,
    archetypeAccuracyPct: archetypeAcc,
    formatAccuracyPct: formatAcc,
    brandLeaks,
    injectionRelays,
    tokenBloats,
  };

  const ts = new Date().toISOString();
  await ensureDir();
  const file = path.join(RESULTS_DIR, ts.replace(/[:.]/g, '-') + '.json');
  const payload = {
    ts,
    runMode: wantLlm ? (callModel ? 'det+llm' : 'det-only (no provider key)') : 'det-only',
    engineVersion: DOLPHIN_ENGINE_VERSION,
    goldenSetVersion: GOLDEN_SET_VERSION,
    graderVersion: GRADER_VERSION,
    summary,
    scores: results,
  };
  await fs.writeFile(file, JSON.stringify(payload, null, 2), 'utf8');
  return { ...payload, file };
}

// CLI entry — robust to Windows backslash vs file:// triple-slash variance.
const _scriptUrl = (process.argv[1] || '').replace(/\\/g, '/');
const _metaUrl = import.meta.url.replace(/^file:\/\/\/?/, '').replace(/^[\/]/, '');
if (_scriptUrl.endsWith('golden-runner.js') && _metaUrl.endsWith('golden-runner.js')) {
  const wantLlm = process.env.KRENTIX_PE_EVAL_LLM === '1';
  runGoldenSet({ llm: wantLlm })
    .then((r) => {
      console.log('=== PROMPT-ENGINE GOLDEN EVAL ===');
      console.log(JSON.stringify(r.summary, null, 2));
      console.log('Results:', r.file);
      process.exit(0);
    })
    .catch((e) => {
      console.error('Eval failed:', e?.message || e);
      process.exit(1);
    });
}
