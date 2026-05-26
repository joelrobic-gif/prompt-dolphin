// PromptDolphin Engine v2 — public API
// MIT License — Robic Direct Inc.
// Deterministic prompt engineering. No LLM call at generation time.

import { ARCHETYPES, ARCHETYPE_ORDER } from './archetypes/index.mjs';
import { ADAPTERS, ADAPTER_ORDER } from './adapters/index.mjs';
import {
  QUALITY_AXIS,
  QUALITY_AXIS_ORDER,
  REASONING_PRESETS,
  REVIEW_MODES,
  RICH_MEDIA,
} from './quality-axis.mjs';
import { classify } from './classifier.mjs';
import { buildSpine, render } from './spine.mjs';
import { preflight } from './preflight.mjs';

export {
  ARCHETYPES,
  ARCHETYPE_ORDER,
  ADAPTERS,
  ADAPTER_ORDER,
  QUALITY_AXIS,
  QUALITY_AXIS_ORDER,
  REASONING_PRESETS,
  REVIEW_MODES,
  RICH_MEDIA,
  classify,
  buildSpine,
  render,
  preflight,
};

export function engineer(task, options = {}) {
  const {
    adapter = 'claude',
    quality = 'fast_detailed',
    archetype: archetypeOverride,
    userConstraints = [],
    examples = [],
  } = options;

  const classifyResult = archetypeOverride
    ? { archetype: archetypeOverride, confidence: Infinity, scores: {}, runnerUp: null }
    : classify(task);

  const archetype = classifyResult.archetype;
  const spine = buildSpine({ task, archetype, quality, userConstraints, examples });
  const engineered = render(spine, adapter);
  const preflightResult = preflight(engineered, { task, userConstraints, spine });

  return {
    engineered,
    archetype,
    quality,
    adapter,
    spine,
    preflight: preflightResult,
    classification: {
      winner: classifyResult.archetype,
      confidence: classifyResult.confidence,
      runnerUp: classifyResult.runnerUp,
      scores: classifyResult.scores,
    },
  };
}

export default engineer;
