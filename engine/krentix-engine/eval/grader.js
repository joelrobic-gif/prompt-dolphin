/**
 * src/prompt-engineer/eval/grader.js
 *
 * L99 PE-Phase 2: structured grader for engineered-prompt quality.
 *
 * Two layers:
 *   1. Deterministic checks (zero cost): archetype-detection accuracy,
 *      format-detection accuracy, presence of required scaffold tokens
 *      (role/context/format/constraints/critique), no brand leak for
 *      brand-neutral runs, no prompt-injection relay, token bloat check.
 *   2. LLM grader (optional, costed): semantic rubric scoring on
 *      specificity, design polish, few-shot coverage, self-refinement,
 *      cost discipline.
 *
 * Grader is injected with a `callModel` dep so caller chooses provider.
 */

export const GRADER_VERSION = '1.2.0';

/**
 * Deterministic grader — pure function, zero cost.
 */
export function gradeDeterministic(engineered, expected, originalInput, opts = {}) {
  const brandNeutral = opts.brandNeutral !== false;
  // Visual archetypes (html_news_report, slides) inherently carry richer
  // design contracts. A 12x bloat ceiling penalizes the very polish we
  // demand. Tier by archetype family.
  const visualArchetypes = new Set(['html_news_report', 'slides']);
  const isVisual = visualArchetypes.has(engineered?.archetype)
    || engineered?.options?.outputFormat === 'html'
    || engineered?.options?.outputFormat === 'powerpoint';
  // Few-shot examples are intentional bulk — must not penalize cost when
  // caller opted in. Visual archetypes earn the highest budget. Capability
  // routing adds ~4000 chars deterministically when present.
  const fewShot = Number(engineered?.options?.fewShot ?? 0);
  const capRouting = engineered?.options?.capabilityRouting;
  const baseMax = isVisual ? 80 : 12;
  const fewShotBump = fewShot > 0 ? 40 : 0;
  const capabilityBump = capRouting === true ? 80 : (capRouting === 'compact' ? 20 : 0);
  const maxTokenMultiplier = opts.maxTokenMultiplier ?? (baseMax + fewShotBump + capabilityBump);

  const enhanced = String(engineered?.enhanced || '');
  const original = String(originalInput || '');

  const archetypeMatch = engineered?.archetype === expected?.archetype;
  const formatMatch = (engineered?.options?.outputFormat || 'prose') === (expected?.outputFormat || 'prose');

  const hasRole = /<role>|^role:|## role/i.test(enhanced);
  const hasContext = /<context>|## context/i.test(enhanced);
  const hasFormat = /<format>|## format|<output_format>/i.test(enhanced);
  const hasConstraints = /<do_not>|<constraints>|## constraints/i.test(enhanced);
  const hasCritique = /<critique>|## critique|self.?audit|self.?refine|review your/i.test(enhanced);
  // Phase 4/5: reward few-shot examples + refinement directives in scaffold.
  const hasExamples = /<example[\s>]|<examples>|## examples|\*\*examples\*\*|^EXAMPLES:/im.test(enhanced);
  const hasRefinement = /<refinement>|chain.of.density|self.refinement|## refinement|\*\*refinement\*\*|^REFINEMENT:/im.test(enhanced);

  // Brand-leak check must IGNORE the echoed user input — a user typing
  // "Krentix" in their own prompt is not an engine leak. Strip the
  // "### New Input:" tail before scanning.
  const enhancedScaffold = enhanced.split(/^### New Input:/m)[0] || enhanced;
  const brandLeak = brandNeutral && /krentix|#1A3A6B|#8FB1E0/i.test(enhancedScaffold);
  const injectionRelay = /ignore (?:all )?previous/i.test(original) && /ignore (?:all )?previous/i.test(enhanced);

  const tokenMultiplier = original.length === 0 ? 0 : enhanced.length / original.length;
  const tokenBloat = tokenMultiplier > maxTokenMultiplier;

  let score = 0;
  if (archetypeMatch) score += 20;
  if (formatMatch) score += 15;
  if (hasRole) score += 10;
  if (hasContext) score += 8;
  if (hasFormat) score += 8;
  if (hasConstraints) score += 8;
  if (hasCritique) score += 8;
  if (!brandLeak) score += 10;
  if (!injectionRelay) score += 8;
  if (!tokenBloat) score += 5;
  // v1.2: few-shot + refinement signals. Capped at 100 total.
  if (hasExamples) score += 5;
  if (hasRefinement) score += 5;
  score = Math.min(100, score);

  return {
    archetypeMatch, formatMatch,
    hasRole, hasContext, hasFormat, hasConstraints, hasCritique,
    hasExamples, hasRefinement,
    brandLeak, injectionRelay,
    tokenMultiplier: Number(tokenMultiplier.toFixed(2)),
    tokenBloat,
    deterministicScore: score,
  };
}

const LLM_RUBRIC = `You are a senior prompt-engineering reviewer for an L99-grade engine.

Score the ENGINEERED prompt on these dimensions (0-100 each):

  SPECIFICITY     - Does it add concrete guidance beyond generic template?
                    Reward: named techniques, named formats, count requirements.
                    Penalize: vague verbs ("write well", "be clear").

  DESIGN_POLISH   - When output is visual (HTML/slides/PDF), are design
                    directives present + specific (palette, fonts, layout,
                    hero images, sources policy, contrast)?
                    For non-visual formats: score 100 if not applicable.

  FEW_SHOT        - Does it include 1+ concrete example outputs (not just
                    "do good work")? Reward inline <example> blocks.

  SELF_REFINE     - Does it instruct the model to audit + revise its own
                    first draft? Reward: critique tag, "review then revise".

  COST_DISCIPLINE - Token bloat? Reward concise specificity over verbose
                    scaffolding. Penalize if 2x+ original without proportional value.

Return ONLY this JSON object (no prose, no fences):
{"specificity": N, "design_polish": N, "few_shot": N, "self_refine": N, "cost_discipline": N, "rationale": "1-2 sentences"}`;

export async function gradeLlm({ original, enhanced, expectedFormat, callModel }) {
  if (typeof callModel !== 'function') throw new Error('gradeLlm requires callModel fn');
  const prompt = `${LLM_RUBRIC}

ORIGINAL USER INPUT:
${String(original).slice(0, 1000)}

EXPECTED OUTPUT FORMAT: ${expectedFormat || 'prose'}

ENGINEERED PROMPT:
${String(enhanced).slice(0, 3000)}

Now return the JSON:`;
  try {
    const raw = await callModel(prompt);
    const txt = String(raw || '').replace(/```json\n?|```\n?/g, '').trim();
    const m = txt.match(/\{[\s\S]*\}/);
    const obj = m ? JSON.parse(m[0]) : null;
    if (!obj) return { error: 'no-json' };
    const fields = ['specificity', 'design_polish', 'few_shot', 'self_refine', 'cost_discipline'];
    const vals = fields.map((k) => Math.max(0, Math.min(100, Number(obj[k]) || 0)));
    const llmScore = +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    return { ...obj, llmScore };
  } catch (e) {
    return { error: e?.message || 'grade-error' };
  }
}

export function composite(det, llm) {
  const dScore = det?.deterministicScore ?? 0;
  const lScore = (llm && typeof llm.llmScore === 'number') ? llm.llmScore : null;
  const compositeScore = lScore == null
    ? Number(dScore.toFixed(1))
    : Number(((dScore + lScore) / 2).toFixed(1));
  return {
    compositeScore,
    breakdown: {
      deterministicScore: dScore,
      llmScore: lScore,
      deterministic: det,
      llm: llm || null,
    },
  };
}
