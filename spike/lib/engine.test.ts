// PromptDolphin — engine behavioral test suite
// Executes engineerV3 for real and asserts output invariants per wave.
// Run: npx tsx lib/engine.test.ts  (from spike/)

import { engineerV3 } from './engine-v3';
import { OUTPUT_FORMATS, QUALITY_AXIS_ORDER, ADAPTER_ORDER, OUTPUT_FORMAT_ORDER } from './engine-v2';

let pass = 0;
let fail = 0;
const failures: { name: string; error: string }[] = [];

function check(name: string, fn: () => void) {
  try { fn(); pass += 1; }
  catch (e) { fail += 1; failures.push({ name, error: (e as Error).message }); }
}
function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const TASK = 'Write a competitive analysis of the GLP-1 market for our board meeting next week';

// ---------------------------------------------------------------------------
// Wave 0 baseline: engine is deterministic + structurally sound
// ---------------------------------------------------------------------------

check('determinism: identical inputs → identical output', () => {
  const a = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html' });
  const b = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html' });
  assert(a.engineered === b.engineered, 'two runs differ');
});

check('task verbatim preserved in output', () => {
  const r = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html' });
  assert(r.engineered.includes(TASK), 'task missing verbatim');
});

check('user constraints preserved verbatim', () => {
  const c = 'Never mention competitor pricing';
  const r = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html', userConstraints: [c] });
  assert(r.engineered.includes(c), 'constraint dropped');
});

check('every adapter × every format renders non-empty and passes preflight', () => {
  for (const adapter of ADAPTER_ORDER) {
    for (const outputFormat of OUTPUT_FORMAT_ORDER) {
      const r = engineerV3(TASK, { adapter, quality: 'comprehensive', outputFormat });
      assert(r.engineered.length > 200, `${adapter}/${outputFormat}: too short (${r.engineered.length})`);
      assert(r.preflight.passed, `${adapter}/${outputFormat}: preflight failed: ${JSON.stringify(r.preflight.issues.filter(i => i.severity === 'high'))}`);
    }
  }
});

check('every quality level renders for html', () => {
  for (const quality of QUALITY_AXIS_ORDER) {
    const r = engineerV3(TASK, { adapter: 'chatgpt', quality, outputFormat: 'html' });
    assert(r.engineered.length > 200, `${quality}: too short`);
  }
});

// ---------------------------------------------------------------------------
// Wave 1: consistency discipline in HTML injection
// ---------------------------------------------------------------------------

check('W1: html injection contains design-token lock', () => {
  const inj = OUTPUT_FORMATS.html.injection;
  assert(/CONSISTENCY DISCIPLINE/.test(inj), 'no CONSISTENCY DISCIPLINE section');
  assert(/custom properties in :root/.test(inj), 'no :root token-lock instruction');
  assert(/Never improvise new colors/.test(inj), 'no anti-improvisation rule');
});

check('W1: html injection reaches engineered prompt', () => {
  const r = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html' });
  assert(r.engineered.includes('CONSISTENCY DISCIPLINE'), 'consistency block not in final prompt');
  assert(r.engineered.includes('contenteditable'), 'contenteditable instruction not in final prompt');
});

