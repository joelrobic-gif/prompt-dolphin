/**
 * src/prompt-engineer/task-clarifier/task-fingerprint.js
 *
 * Normalize + hash a task string to a stable cache key. Strips
 * time-sensitive tokens (dates, "today", "Q3", etc.) so the same
 * structural ask hits the same cache entry regardless of when it
 * was issued.
 *
 * Also exports taskSimilarity() for fuzzy near-match lookup.
 */

import crypto from 'node:crypto';

export const TASK_FINGERPRINT_VERSION = '1.0.0';

/**
 * Normalize a task string + return SHA-256-derived stable hash.
 * Strips: case, punctuation, dates, time-sensitive tokens, extra whitespace.
 *
 * @param {string} task
 * @returns {{normalized: string, hash: string}}
 */
export function fingerprintTask(task) {
  const s = String(task || '');
  if (!s) return { normalized: '', hash: '' };
  const normalized = s
    .toLowerCase()
    .replace(/\b(today|tomorrow|yesterday|this\s+week|last\s+week|next\s+week|this\s+month|last\s+month|next\s+month|q[1-4]|h[12]|fy\d{2,4})\b/g, '[TIME]')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[DATE]')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[DATE]')
    .replace(/\b20\d{2}\b/g, '[YEAR]')
    .replace(/\$[\d,]+(?:\.\d+)?[kmb]?\b/gi, '[AMOUNT]')
    .replace(/\b\d+(?:\.\d+)?%/g, '[PCT]')
    .replace(/\b[A-Z]{3,5}\b/g, '[TICKER]')
    .replace(/https?:\/\/\S+/g, '[URL]')
    .replace(/[^a-z0-9\[\]\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const hash = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  return { normalized, hash };
}

/**
 * Jaccard token overlap between two fingerprinted tasks. Useful for
 * fuzzy near-match cache lookup when exact hash misses.
 */
export function taskSimilarity(a, b) {
  if (!a?.normalized || !b?.normalized) return 0;
  const aTok = new Set(a.normalized.split(' ').filter((t) => t.length > 2));
  const bTok = new Set(b.normalized.split(' ').filter((t) => t.length > 2));
  if (aTok.size === 0 && bTok.size === 0) return 1;
  const intersection = [...aTok].filter((t) => bTok.has(t)).length;
  const union = new Set([...aTok, ...bTok]).size;
  return union ? intersection / union : 0;
}
