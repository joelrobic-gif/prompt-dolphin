/**
 * src/prompt-engineer/directives/refinement.js
 *
 * L99 PE-Phase 5: chain-of-density + self-refinement directive bank.
 *
 * Two production-grade meta-techniques injectable into any envelope:
 *
 *   CHAIN-OF-DENSITY (Adams et al. 2023): generate, then rewrite N times,
 *   each pass increasing information density without growing length.
 *   Originally for summarization; generalized here for any concise output.
 *
 *   SELF-REFINEMENT (Madaan et al. 2023): generate, then self-critique
 *   against a rubric, then revise. One-shot loop, no external judge.
 *
 * Both ship as STRINGS the envelope concatenates into <critique> or
 * <extra>. Engine wires them via engineer(task, { refinement: '...' }).
 */

export const REFINEMENT_VERSION = '1.0.0';

export const REFINEMENT_MODES = Object.freeze({
  none: '',

  cod: [
    'CHAIN-OF-DENSITY (internal - do NOT show intermediate drafts):',
    '1. Write a first draft of your answer.',
    '2. Rewrite, replacing 1-2 sentences with denser equivalents (concrete numbers, named entities, mechanisms).',
    '3. Rewrite again, replacing 1-2 more sentences. Same length, more information per word.',
    'Return ONLY the final draft. Do not include draft 1 or draft 2 in your response.',
  ].join('\n'),

  self_refine: [
    'SELF-REFINEMENT (internal - do NOT show your critique to the user):',
    '1. Produce your answer.',
    '2. Privately critique it against these criteria: factual accuracy, density (information per word), specificity (named entities + concrete numbers), structural clarity, and whether it directly answers the asked question.',
    '3. Identify the SINGLE weakest area, then rewrite to address it.',
    'Return ONLY the revised answer. Do not narrate the critique step.',
  ].join('\n'),

  cod_then_refine: [
    'CHAIN-OF-DENSITY + SELF-REFINEMENT (all steps internal):',
    '1. Draft your answer.',
    '2. Rewrite once for density: replace 2-3 sentences with denser equivalents (concrete numbers, named entities, mechanisms). Same length.',
    '3. Privately critique the dense draft: accuracy, specificity, structural clarity, direct-answer-ness.',
    '4. Rewrite once to fix the single weakest area you identified.',
    'Return ONLY the final draft. Do not include any intermediate version, draft, or critique.',
  ].join('\n'),
});

export function getRefinementDirective(mode) {
  return REFINEMENT_MODES[mode] || '';
}

export function recommendRefinement({ archetype, depth, outputFormat }) {
  if (archetype === 'general' && depth === 'standard' && outputFormat === 'prose') return 'none';
  const long = depth === 'detailed_brief' || depth === 'full_report' || outputFormat === 'research_report';
  const visual = outputFormat === 'html' || outputFormat === 'powerpoint' || archetype === 'html_news_report';
  const formal = archetype === 'regulatory' || archetype === 'strategy' || archetype === 'investor';
  if (long || visual || formal) return 'cod_then_refine';
  return 'self_refine';
}

export const REFINEMENT_KEYS = Object.freeze(Object.keys(REFINEMENT_MODES));
