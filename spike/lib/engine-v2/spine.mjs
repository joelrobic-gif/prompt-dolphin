// PromptDolphin Engine v2 — 7-component spine assembler + adapter renderer
// MIT License — Robic Direct Inc.

import { ARCHETYPES } from './archetypes/index.mjs';
import { ADAPTERS } from './adapters/index.mjs';
import {
  QUALITY_AXIS,
  REASONING_PRESETS,
  REVIEW_MODES,
  RICH_MEDIA,
} from './quality-axis.mjs';

export function buildSpine({ task, archetype, quality, userConstraints = [], examples = [] }) {
  const arch = ARCHETYPES[archetype];
  if (!arch) throw new Error(`Unknown archetype: ${archetype}`);
  const qa = QUALITY_AXIS[quality];
  if (!qa) throw new Error(`Unknown quality axis: ${quality}`);

  const contextParts = [arch.context, qa.depth.summary].filter(Boolean);
  const context = contextParts.join('\n\n');

  const reasoningParts = [REASONING_PRESETS[qa.reasoning] || '', arch.reasoning].filter(Boolean);
  const reasoning = reasoningParts.join('\n\n');

  const exclusionsParts = [arch.exclusions];
  if (qa.depth.maxWords) exclusionsParts.push(`Max length: ${qa.depth.maxWords} words.`);
  if (userConstraints.length) {
    exclusionsParts.push(
      'USER CONSTRAINTS (preserve verbatim, do not paraphrase):\n- ' +
        userConstraints.join('\n- ')
    );
  }
  const exclusions = exclusionsParts.filter(Boolean).join('\n\n');

  const exampleList = [...(arch.examples || []), ...examples];
  const examplesBlock = exampleList.length
    ? exampleList.map((e, i) => `${i + 1}. ${e}`).join('\n')
    : '';

  const extraParts = [
    qa.reviewMode ? REVIEW_MODES[qa.reviewMode] : '',
    qa.richMedia ? RICH_MEDIA[qa.richMedia] : '',
  ].filter(Boolean);
  const extra = extraParts.join('\n\n');

  return {
    role: arch.role,
    task: String(task).trim(),
    context,
    reasoning,
    format: arch.format,
    exclusions,
    examples: examplesBlock,
    critique: arch.critique,
    extra,
  };
}

export function render(spine, adapterId) {
  const adapter = ADAPTERS[adapterId];
  if (!adapter) throw new Error(`Unknown adapter: ${adapterId}`);
  const parts = [];
  for (const block of adapter.blocks) {
    const content = spine[block.name];
    if (!content) continue;
    parts.push(`${block.open}${content}${block.close}`);
  }
  return parts.join(adapter.separator);
}
