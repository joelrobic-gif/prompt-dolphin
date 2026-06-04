/**
 * src/prompt-engineer/task-clarifier/cache.js
 *
 * In-memory LRU cache for clarified-task entries. Reads + writes are
 * O(1). Repeat asks hit cache instantly - user said "saves energy and
 * speed when it's a repeat request it's seen before".
 *
 * Optional disk persistence: caller passes { diskPath } to load() once
 * at boot + save() periodically. Engine itself stays sync + fast.
 */

import { promises as fs } from 'node:fs';

export const CACHE_VERSION = '1.0.0';

const MAX_SIZE = 1000;
const TTL_MS = 90 * 24 * 60 * 60 * 1000;

const MEMORY = new Map();

/**
 * Lookup a fingerprint hash. Returns the cached entry (with .hits
 * incremented, .lastHitAt updated) or null. Expired entries removed.
 */
export function getCached(fingerprint, nowMs) {
  if (!fingerprint) return null;
  const entry = MEMORY.get(fingerprint);
  if (!entry) return null;
  const now = typeof nowMs === 'number' ? nowMs : Date.now();
  if (now - entry.cachedAt > TTL_MS) {
    MEMORY.delete(fingerprint);
    return null;
  }
  entry.hits = (entry.hits || 0) + 1;
  entry.lastHitAt = now;
  MEMORY.delete(fingerprint);
  MEMORY.set(fingerprint, entry);
  return entry;
}

export function setCache(fingerprint, value, nowMs) {
  if (!fingerprint) return;
  const now = typeof nowMs === 'number' ? nowMs : Date.now();
  if (!MEMORY.has(fingerprint) && MEMORY.size >= MAX_SIZE) {
    const lruKey = MEMORY.keys().next().value;
    if (lruKey) MEMORY.delete(lruKey);
  }
  MEMORY.set(fingerprint, {
    ...value,
    fingerprint,
    cachedAt: now,
    lastHitAt: now,
    hits: value?.hits || 0,
  });
}

export function clearCache() { MEMORY.clear(); }

export function cacheStats() {
  let totalHits = 0;
  for (const v of MEMORY.values()) totalHits += v.hits || 0;
  return { size: MEMORY.size, maxSize: MAX_SIZE, totalHits };
}

/**
 * Hydrate cache from a JSON file on disk. Caller invokes once at boot.
 */
export async function loadFromDisk(diskPath) {
  if (!diskPath) return { loaded: 0 };
  try {
    const raw = await fs.readFile(diskPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return { loaded: 0 };
    const now = Date.now();
    let loaded = 0;
    for (const e of parsed.entries) {
      if (!e.fingerprint) continue;
      if (now - (e.cachedAt || 0) > TTL_MS) continue;
      MEMORY.set(e.fingerprint, e);
      loaded += 1;
    }
    return { loaded };
  } catch (err) {
    if (err.code === 'ENOENT') return { loaded: 0 };
    return { loaded: 0, error: err.message };
  }
}

/**
 * Atomically flush cache to disk (temp + rename).
 */
export async function saveToDisk(diskPath) {
  if (!diskPath) return { saved: 0 };
  const entries = [...MEMORY.values()];
  const payload = {
    version: CACHE_VERSION,
    savedAt: new Date().toISOString(),
    entries,
  };
  try {
    const tmpPath = `${diskPath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
    await fs.rename(tmpPath, diskPath);
    return { saved: entries.length };
  } catch (err) {
    return { saved: 0, error: err.message };
  }
}
