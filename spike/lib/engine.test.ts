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
  assert(/Never improvise a new color/.test(inj), 'no anti-improvisation rule');
});

check('W1: html injection reaches engineered prompt', () => {
  const r = engineerV3(TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html' });
  assert(r.engineered.includes('CONSISTENCY DISCIPLINE'), 'consistency block not in final prompt');
  assert(r.engineered.includes('contenteditable'), 'contenteditable instruction not in final prompt');
});

check('W1: html injection is token-driven (prose specifies intent, not rigid values)', () => {
  const inj = OUTPUT_FORMATS.html.injection;
  // The PROSE drives design via tokens (the real anti-improvisation guarantee).
  // Concrete px/hex now legitimately live ONLY inside the fenced worked exemplar,
  // which teaches technique by example — that is the intended high-leverage change.
  assert(/--c-1/.test(inj), 'no chart-ramp tokens declared');
  assert(/var\(--/.test(inj), 'charts not instructed to reference tokens');
  assert(/STYLE REFERENCE/.test(inj), 'worked exemplar missing — px/hex must live inside it, not the prose');
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
// Harness: agent workflow + loop builders (lib/harness.ts)
// ---------------------------------------------------------------------------

import { buildAgentWorkflow, buildLoopPrompt, HARNESS_LABELS } from './harness';
import { ARCHETYPE_ORDER } from './engine-v2';
import { TRANSLATIONS } from './i18n';

const HARNESS_TASK = 'Assess the GLP-1 biotech catalysts for our investment committee';
const eng = engineerV3(HARNESS_TASK, { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'html' }).engineered;

check('HARNESS: agent workflow embeds the engineered prompt verbatim', () => {
  const wf = buildAgentWorkflow(eng, { archetype: 'biotech_investor', outputFormat: 'html' });
  assert(wf.includes(eng.trim()), 'engineered prompt not embedded as shared task');
  assert(/AGENT WORKFLOW/.test(wf), 'no AGENT WORKFLOW header');
});

check('HARNESS: agent workflow is total over ALL archetypes (no crash, non-trivial)', () => {
  for (const id of ARCHETYPE_ORDER) {
    const wf = buildAgentWorkflow(eng, { archetype: id, outputFormat: 'html' });
    assert(wf.length > 400, `${id}: workflow too short (${wf.length})`);
    assert(/AGENT \d+ —/.test(wf), `${id}: no agent cards rendered`);
    assert(/ORCHESTRATION/.test(wf), `${id}: no orchestration section`);
  }
});

check('HARNESS: domain archetypes get bespoke chains (not the default)', () => {
  const trading = buildAgentWorkflow(eng, { archetype: 'trading_system', outputFormat: 'text' });
  assert(/Kill-switch|Backtest|Signal Designer/.test(trading), 'trading_system did not get its bespoke chain');
  const dd = buildAgentWorkflow(eng, { archetype: 'due_diligence', outputFormat: 'text' });
  assert(/Bear-case|Evidence Gatherer|deal thesis/i.test(dd), 'due_diligence did not get its bespoke chain');
});

check('HARNESS: default chain covers a generic archetype', () => {
  const wf = buildAgentWorkflow(eng, { archetype: 'general', outputFormat: 'text' });
  assert(/Planner/.test(wf) && /Editor/.test(wf), 'default chain missing Planner/Editor');
});

check('HARNESS: agent workflow gives a way to run it (orchestrator + chat)', () => {
  const wf = buildAgentWorkflow(eng, { archetype: 'biotech_investor', outputFormat: 'html' });
  assert(/n8n|LangGraph|sub-agents/i.test(wf), 'no orchestrator run instructions');
  assert(/paste this whole block/i.test(wf), 'no single-chat run instructions');
});

check('HARNESS: loop builder wraps the prompt + states bounded rounds', () => {
  const lp = buildLoopPrompt(eng, { archetype: 'biotech_investor', outputFormat: 'html' });
  assert(lp.includes(eng), 'loop did not embed the engineered brief');
  assert(/IMPROVE-AND-RECHECK LOOP/.test(lp), 'no loop header');
  assert(/Score trail/.test(lp), 'no score-trail instruction');
});

check('HARNESS: labels exist for both kinds and are jargon-free', () => {
  assert(HARNESS_LABELS.loop && HARNESS_LABELS.agent, 'missing harness labels');
  for (const v of Object.values(HARNESS_LABELS)) {
    assert(!/xml|few-shot|chain-of-thought|prefill|L99/i.test(v), `jargon in harness label: ${v}`);
  }
});

check('HARNESS: workflow WRAPPER carries no prompt-engineering jargon', () => {
  // Scope to the harness's own added scaffolding (clean embedded brief) — the
  // user's engineered prompt is a separate, already-jargon-guarded concern.
  const wf = buildAgentWorkflow('PLAIN BRIEF BODY — no jargon here.', { archetype: 'pharma_regulatory', outputFormat: 'word' });
  assert(!/few-shot|chain-of-thought|xml tag|prefill|\bL99\b/i.test(wf), 'jargon leaked into workflow wrapper');
});

// ---------------------------------------------------------------------------
// HTML injection — visualization playbook contract (engine-v2.ts)
// ---------------------------------------------------------------------------

check('HTML-VIZ: injection mandates visualization + delivery floor', () => {
  const inj = OUTPUT_FORMATS.html.injection;
  assert(/DATA VISUALIZATION|VISUALIZE/.test(inj), 'no visualization mandate');
  assert(/DELIVERY FLOOR/.test(inj), 'no delivery floor');
  assert(inj.includes('<!DOCTYPE html>'), 'no DOCTYPE in constraints');
});

check('HTML-VIZ: fenced few-shot exemplar present + technique markers', () => {
  const inj = OUTPUT_FORMATS.html.injection;
  assert(/STYLE REFERENCE/.test(inj), 'no fenced style reference');
  assert(/your charts must use ONLY the user's data/i.test(inj), 'no anti-echo guard');
  assert(/viewBox/.test(inj), 'no viewBox technique marker');
  assert(/points=/.test(inj), 'no polyline points marker');
  assert(/stroke-dasharray/.test(inj), 'no donut dasharray technique');
});

check('HTML-VIZ: dark-mode re-declares the chart accent token', () => {
  const inj = OUTPUT_FORMATS.html.injection;
  assert(/prefers-color-scheme:?\s*dark/.test(inj), 'no dark-mode block');
  // --c-1 declared in :root AND re-declared in the dark block = >= 2 occurrences
  assert((inj.match(/--c-1:/g) || []).length >= 2, 'chart accent not re-declared for dark mode');
});

check('HTML-VIZ: revision must-fixes present (numeric consistency, one-scale, hex text fills, conditional editable, KPI discipline)', () => {
  const inj = OUTPUT_FORMATS.html.injection;
  assert(/NUMERIC CONSISTENCY/.test(inj), 'prose-number consistency rule missing');
  assert(/ONE SCALE PER CHART/.test(inj), 'single-scale axis rule missing');
  assert(/never fill="#fff"/.test(inj), 'hardcoded text-fill ban missing');
  assert(/OMIT contenteditable|UNLESS the document is a formal or confidential/.test(inj), 'conditional contenteditable missing');
  assert(/DISTINCT figure with genuine information value/.test(inj), 'KPI-card discipline missing');
});

check('HTML-VIZ: retained hard constraints survive', () => {
  const inj = OUTPUT_FORMATS.html.injection;
  assert(/contenteditable/.test(inj), 'editable instruction dropped');
  assert(/Output ONLY the HTML/.test(inj), 'output-only rule dropped');
  assert(/NO JavaScript/i.test(inj), 'no-JS rule dropped');
  assert(/DO NOT FABRICATE|never invent|use ONLY the user/i.test(inj), 'anti-fabrication dropped');
});

// ---------------------------------------------------------------------------
// Guards: new i18n keys are jargon-free and emoji-free (charter ban #2)
// ---------------------------------------------------------------------------

check('GUARD: new harness i18n keys are emoji-free + jargon-free', () => {
  const newKeys = ['powerups_heading', 'loop_button', 'workflow_button', 'harness_copy', 'harness_copied', 'harness_close'];
  for (const k of newKeys) {
    const v = (TRANSLATIONS.en as Record<string, string>)[k];
    assert(v && v.length > 0, `missing en value for ${k}`);
    assert(!/\p{Extended_Pictographic}/u.test(v), `emoji in new UI string ${k}: ${v}`);
    assert(!/xml|few-shot|chain-of-thought|prompt engineering|context window|L99/i.test(v), `jargon in ${k}: ${v}`);
  }
});

// ---------------------------------------------------------------------------
// DATA_VIZ_DIRECTIVE — chart mandate extended to document-class formats
// ---------------------------------------------------------------------------

const VIZ_MARK = 'DATA VISUALIZATION (this is a data-bearing deliverable';

check('VIZ-DIR: data-bearing archetype + doc format gets the chart mandate', () => {
  for (const [arch, fmt] of [['data_analysis', 'word'], ['biotech_investor', 'powerpoint'], ['due_diligence', 'pdf_1pager'], ['trading_system', 'research_report']] as const) {
    const r = engineerV3('Analyze the numbers and report', { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: fmt, archetype: arch });
    assert(r.engineered.includes(VIZ_MARK), `${arch}/${fmt}: viz directive missing`);
    assert(/AT LEAST 3 DIFFERENT chart types/.test(r.engineered), `${arch}/${fmt}: variety rule missing`);
  }
});

check('VIZ-DIR: non-data archetype does NOT get the directive', () => {
  const r = engineerV3('Write a note to my VP', { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'word', archetype: 'executive_email' });
  assert(!r.engineered.includes(VIZ_MARK), 'viz directive leaked into a non-data archetype');
});

check('VIZ-DIR: data-only formats (csv/json) are excluded', () => {
  for (const fmt of ['csv', 'json'] as const) {
    const r = engineerV3('Analyze the numbers', { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: fmt, archetype: 'data_analysis' });
    assert(!r.engineered.includes(VIZ_MARK), `${fmt}: viz directive should not apply to data-only formats`);
  }
});

check('VIZ-DIR: directive never invents data (anti-fabrication present)', () => {
  const r = engineerV3('Analyze the numbers and report', { adapter: 'chatgpt', quality: 'comprehensive', outputFormat: 'word', archetype: 'data_analysis' });
  assert(/Never invent values to fill a chart|directly derivable/.test(r.engineered), 'viz directive missing anti-fabrication');
});

// ---------------------------------------------------------------------------
// Wave 8: claim-integrity wave (L99 panel 2026-07-12)
// ---------------------------------------------------------------------------

import { ENGINE_VERSION } from './engine-v3';
import { QUALITY_AXIS_ORDER } from './engine-v2';

check('W8: ENGINE_VERSION is the single 3.x source of truth', () => {
  assert(/^3\.\d+\.\d+$/.test(ENGINE_VERSION), `unexpected ENGINE_VERSION: ${ENGINE_VERSION}`);
});

check('W8: every depth tier has i18n label + blurb (all 5 shown in UI)', () => {
  const keyMap: Record<string, [string, string]> = {
    quick_verdict: ['q_quick_label', 'q_quick_blurb'],
    fast_detailed: ['q_fast_label', 'q_fast_blurb'],
    comprehensive: ['q_comp_label', 'q_comp_blurb'],
    strategic_depth: ['q_strat_label', 'q_strat_blurb'],
    exhaustive_research: ['q_exh_label', 'q_exh_blurb'],
  };
  assert(QUALITY_AXIS_ORDER.length === 5, `expected 5 tiers, got ${QUALITY_AXIS_ORDER.length}`);
  for (const qid of QUALITY_AXIS_ORDER) {
    const pair = keyMap[qid];
    assert(pair, `no i18n key mapping for tier ${qid}`);
    for (const k of pair) {
      const v = (TRANSLATIONS.en as Record<string, string>)[k];
      assert(v && v.length > 0, `missing en value for ${k} (tier ${qid})`);
    }
  }
});

check('W8: voice privacy note exists and is honest about Chrome/Google', () => {
  const v = (TRANSLATIONS.en as Record<string, string>)['voice_privacy_note'];
  assert(v && v.length > 0, 'voice_privacy_note missing');
  assert(/Google/.test(v), 'note must name where Chrome sends audio');
  assert(/Typing never leaves/.test(v), 'note must reaffirm the typing guarantee');
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log(`\nengine.test: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  FAIL ${f.name}\n       ${f.error}`);
  process.exit(1);
}
