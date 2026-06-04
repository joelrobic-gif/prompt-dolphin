/**
 * src/prompt-engineer/task-clarifier/library/index.js
 *
 * Seeded best-practice library. Each archetype has a researched
 * clarified-task template + schema/voice/length/must-haves/must-avoids.
 * Loaded statically at module init (sync, fast).
 */

import meeting_minutes from './meeting_minutes.json' with { type: 'json' };
import weekly_status from './weekly_status.json' with { type: 'json' };
import strategy_memo from './strategy_memo.json' with { type: 'json' };
import investor_update from './investor_update.json' with { type: 'json' };

export const LIBRARY = Object.freeze({
  meeting_minutes,
  weekly_status,
  strategy_memo,
  investor_update,
});

export const LIBRARY_VERSION = '1.0.0';
export const LIBRARY_ARCHETYPES = Object.freeze(Object.keys(LIBRARY));

/**
 * Map a raw user-task string to the most-likely library archetype.
 * Regex-driven, sub-ms. Returns null if no match.
 */
export function detectLibraryArchetype(task) {
  const t = String(task || '').toLowerCase();
  if (!t) return null;

  if (/\b(minutes|action items|action item|transcript|meeting notes|attendees|agenda recap|recording transcript|debrief notes|recap of (?:the )?meeting|meeting recap)\b/.test(t)) {
    return 'meeting_minutes';
  }
  if (/\b(weekly (?:update|status|report|sync)|status (?:update|report)|sitrep|wsr|weekly digest|standup notes|sprint report)\b/.test(t)) {
    return 'weekly_status';
  }
  if (/\b(strategy memo|decision memo|should we (?:acquire|buy|build|invest|enter)|build (?:or|vs) buy|make (?:or|vs) buy|strategic (?:options|review|recommendation)|recommend (?:we|whether|going|that)|go.?to.?market|gtm strategy)\b/.test(t)) {
    return 'strategy_memo';
  }
  if (/\b(investor (?:update|letter|email|note)|q[1-4] (?:update|letter)|quarterly update|monthly investor|pipeline progress|board update|founder update)\b/.test(t)) {
    return 'investor_update';
  }
  return null;
}
