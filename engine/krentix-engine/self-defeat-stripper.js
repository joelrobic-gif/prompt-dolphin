// Prompt-Engineer Self-Defeat Phrase Stripper
// Pure module: detects and removes self-defeating "safety fallback" clauses
// that cause LLMs to refuse capable behavior (e.g. web search) by pre-emptively
// claiming inability. No I/O. ESM.

export const STRIPPER_VERSION = '1.0.0';

export const SELF_DEFEAT_PATTERNS = Object.freeze([
  // HIGH severity - explicit refusal templates
  { pattern: /if you\s+(?:lack|don't have|cannot|are unable to|do not have)\s+(?:access to\s+)?(?:real[- ]?time|current|live|up[- ]?to[- ]?date|recent)\s+(?:data|information|access)/gi, severity: 'high' },
  { pattern: /state (?:this )?(?:upfront|clearly|explicitly|that you)/gi, severity: 'high' },
  { pattern: /(?:my|your)\s+(?:last\s+)?(?:training\s+)?update\s+(?:was|cutoff)/gi, severity: 'high' },
  { pattern: /i (?:don't|do not|cannot|can't)\s+have\s+access\s+to/gi, severity: 'high' },
  { pattern: /knowledge\s+(?:cutoff|cut[- ]off)/gi, severity: 'high' },
  // MED severity - fallback template instructions
  { pattern: /(?:fallback|default)\s+(?:response|message|to)/gi, severity: 'med' },
  { pattern: /if you (?:are unsure|don't know|aren't sure)/gi, severity: 'med' },
  { pattern: /check\s+\[?(?:specific\s+sources|reputable sources|news sites)/gi, severity: 'med' },
  // LOW severity - generic hedging
  { pattern: /(?:as an ai|as a language model|i'm an ai)/gi, severity: 'low' },
]);

const SEVERITY_RANK = { high: 3, med: 2, low: 1 };

function safeString(input) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') {
    try { return String(input); } catch { return ''; }
  }
  return input;
}

function snippetAround(text, start, end, window = 30) {
  const s = Math.max(0, start - window);
  const e = Math.min(text.length, end + window);
  return text.slice(s, e);
}

/**
 * Scan a prompt for self-defeating phrases.
 * @param {string} promptText
 * @returns {{ found: boolean, matches: Array<{pattern: string, snippet: string, severity: 'high'|'med'|'low', index: number, length: number}>, severity: 'high'|'med'|'low'|null }}
 */
export function detectSelfDefeat(promptText) {
  const text = safeString(promptText);
  const matches = [];
  if (!text) {
    return { found: false, matches: [], severity: null };
  }

  let topSeverity = null;
  let topRank = 0;

  for (const { pattern, severity } of SELF_DEFEAT_PATTERNS) {
    // Clone regex to avoid stateful lastIndex bleed between calls
    const re = new RegExp(pattern.source, pattern.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      matches.push({
        pattern: pattern.source,
        snippet: snippetAround(text, start, end),
        severity,
        index: start,
        length: m[0].length,
      });
      if (SEVERITY_RANK[severity] > topRank) {
        topRank = SEVERITY_RANK[severity];
        topSeverity = severity;
      }
      // Guard against zero-width matches
      if (m[0].length === 0) re.lastIndex++;
    }
  }

  return {
    found: matches.length > 0,
    matches,
    severity: topSeverity,
  };
}

// Find the sentence span [start, end) containing position `pos` in `text`.
function sentenceSpan(text, pos) {
  let start = pos;
  while (start > 0) {
    const ch = text[start - 1];
    if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') break;
    start--;
  }
  while (start < text.length && /\s/.test(text[start])) start++;

  let end = pos;
  while (end < text.length) {
    const ch = text[end];
    end++;
    if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') break;
  }
  return [start, end];
}

// Find the clause span: from the most recent boundary before the match to the
// next sentence terminator after the match. Extends through any quoted body
// that opens inside the clause (e.g. state this upfront: 'I don't have ...').
function clauseSpan(text, matchStart, matchEnd) {
  let start = matchStart;
  while (start > 0) {
    const ch = text[start - 1];
    if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') break;
    start--;
  }
  while (start < text.length && /\s/.test(text[start])) start++;

  let end = matchEnd;
  while (end < text.length) {
    const ch = text[end];
    end++;
    if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') break;
  }

  const segment = text.slice(start, end);
  const quoteOpen = segment.search(/['"`‘“]/);
  if (quoteOpen !== -1) {
    const openCh = segment[quoteOpen];
    const closers = {
      "'": "'",
      '"': '"',
      '`': '`',
      '‘': '’',
      '“': '”',
    };
    const closer = closers[openCh] || openCh;
    const tail = text.indexOf(closer, start + quoteOpen + 1);
    if (tail !== -1 && tail >= end - 1) {
      end = tail + 1;
      while (end < text.length && /[.\s!?,;:]/.test(text[end])) {
        const ch = text[end];
        end++;
        if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') break;
      }
    }
  }

  return [start, end];
}

function collectSpans(text, aggressive) {
  const detection = detectSelfDefeat(text);
  if (!detection.found) return [];

  const spans = detection.matches.map((m) => {
    if (aggressive) {
      const [s, e] = sentenceSpan(text, m.index);
      return [s, e];
    }
    const [s, e] = clauseSpan(text, m.index, m.index + m.length);
    return [s, e];
  });

  spans.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const span of spans) {
    if (merged.length === 0) {
      merged.push(span.slice());
      continue;
    }
    const last = merged[merged.length - 1];
    if (span[0] <= last[1]) {
      last[1] = Math.max(last[1], span[1]);
    } else {
      merged.push(span.slice());
    }
  }
  return merged;
}

/**
 * Strip self-defeating clauses from a prompt.
 * @param {string} promptText
 * @param {{ aggressive?: boolean }} [options]
 * @returns {{ stripped: string, removed: string[], didStrip: boolean }}
 */
export function stripSelfDefeat(promptText, options = {}) {
  const text = safeString(promptText);
  if (!text) {
    return { stripped: '', removed: [], didStrip: false };
  }
  const aggressive = options.aggressive === true;
  const spans = collectSpans(text, aggressive);
  if (spans.length === 0) {
    return { stripped: text, removed: [], didStrip: false };
  }

  const removed = [];
  let out = '';
  let cursor = 0;
  for (const [s, e] of spans) {
    out += text.slice(cursor, s);
    removed.push(text.slice(s, e));
    cursor = e;
  }
  out += text.slice(cursor);

  // Tidy whitespace left by removal. Preserve newlines.
  out = out
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    stripped: out,
    removed,
    didStrip: removed.length > 0,
  };
}
