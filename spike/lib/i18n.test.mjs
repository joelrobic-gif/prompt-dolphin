// PromptDolphin — i18n coverage test
// Verifies every language has every key + non-empty values + no ${} template leaks.
// Run: node lib/i18n.test.mjs  (from spike/)

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('./i18n.ts', import.meta.url), 'utf8');

// Extract LangIds from the type union
const langIdMatch = src.match(/export type LangId =\s*([^;]+);/);
const langIds = (langIdMatch?.[1] ?? '')
  .replace(/\|/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .map((s) => s.replace(/^['"]|['"]$/g, ''))
  .filter((s) => /^[a-z]{2}(-[A-Z]{2})?$/.test(s));

// Extract TranslationKeys
const keyMatch = src.match(/export type TranslationKey =\s*([^;]+);/s);
const keys = (keyMatch?.[1] ?? '')
  .replace(/\|/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .map((s) => s.replace(/^['"]|['"]$/g, ''))
  .filter((s) => /^[a-z_]+$/.test(s));

// Type annotation is intentionally loose-matched: `en` is Required<...> and the
// other locales are Partial<...> (untranslated keys fall through to en at runtime),
// so the signature is no longer a single `Record<LangId, Record<...>>`.
const TRANS_BLOCK_REGEX = /TRANSLATIONS:[\s\S]*?=\s*\{([\s\S]+?)\};\s*\n\s*export function t\(/;
const transBlock = src.match(TRANS_BLOCK_REGEX)?.[1] ?? '';

let pass = 0;
let fail = 0;
const failures = [];

function check(name, fn) {
  try { fn(); pass += 1; }
  catch (e) { fail += 1; failures.push({ name, error: e.message }); }
}

check('14 LangIds parsed', () => {
  assert.equal(langIds.length, 14, `got ${langIds.length}: ${langIds.join(',')}`);
});

check('55+ keys parsed', () => {
  assert.ok(keys.length >= 55, `got ${keys.length}`);
});

check('TRANSLATIONS block extracted', () => {
  assert.ok(transBlock.length > 5000, `transBlock length: ${transBlock.length}`);
});

for (const lang of langIds) {
  const langKey = lang.includes('-') ? `'${lang}'` : lang;
  const escaped = langKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const langBlockRegex = new RegExp(`(?:^|\\n)\\s*${escaped}:\\s*\\{([\\s\\S]+?)\\n\\s*\\},`, 'm');
  const langBlock = transBlock.match(langBlockRegex)?.[1];

  check(`${lang}: block exists`, () => {
    assert.ok(langBlock, `block not found for ${lang}`);
  });

  if (!langBlock) continue;

  for (const key of keys) {
    check(`${lang} / ${key}: present`, () => {
      const keyRegex = new RegExp(`\\b${key}\\s*:\\s*['"]`);
      assert.match(langBlock, keyRegex, `key ${key} missing in ${lang}`);
    });

    check(`${lang} / ${key}: non-empty`, () => {
      const m = langBlock.match(new RegExp(`\\b${key}\\s*:\\s*'([^']*(?:\\\\'[^']*)*)'`));
      if (m) assert.ok(m[1].length > 0, `${key} empty in ${lang}`);
    });
  }

  check(`${lang}: no \${} template leaks`, () => {
    assert.doesNotMatch(langBlock, /\$\{/, `${lang} contains $\{}`);
  });
}

console.log(`\n${pass} passed, ${fail} failed (${langIds.length} langs x ${keys.length} keys)`);
if (fail > 0) {
  console.log('\nFailures:');
  for (const f of failures.slice(0, 30)) {
    console.log(`  - ${f.name}: ${f.error}`);
  }
  process.exit(1);
}