check('W1: html injection has no rigid pixel/hex micro-specs', () => {
  const inj = OUTPUT_FORMATS.html.injection;
  assert(!/\d+px/.test(inj), 'pixel values present');
  assert(!/#[0-9A-Fa-f]{6}/.test(inj), 'hex colors present');
});

// ---------------------------------------------------------------------------
// Wave 2: positive-framing rebalance of archetype exclusions
// ---------------------------------------------------------------------------

import { ARCHETYPES, ARCHETYPE_ORDER } from './engine-v2';

check('W2: rebalanced archetypes lead with positive instruction', () => {
  // hard-ban archetypes intentionally keep leading negatives
  const hardBanned = new Set(['pharma_regulatory', 'meta_prompt']);
  for (const id of ARCHETYPE_ORDER) {
    if (hardBanned.has(id)) continue;
    const excl = ARCHETYPES[id].exclusions;
    assert(!/^(No |Do NOT|Don't)/i.test(excl), `${id}: exclusions still lead with negation: "${excl.slice(0, 60)}"`);
  }
});

check('W2: load-bearing hard bans preserved', () => {
  assert(ARCHETYPES.pharma_regulatory.exclusions.includes('No superiority claims'), 'pharma hard ban gone');
  assert(ARCHETYPES.meta_prompt.exclusions.includes('Do NOT execute'), 'meta_prompt hard ban gone');
  assert(ARCHETYPES.biotech_investor.exclusions.includes('No undisclosed material information'), 'disclosure ban gone');
});

check('W2: functional constraints survived the rewrite', () => {
  assert(/250 words/.test(ARCHETYPES.executive_email.exclusions), 'email word cap gone');
  assert(/35 words/.test(ARCHETYPES.presentation_deck.exclusions), 'slide word cap gone');
  assert(/500 words/.test(ARCHETYPES.strategy_brief.exclusions), 'strategy word cap gone');
  assert(/owner and date/.test(ARCHETYPES.post_incident.exclusions), 'action-item rule gone');
});

// ---------------------------------------------------------------------------
// Wave 3: user style exemplar flows through exampleOverrides
// ---------------------------------------------------------------------------

check('W3: exampleOverrides replaces stock examples and appears verbatim', () => {
  const sample = 'STYLE/QUALITY EXEMPLAR — match the style, structure, and quality bar of this sample (do not copy its content):\nDear team, Q3 shipped on time.';
  const r = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html', exampleOverrides: [sample] });
  assert(r.engineered.includes(sample), 'user exemplar not in final prompt');
  // stock examples should be displaced
  const stock = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html' });
  assert(stock.engineered !== r.engineered, 'exemplar had no effect');
});

// ---------------------------------------------------------------------------
// Wave 4: JSON schema-first + native structured output
// ---------------------------------------------------------------------------

check('W4: json injection asks for schema design + native structured output', () => {
  const inj = OUTPUT_FORMATS.json.injection;
  assert(/silently design a JSON schema/.test(inj), 'no schema-first instruction');
  assert(/json_schema/.test(inj), 'no native structured-output hint');
  const r = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'json' });
  assert(r.engineered.includes('json_schema'), 'json hint not in final prompt');
});

// ---------------------------------------------------------------------------
// Wave 5: clarify-first on low classification confidence
// ---------------------------------------------------------------------------

check('W5: low-confidence task gets clarify-first directive', () => {
  const vague = 'help me with the thing for tomorrow';
  const r = engineerV3(vague, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'text' });
  assert(r.classification.confidence === 'low', `expected low confidence, got ${r.classification.confidence}`);
  assert(r.engineered.includes('ask up to 3 clarifying questions'), 'clarify-first directive missing');
});

check('W5: high-confidence task gets NO clarify-first directive', () => {
  const clear = 'Write an email to my VP asking to delay the Q3 launch by two weeks';
  const r = engineerV3(clear, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'text' });
  assert(r.classification.confidence !== 'low', `expected non-low confidence, got ${r.classification.confidence}`);
  assert(!r.engineered.includes('ask up to 3 clarifying questions'), 'clarify-first leaked into confident task');
});

// ---------------------------------------------------------------------------
// Wave 6: output priming per format
// ---------------------------------------------------------------------------

check('W6: html/json/csv/email/markdown get opener priming', () => {
  const expectations: Array<[string, string]> = [
    ['html', '<!doctype html>'],
    ['json', 'Begin your response with `{`'],
    ['csv', 'CSV header row as the very first line'],
    ['email', 'Begin your response with `Subject:`'],
    ['markdown', '`#` title as the very first line'],
  ];
  for (const [fmtId, needle] of expectations) {
    const r = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: fmtId as never });
    assert(r.engineered.includes(needle), `${fmtId}: opener priming missing`);
  }
  const plain = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'text' });
  assert(!plain.engineered.includes('no preamble before it'), 'text format should have no opener priming');
});

// ---------------------------------------------------------------------------
// Wave 7: native reasoning-effort mapping
// ---------------------------------------------------------------------------

check('W7: deep quality levels get adapter-native reasoning cue', () => {
  const claude = engineerV3(TASK, { adapter: 'claude', quality: 'exhaustive_research', outputFormat: 'html' });
  assert(claude.engineered.includes('extended thinking'), 'claude native cue missing');
  const chatgpt = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html' });
  assert(chatgpt.engineered.includes('reasoning model') || chatgpt.engineered.includes('think longer'), 'chatgpt native cue missing');
  const copilot = engineerV3(TASK, { adapter: 'copilot', quality: 'strategic_depth', outputFormat: 'html' });
  assert(copilot.engineered.includes('Think Deeper'), 'copilot native cue missing');
});

check('W7: quick_verdict suppresses deep reasoning', () => {
  const r = engineerV3(TASK, { adapter: 'chatgpt', quality: 'quick_verdict', outputFormat: 'text' });
  assert(r.engineered.includes('does not need deep reasoning'), 'quick_verdict fast-path missing');
  assert(!r.engineered.includes('If extended thinking is available'), 'claude deep cue leaked into quick_verdict');
  assert(!r.engineered.includes('use it with high reasoning effort'), 'chatgpt deep cue leaked into quick_verdict');
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log(`\nengine.test: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  FAIL ${f.name}\n       ${f.error}`);
  process.exit(1);
}
