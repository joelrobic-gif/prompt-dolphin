/**
 * src/prompt-engineer/task-clarifier/clarifier.js
 *
 * Task-clarification orchestrator. Multi-tier lookup so repeat asks
 * hit cache instantly + new asks fall through to seeded library or
 * optional LLM research.
 *
 *   L1: in-memory cache (instant, repeat ask)
 *   L2: seeded best-practice library (instant, first encounter of
 *       a known archetype like meeting_minutes / strategy_memo)
 *   L3: LLM research (slow - seconds - first encounter of a novel
 *       archetype; requires caller-injected researchFn)
 *   L4: null (caller falls back to original task as-is)
 */

import { fingerprintTask } from './task-fingerprint.js';
import { getCached, setCache, cacheStats } from './cache.js';
import { LIBRARY, detectLibraryArchetype } from './library/index.js';

export const CLARIFIER_VERSION = '1.0.0';

/**
 * Synchronous clarification - L1 cache + L2 library only.
 */
export function clarifyTaskSync(task, opts = {}) {
  if (!task) return null;
  const fp = fingerprintTask(task);
  if (!fp.hash) return null;

  const cached = getCached(fp.hash);
  if (cached) {
    return {
      ...cached,
      source: 'cache',
      latencyMs: 0,
      fingerprint: fp.hash,
    };
  }

  const detected = detectLibraryArchetype(task) || (LIBRARY[opts.archetype] ? opts.archetype : null);
  if (detected && LIBRARY[detected]) {
    const lib = LIBRARY[detected];
    const result = {
      archetype: detected,
      clarified_task: lib.clarified_task_template,
      schema_detail: lib.schema_detail || null,
      voice_rules: lib.voice_rules || [],
      length_targets: lib.length_targets || lib.length_targets_by_meeting_type || null,
      must_haves: lib.must_haves || [],
      must_avoid: lib.must_avoid || [],
      red_team_checklist: lib.red_team_checklist || [],
      output_format_recommendations: lib.output_format_recommendations || null,
      researched_from: lib.researched_from || [],
      source: 'library',
      latencyMs: 0,
      fingerprint: fp.hash,
    };
    setCache(fp.hash, result);
    return result;
  }
  return null;
}

/**
 * Async clarification - full ladder L1+L2+L3.
 */
export async function clarifyTask(task, opts = {}) {
  const sync = clarifyTaskSync(task, opts);
  if (sync) return sync;

  if (typeof opts.researchFn === 'function') {
    const fp = fingerprintTask(task);
    const started = Date.now();
    try {
      const researched = await opts.researchFn(task, { archetype: opts.archetype || 'general' });
      if (researched && typeof researched === 'object') {
        const result = {
          ...researched,
          source: 'researched',
          latencyMs: Date.now() - started,
          fingerprint: fp.hash,
        };
        setCache(fp.hash, result);
        return result;
      }
    } catch {
      // research failed - fall through to null
    }
  }
  return null;
}

/**
 * Render a clarified-task object as a string block for envelope injection.
 */
export function renderClarifiedTask(clarified) {
  if (!clarified || !clarified.clarified_task) return '';
  const lines = [
    `CLARIFIED TASK (best-practice schema for ${clarified.archetype || 'general'}, source: ${clarified.source}):`,
    '',
    clarified.clarified_task,
  ];
  if (Array.isArray(clarified.must_haves) && clarified.must_haves.length) {
    lines.push('', 'MUST HAVE:');
    clarified.must_haves.forEach((m) => lines.push(`  - ${m}`));
  }
  if (Array.isArray(clarified.must_avoid) && clarified.must_avoid.length) {
    lines.push('', 'MUST AVOID:');
    clarified.must_avoid.forEach((m) => lines.push(`  - ${m}`));
  }
  if (Array.isArray(clarified.red_team_checklist) && clarified.red_team_checklist.length) {
    lines.push('', 'RED-TEAM PASS (verify before delivery):');
    clarified.red_team_checklist.forEach((q) => lines.push(`  - ${q}`));
  }
  if (Array.isArray(clarified.researched_from) && clarified.researched_from.length) {
    lines.push('', `Best-practice sources: ${clarified.researched_from.slice(0, 3).join('; ')}`);
  }
  return lines.join('\n');
}

export { cacheStats };
