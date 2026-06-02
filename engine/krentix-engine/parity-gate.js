/**
 * Parity Gate
 * A/B tests original vs PE-improved prompt. Rejects the improved version
 * if it scores worse than the original by more than DELTA_TOLERANCE points.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const DELTA_TOLERANCE = 5;
export const PARITY_GATE_VERSION = '1.0.0';

// ── Scoring ───────────────────────────────────────────────────────────────────

/** Patterns that indicate a refusal response */
const REFUSAL_PATTERNS = [
  /i (can't|cannot|won't|will not|am unable to)/i,
  /i (don't|do not) (have|provide|offer) (access|information|the ability)/i,
  /as an ai (language model|assistant)?[,\s]/i,
  /i('m| am) not able to/i,
  /that('s| is) (outside|beyond) (my|the scope)/i,
  /i('m| am) sorry[,\s]/i,
  /i('m| am) unable/i,
];

/**
 * Detect whether a response text is a refusal.
 * @param {string} text
 * @returns {boolean}
 */
function isRefusal(text) {
  return REFUSAL_PATTERNS.some(re => re.test(text));
}

/**
 * Detect whether a prompt is time-sensitive.
 * @param {string} prompt
 * @returns {boolean}
 */
function isTimeSensitive(prompt) {
  return /\b(today|now|current|latest|recent|breaking|live|real.?time|right now|as of|this (week|month|year))\b/i.test(prompt);
}

/**
 * Score a pipeline response against the originating prompt.
 *
 * Scoring rubric (base 60):
 *  -50  if prompt is time-sensitive AND response is a refusal
 *  +30  if response is longer than 200 characters
 *  +20  if response contains numbers, proper names, or dates
 *
 * Result is clamped to [0, 100].
 *
 * @param {string} prompt
 * @param {{ content?: string, text?: string, output?: string } | string} response
 * @returns {number} score 0..100
 */
export function defaultScoreResponse(prompt, response) {
  const text = typeof response === 'string'
    ? response
    : (response?.content ?? response?.text ?? response?.output ?? '');

  let score = 60;

  if (isTimeSensitive(prompt) && isRefusal(text)) {
    score -= 50;
  }

  if (text.length > 200) {
    score += 30;
  }

  // Numbers (digits), names (title-case words >= 3 chars), or date patterns
  if (/\d/.test(text) || /[A-Z][a-z]{2,}/.test(text) || /\b\d{4}\b/.test(text)) {
    score += 20;
  }

  return Math.max(0, Math.min(100, score));
}

// ── Parity check ──────────────────────────────────────────────────────────────

/**
 * Run both prompts through the pipeline in parallel and decide whether to
 * accept the improved version.
 *
 * @param {{
 *   originalPrompt: string,
 *   improvedPrompt: string,
 *   deps?: {
 *     runPipeline?: (prompt: string) => Promise<any>,
 *     scoreResponse?: (prompt: string, response: any) => number,
 *   }
 * }} opts
 *
 * @returns {Promise<{
 *   acceptImproved: boolean,
 *   originalScore: number,
 *   improvedScore: number,
 *   delta: number,
 *   reason: string,
 *   raw: { originalResponse: any, improvedResponse: any }
 * }>}
 */
export async function runParityCheck({ originalPrompt, improvedPrompt, deps = {} }) {
  const runPipeline   = deps.runPipeline   ?? _defaultRunPipeline;
  const scoreResponse = deps.scoreResponse ?? defaultScoreResponse;

  // Run both pipelines IN PARALLEL
  const [originalResponse, improvedResponse] = await Promise.all([
    runPipeline(originalPrompt),
    runPipeline(improvedPrompt),
  ]);

  const originalScore = scoreResponse(originalPrompt, originalResponse);
  const improvedScore = scoreResponse(improvedPrompt, improvedResponse);
  const delta         = improvedScore - originalScore;

  let acceptImproved;
  let reason;

  if (delta >= -DELTA_TOLERANCE) {
    acceptImproved = true;
    reason = delta >= 0
      ? `improved by ${delta} points`
      : `within tolerance (delta=${delta}, threshold=${-DELTA_TOLERANCE})`;
  } else {
    acceptImproved = false;
    reason = `rejected: improved score ${improvedScore} vs original ${originalScore} (delta=${delta}, below -${DELTA_TOLERANCE} tolerance)`;
  }

  return {
    acceptImproved,
    originalScore,
    improvedScore,
    delta,
    reason,
    raw: { originalResponse, improvedResponse },
  };
}

// ── Internal default pipeline (no-op stub) ────────────────────────────────────

/**
 * Default no-op pipeline used when deps.runPipeline is not provided.
 * Returns an empty string, guaranteeing a low score in tests.
 * @param {string} _prompt
 * @returns {Promise<string>}
 */
async function _defaultRunPipeline(_prompt) {
  return '';
}
