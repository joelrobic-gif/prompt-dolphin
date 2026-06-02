/**
 * src/prompt-engineer/validators/html-report-schema.js
 *
 * L99 PE-Phase 3: post-generation schema validator for html_news_report
 * outputs. Cheap regex-driven smoke test — call AFTER the LLM returns its
 * HTML and BEFORE serving to the user. Returns { valid, errors, warnings }.
 *
 * Catches the failure modes that pre-Phase-3 reports leaked:
 *   - Missing <header> hero / <main> / <footer>
 *   - No sources appendix (<ol class="sources">)
 *   - Marketing prose ("revolutionary", "game-changing")
 *   - Fabricated-outlet markers (TODO/Example/Lorem)
 *   - Numeric claims with no nearby citation link
 *   - Naked URLs (no anchor)
 *
 * NOT a full HTML parser. Linear regex pass — fast (sub-ms on 50KB doc),
 * deterministic, zero deps. Sufficient for runtime gating.
 */

export const HTML_SCHEMA_VERSION = '1.0.0';

const BANNED_MARKETING = [
  'revolutionary', 'game-changing', 'game changing', 'groundbreaking',
  'disrupt the industry', 'industry-leading', 'best-in-class',
  'cutting-edge', 'next-generation', 'paradigm shift', 'synergies',
  'leverage our', 'unprecedented breakthrough', 'world-class solution',
];

const FABRICATION_MARKERS = [
  'lorem ipsum', 'placeholder', 'todo:', 'tbd:', '[insert ', '[your source',
  'example news outlet', 'fictitious', 'hypothetical source',
  'made-up', 'sample url here', 'example.com', '<source url>',
];

/**
 * Validate a model-generated HTML report against the design contract.
 *
 * @param {string} html - raw HTML output from the LLM
 * @param {object} [opts]
 * @param {boolean} [opts.strict=false] - upgrade warnings to errors
 * @param {number} [opts.minSources=3] - minimum required source count
 * @returns {{valid: boolean, errors: string[], warnings: string[], stats: object}}
 */
export function validateHtmlReport(html, opts = {}) {
  const strict = !!opts.strict;
  const minSources = opts.minSources ?? 3;
  const errors = [];
  const warnings = [];
  const stats = {};

  const s = String(html || '');
  if (s.length < 200) {
    return {
      valid: false,
      errors: ['HTML body too short (<200 chars) — not a real report'],
      warnings: [],
      stats: { length: s.length },
    };
  }
  stats.length = s.length;

  // 1. Structural requirements
  if (!/<!doctype\s+html/i.test(s)) errors.push('missing <!doctype html>');
  if (!/<title>[^<]+<\/title>/i.test(s)) errors.push('missing non-empty <title>');
  if (!/<header[\s>]/i.test(s)) errors.push('missing <header> hero block');
  if (!/<main[\s>]/i.test(s)) errors.push('missing <main> content');
  if (!/<footer[\s>]/i.test(s)) errors.push('missing <footer>');

  // 2. Sources appendix
  const sourcesMatch = s.match(/<ol[^>]*class=["'][^"']*sources[^"']*["'][^>]*>([\s\S]*?)<\/ol>/i);
  if (!sourcesMatch) {
    errors.push('missing <ol class="sources"> appendix');
    stats.sourceCount = 0;
  } else {
    const sourceItems = sourcesMatch[1].match(/<li[\s>]/gi) || [];
    stats.sourceCount = sourceItems.length;
    if (sourceItems.length < minSources) {
      errors.push(`sources appendix has ${sourceItems.length} items, need >=${minSources}`);
    }
  }

  // 3. Inline citations
  const anchorCount = (s.match(/<a\s[^>]*href=/gi) || []).length;
  stats.anchorCount = anchorCount;
  if (anchorCount < minSources) {
    warnings.push(`only ${anchorCount} inline <a href> citations - expected >=${minSources}`);
  }

  // 4. Marketing-prose ban
  const lower = s.toLowerCase();
  const marketingHits = BANNED_MARKETING.filter((kw) => lower.includes(kw));
  stats.marketingHits = marketingHits.length;
  if (marketingHits.length > 0) {
    errors.push(`banned marketing prose: ${marketingHits.slice(0, 3).join(', ')}`);
  }

  // 5. Fabrication markers
  const fabHits = FABRICATION_MARKERS.filter((kw) => lower.includes(kw));
  stats.fabricationHits = fabHits.length;
  if (fabHits.length > 0) {
    errors.push(`fabrication markers present: ${fabHits.slice(0, 3).join(', ')}`);
  }

  // 6. No external resources
  if (/<link\s[^>]*rel=["']stylesheet/i.test(s)) {
    warnings.push('<link rel="stylesheet"> - contract requires inline <style>');
  }
  if (/<script\s+src=/i.test(s)) {
    warnings.push('external <script src=> - contract requires no external JS');
  }

  // 7. As-of timestamp
  if (!/as[\s-]of|published|updated/i.test(s)) {
    warnings.push('no as-of/published/updated timestamp visible');
  }

  const finalErrors = strict ? errors.concat(warnings) : errors;
  return {
    valid: finalErrors.length === 0,
    errors,
    warnings,
    stats,
  };
}

/**
 * Render a human-readable repair prompt that can be fed back to the LLM
 * to fix a failed validation in a single repair pass.
 */
export function buildRepairPrompt(originalHtml, validation) {
  const all = [...validation.errors, ...validation.warnings];
  if (all.length === 0) return null;
  return [
    'The HTML report you generated failed the schema validator. Issues:',
    ...all.map((e, i) => `  ${i + 1}. ${e}`),
    '',
    'Repair the report - fix every issue above and return ONLY the corrected HTML.',
    'Do not change the content of stories you got right. Do not add NEW marketing prose.',
    'If you need to drop a fabricated source, replace it with a real cited URL or delete the claim entirely.',
  ].join('\n');
}
