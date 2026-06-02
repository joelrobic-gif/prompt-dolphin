#!/usr/bin/env node
/**
 * scripts/parity-bench-v1-vs-v2.mjs
 *
 * Compare PromptDolphin v1 engine (engine/engine.mjs) vs Krentix
 * v2.1 engine (engine/krentix-engine/dolphin-engine.js) over the
 * same PD prompt corpus. Score with the v2 deterministic grader so
 * we have a single metric across both.
 *
 * Run: node scripts/parity-bench-v1-vs-v2.mjs
 */

import { engineer as engineerV1 } from '../engine/engine.mjs';
import { engineer as engineerV2, DOLPHIN_ENGINE_VERSION as V2_VER } from '../engine/krentix-engine/dolphin-engine.js';
import { gradeDeterministic, GRADER_VERSION } from '../engine/krentix-engine/eval/grader.js';

// Subset of PD's own test corpus + a few v2-specific cases.
const PROMPTS = [
  { input: 'Write an email to my VP asking to delay the Q3 launch by two weeks', expected: { archetype: 'email', outputFormat: 'email' } },
  { input: 'Draft a message to my team explaining the headcount freeze', expected: { archetype: 'email', outputFormat: 'email' } },
  { input: 'Should we acquire the Boston-based RWE startup?', expected: { archetype: 'strategy', outputFormat: 'prose' } },
  { input: 'Prep me for tomorrow board meeting on the Series B round', expected: { archetype: 'meeting', outputFormat: 'prose' } },
  { input: 'Build a 10-slide pitch deck for our Phase 2 oncology trial', expected: { archetype: 'slides', outputFormat: 'powerpoint' } },
  { input: 'Synthesize the latest mRNA platform competitive landscape', expected: { archetype: 'research', outputFormat: 'prose' } },
  { input: 'Draft the FDA Type B meeting briefing for our antibody program', expected: { archetype: 'regulatory', outputFormat: 'prose' } },
  { input: 'Write our Q3 investor update letter', expected: { archetype: 'investor', outputFormat: 'prose' } },
  { input: 'Provide the high polish HTML summary of top news headlines from last week', expected: { archetype: 'html_news_report', outputFormat: 'html' } },
  { input: 'deep research report on the GLP-1 weight loss market, with sources', expected: { archetype: 'research', outputFormat: 'research_report' } },
  { input: 'investor pitch deck for our Series A - 12 slides', expected: { archetype: 'slides', outputFormat: 'powerpoint' } },
  { input: 'make a comparison table of GPT-4o, Claude Opus 4.7, Gemini 2.5 Pro pricing', expected: { archetype: 'general', outputFormat: 'markdown' } },
  { input: 'build me a one-pager on the EU AI Act compliance landscape', expected: { archetype: 'research', outputFormat: 'pdf_1pager' } },
  { input: 'weekly portfolio digest as HTML report I can email investors', expected: { archetype: 'html_news_report', outputFormat: 'html' } },
  { input: 'Explain the CAP theorem with a concrete example', expected: { archetype: 'general', outputFormat: 'prose' } },
  { input: 'what is a closure in JavaScript', expected: { archetype: 'general', outputFormat: 'prose' } },
];

// Adapter: PD v1 engineer returns a different shape. Coerce to v2's
// { enhanced, archetype, options:{outputFormat} } so the v2 grader can score it.
function adaptV1(prompt) {
  const r = engineerV1(prompt);
  return {
    enhanced: r.engineered || r.enhanced || '',
    archetype: r.archetype || 'general',
    options: { outputFormat: r.outputFormat || r.options?.outputFormat || 'prose' },
  };
}

function mean(arr) {
  return arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
}

const v1Scores = [];
const v2Scores = [];
const v1Archetype = [];
const v2Archetype = [];
const v1Format = [];
const v2Format = [];

for (const p of PROMPTS) {
  let v1, v2;
  try { v1 = adaptV1(p.input); } catch (e) { v1 = { enhanced: '', archetype: 'general', options: { outputFormat: 'prose' } }; }
  try { v2 = engineerV2(p.input); } catch (e) { v2 = { enhanced: '', archetype: 'general', options: { outputFormat: 'prose' } }; }

  const d1 = gradeDeterministic(v1, p.expected, p.input, { brandNeutral: true });
  const d2 = gradeDeterministic(v2, p.expected, p.input, { brandNeutral: true });

  v1Scores.push(d1.deterministicScore);
  v2Scores.push(d2.deterministicScore);
  v1Archetype.push(d1.archetypeMatch ? 1 : 0);
  v2Archetype.push(d2.archetypeMatch ? 1 : 0);
  v1Format.push(d1.formatMatch ? 1 : 0);
  v2Format.push(d2.formatMatch ? 1 : 0);
}

console.log('=== PromptDolphin v1 vs Krentix v2.1 PARITY BENCH ===');
console.log(`Krentix engine version: ${V2_VER}`);
console.log(`Grader version: ${GRADER_VERSION}`);
console.log(`Corpus: ${PROMPTS.length} prompts (PD-native).\n`);
console.log('Metric                  | v1 (PD orig) | v2.1 (Krentix) | Delta');
console.log('------------------------|--------------|----------------|------');
console.log(`Mean det score          | ${String(mean(v1Scores)).padEnd(12)} | ${String(mean(v2Scores)).padEnd(14)} | ${(mean(v2Scores) - mean(v1Scores)).toFixed(1)}`);
console.log(`Archetype accuracy %    | ${String((mean(v1Archetype) * 100).toFixed(1)).padEnd(12)} | ${String((mean(v2Archetype) * 100).toFixed(1)).padEnd(14)} | ${(mean(v2Archetype) * 100 - mean(v1Archetype) * 100).toFixed(1)}pp`);
console.log(`Format accuracy %       | ${String((mean(v1Format) * 100).toFixed(1)).padEnd(12)} | ${String((mean(v2Format) * 100).toFixed(1)).padEnd(14)} | ${(mean(v2Format) * 100 - mean(v1Format) * 100).toFixed(1)}pp`);

const verdict = mean(v2Scores) > mean(v1Scores) ? 'IMPROVED' : (mean(v2Scores) === mean(v1Scores) ? 'PARITY' : 'REGRESSED');
console.log(`\nVerdict: ${verdict}`);
