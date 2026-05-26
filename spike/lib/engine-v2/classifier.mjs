// PromptDolphin Engine v2 — specificity-scored archetype classifier
// MIT License — Robic Direct Inc.

import { ARCHETYPES } from './archetypes/index.mjs';

const compiledCache = new Map();

function compile(pattern) {
  if (!compiledCache.has(pattern)) {
    compiledCache.set(pattern, new RegExp(pattern, 'i'));
  }
  return compiledCache.get(pattern);
}

export function classify(task) {
  const t = String(task);
  const scores = {};

  for (const [id, arch] of Object.entries(ARCHETYPES)) {
    let score = 0;
    let matches = 0;
    const matchedPatterns = [];
    for (const sig of arch.signals || []) {
      const re = compile(sig.pattern);
      if (re.test(t)) {
        score += sig.weight;
        matches += 1;
        matchedPatterns.push(sig.pattern);
      }
    }
    scores[id] = {
      score,
      matches,
      specificity: matches > 0 ? score / matches : 0,
      matchedPatterns,
    };
  }

  const ranked = Object.entries(scores)
    .filter(([id]) => id !== 'general')
    .sort((a, b) => {
      if (b[1].score !== a[1].score) return b[1].score - a[1].score;
      if (b[1].specificity !== a[1].specificity) return b[1].specificity - a[1].specificity;
      return a[0].localeCompare(b[0]);
    });

  const top = ranked[0];
  const winner = top && top[1].score > 0 ? top[0] : 'general';

  return {
    archetype: winner,
    confidence: top ? top[1].score : 0,
    scores,
    runnerUp: ranked[1] ? ranked[1][0] : null,
  };
}
