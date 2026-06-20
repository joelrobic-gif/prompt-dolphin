// PromptDolphin — harness builders. Deterministic string assembly over an
// already-engineered prompt. NO LLM call, NO network, NO new deps. Pure functions.
// Shared by the "Create loop" (WS3) and "Create agent workflow" (WS4) buttons.
// MIT License — Robic Direct Inc.
//
// Plain English only — no prompt-engineering jargon surfaced to the user.

import {
  ARCHETYPES,
  OUTPUT_FORMATS,
  type ArchetypeId,
  type OutputFormatId,
} from './engine-v2';

// ── Shared panel surface ─────────────────────────────────────────────────────
export type HarnessKind = 'loop' | 'agent';

export const HARNESS_LABELS: Record<HarnessKind, string> = {
  loop: 'Improve-and-recheck loop',
  agent: 'Agent workflow',
};

// Exactly the fields the builders consume.
export interface HarnessContext {
  archetype: ArchetypeId;
  outputFormat: OutputFormatId;
}

// ── Small deterministic helpers ──────────────────────────────────────────────
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Math.round(Number.isFinite(n) ? n : lo)));

function ruleLine(ch = '─', n = 60): string {
  return ch.repeat(n);
}

// Plain-English name for what the user is producing — from the output format.
function deliverableNoun(fmt: OutputFormatId): string {
  const map: Partial<Record<OutputFormatId, string>> = {
    html: 'web page', word: 'document', powerpoint: 'slide deck',
    excel: 'spreadsheet', csv: 'data table', json: 'data file',
    pdf_1pager: 'one-page brief', research_report: 'report',
    power_bi: 'dashboard', email: 'email', markdown: 'document', text: 'answer',
  };
  return map[fmt] || 'deliverable';
}

// ============================================================================
// LOOP HARNESS (WS3) — "improve-and-recheck loop"
// ============================================================================

export interface LoopOptions {
  archetype: ArchetypeId;
  outputFormat: OutputFormatId;
  /** Max improve-and-recheck rounds. Clamped 2..6. Default 3. */
  iterations?: number;
  /** Stop early once the self-score reaches this (0..10). Clamped 5..10. Default 9. */
  threshold?: number;
}

/**
 * Split a critique string of one or more questions into individual checkable
 * points. Lookbehind-free (portable across every JS target and the tsx test
 * runner): keep the terminator by splitting on a captured group, then re-attach.
 */
function splitIntoPoints(critique: string): string[] {
  const parts = critique.split(/([?.])\s+/); // ["Is x", "?", "Is y", ".", "Last"]
  const out: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const body = (parts[i] || '').trim();
    const term = parts[i + 1] || '';
    if (body) out.push((body + term).trim());
  }
  return out;
}

/**
 * Derive a compact, plain-English rubric from the archetype's critique line and
 * the chosen output format. Deterministic. Always returns at least 2 lines.
 */
function buildRubric(archetype: ArchetypeId, outputFormat: OutputFormatId): string[] {
  const lines: string[] = [];

  // 1. Archetype quality bar — split the critique question(s) into checkable points.
  const arch = ARCHETYPES[archetype] ?? ARCHETYPES.general;
  for (const p of splitIntoPoints(arch.critique)) lines.push(p);

  // 2. Format-fit check — only when a real format was chosen ('text' has empty injection).
  const fmt = OUTPUT_FORMATS[outputFormat];
  if (fmt && fmt.injection && fmt.injection.trim()) {
    lines.push(`Does the output fully follow the requested ${fmt.label} format and structure?`);
  }

  // 3. Universal floor — applies to every task (guarantees >= 2 rubric lines).
  lines.push('Is every claim specific, accurate, and free of filler or padding?');
  lines.push('Did it do exactly what was asked — nothing missing, nothing extra?');

  // De-dupe (critique lines occasionally overlap the floor) and cap at 6.
  const seen = new Set<string>();
  const deduped = lines.filter((l) => {
    const k = l.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return deduped.slice(0, 6);
}

/**
 * Build the paste-ready improve-and-recheck loop wrapper around an engineered
 * prompt. Deterministic string assembly only.
 */
export function buildLoopPrompt(engineered: string, opts: LoopOptions): string {
  const iterations = clamp(opts.iterations ?? 3, 2, 6);
  const threshold = clamp(opts.threshold ?? 9, 5, 10);
  const rubric = buildRubric(opts.archetype, opts.outputFormat);
  const rubricBlock = rubric.map((r, i) => `  ${i + 1}. ${r}`).join('\n');

  return `IMPROVE-AND-RECHECK LOOP
You will not answer in a single pass. You will draft, grade your own draft, fix its biggest weaknesses, and repeat until it is genuinely strong. Run this entire loop silently and show me only the finished result.

HOW TO SCORE EACH DRAFT (rate 0 to 10, where 10 is excellent):
${rubricBlock}
Average these into one overall score out of 10.

THE LOOP:
1. DRAFT. Produce a first version by following the full instructions in the brief below.
2. SCORE. Rate that draft 0-10 using the checklist above. Be a harsh grader — most first drafts are a 6 or 7.
3. CRITIQUE. In one short paragraph, name the THREE biggest weaknesses holding the score down.
4. REVISE. Write a new, better version that fixes all three. Keep what already worked.
5. REPEAT steps 2-4 until the score reaches ${threshold}/10 OR you have completed ${iterations} rounds — whichever comes first.

WHAT TO SHOW ME:
- Show ONLY the final, best version. Do not show the earlier drafts, the scores, or the critiques.
- After the final version, add ONE line exactly like this: "Score trail: 7 -> 8 -> ${threshold} (N rounds)" with your real scores.
- Nothing else.

OPTIONAL — running this automatically: to run this as a true repeating loop instead of a single paste, drop the brief below into any tool that re-runs prompts (for example Claude Code's /loop command, an n8n or Make scenario, or a short script) and stop when the score line reaches ${threshold}.

==================== THE BRIEF (this is what you draft, score, and improve) ====================

${engineered}`;
}

// ============================================================================
// AGENT WORKFLOW (WS4) — decompose into a tailored team of specialist agents
// ============================================================================

interface AgentDef {
  name: string;        // e.g. "Planner"
  goal: string;        // one line
  system: string;      // mini instruction set, plain English
  input: string;       // what it receives
  artifact: string;    // named handoff it produces, e.g. "plan"
}

// The default chain — sensible for most knowledge-work tasks.
function defaultChain(): AgentDef[] {
  return [
    { name: 'Planner', goal: 'Break the task into a short ordered checklist.',
      system: 'You are a planner. Read the task and produce a 4-8 step checklist that, if followed, fully completes it. Note what information is missing. Do not do the work yet.',
      input: 'The original task.', artifact: 'plan' },
    { name: 'Researcher', goal: 'Gather every fact the task needs and note where each came from.',
      system: 'You are a researcher. Work through the plan and collect the facts, figures, and sources each step needs. Mark anything you could not verify as an open question. Never invent a source.',
      input: 'The task plus the plan.', artifact: 'findings' },
    { name: 'Analyst', goal: 'Turn the raw findings into the key points that matter.',
      system: 'You are an analyst. Read the findings and decide what actually matters for the task. Rank the points, flag contradictions, and state how confident you are in each.',
      input: 'The plan plus the findings.', artifact: 'analysis' },
    { name: 'Drafter', goal: 'Write the first full version of the deliverable.',
      system: 'You are the drafter. Using the analysis, produce a complete first version of exactly what the task asks for, in the requested format. Cover every checklist item.',
      input: 'The plan, findings, and analysis.', artifact: 'draft' },
    { name: 'Critic', goal: 'Challenge the draft and list its weakest points.',
      system: 'You are a tough reviewer. Find the three to five weakest or riskiest parts of the draft — unsupported claims, gaps, wrong tone, anything a sharp reader would catch. List each as a specific fix.',
      input: 'The task plus the draft.', artifact: 'critique' },
    { name: 'Editor', goal: 'Apply the fixes and produce the final, clean deliverable.',
      system: 'You are the final editor. Apply every fix from the critique, polish the language, and output the finished deliverable in the requested format. Nothing else.',
      input: 'The draft plus the critique.', artifact: 'final' },
  ];
}

// Per-archetype chain overrides. Only archetypes whose work genuinely needs a
// different team are listed; everything else uses defaultChain().
const CHAIN_OVERRIDES: Partial<Record<ArchetypeId, () => AgentDef[]>> = {
  trading_system: () => [
    { name: 'Strategy Architect', goal: 'State the trading idea as a precise, testable thesis.',
      system: 'You are a systematic-strategy architect. Restate the idea as a clear thesis: what edge, why it should exist, and under what market conditions. No profit claims yet.',
      input: 'The original task.', artifact: 'thesis' },
    { name: 'Data & Universe', goal: 'Define exactly what to trade and what data feeds it.',
      system: 'You define the tradable universe and the data sources behind every signal. Name the instruments, the data needed, its frequency, and any gaps or licensing issues.',
      input: 'The task plus the thesis.', artifact: 'universe' },
    { name: 'Signal Designer', goal: 'Specify the entry, exit, and position-sizing rules.',
      system: 'You design the rules. Write the entry signal, the exit signal, and how position size is set — precise enough that two people would code it the same way.',
      input: 'The thesis plus the universe.', artifact: 'signals' },
    { name: 'Risk & Kill-switch', goal: 'Add the controls that stop the strategy losing too much.',
      system: 'You own risk. Add portfolio limits, per-trade stops, drawdown limits, and a clear kill-switch condition. State what is monitored and how often.',
      input: 'The signal rules.', artifact: 'risk' },
    { name: 'Backtest Designer', goal: 'Specify how to test it honestly before risking money.',
      system: 'You design the backtest. Define the test window, costs and slippage assumptions, and the success bar. Name the overfitting traps and how the test avoids them.',
      input: 'The signals plus the risk controls.', artifact: 'backtest' },
    { name: 'Compliance Critic', goal: 'Challenge the whole system for regulatory, tax, and failure-mode risk.',
      system: 'You are a skeptical reviewer. List the regulatory and tax exposure, the failure modes, and every place a performance claim is not yet backed by the backtest design.',
      input: 'The full system so far.', artifact: 'critique' },
    { name: 'Editor', goal: 'Assemble the final specification.',
      system: 'You are the final editor. Fold in the critic\'s fixes and output one clean, complete strategy specification in the requested format.',
      input: 'Everything above.', artifact: 'final' },
  ],
  system_design: () => [
    { name: 'Problem Framer', goal: 'Pin down the problem, goals, and non-goals.',
      system: 'You frame the problem. State what is being built, the goals, the explicit non-goals, and the hard constraints. Resolve vagueness into specifics.',
      input: 'The original task.', artifact: 'frame' },
    { name: 'Architect', goal: 'Propose at least two viable architectures.',
      system: 'You are a principal architect. Propose two or more real architectures that satisfy the frame. For each, sketch the components and how data flows.',
      input: 'The task plus the frame.', artifact: 'options' },
    { name: 'Trade-off Analyst', goal: 'Score the options and pick one.',
      system: 'You score the options on cost, complexity, scaling, and operational burden. Pick one and explain why the others lose.',
      input: 'The candidate architectures.', artifact: 'decision' },
    { name: 'Design Drafter', goal: 'Write the full design document.',
      system: 'You write the design doc for the chosen architecture: components, data flow, failure modes, observability, and rollout plan.',
      input: 'The frame plus the decision.', artifact: 'draft' },
    { name: 'Stress Tester', goal: 'Try to break the design.',
      system: 'You are a tough reviewer. Find the specific weak points a senior engineer would fail the design on, and list each as a concrete fix.',
      input: 'The task plus the draft.', artifact: 'critique' },
    { name: 'Editor', goal: 'Produce the final design document.',
      system: 'You apply every fix and output the finished design document in the requested format.',
      input: 'The draft plus the critique.', artifact: 'final' },
  ],
  pharma_regulatory: () => [
    { name: 'Pathway Mapper', goal: 'Identify the agency and regulatory pathway.',
      system: 'You map the request to the right agency and pathway. State the pathway, what it requires, and the standard the reviewer will apply.',
      input: 'The original task.', artifact: 'pathway' },
    { name: 'Requirements Researcher', goal: 'List every required element and data package.',
      system: 'You list every requirement for this pathway and the data package needed. Mark each item as held or missing. Never assume data exists.',
      input: 'The task plus the pathway.', artifact: 'requirements' },
    { name: 'Gap & Risk Analyst', goal: 'Find the gaps and the risk areas.',
      system: 'You compare what is required against what is held, surface every gap, and rank the regulatory risks with a proposed mitigation for each.',
      input: 'The requirements.', artifact: 'gaps' },
    { name: 'Drafter', goal: 'Write the regulatory document.',
      system: 'You draft the document in formal regulatory language. Qualify every claim, flag every assumption, and use precise indication wording.',
      input: 'The pathway, requirements, and gaps.', artifact: 'draft' },
    { name: 'Reviewer Critic', goal: 'Read it as the agency would and challenge it.',
      system: 'You play the agency reviewer. List what you would reject or question, and turn each into a specific fix.',
      input: 'The task plus the draft.', artifact: 'critique' },
    { name: 'Editor', goal: 'Produce the final submission-ready document.',
      system: 'You apply the fixes and output the finished, submission-ready document in the requested format.',
      input: 'The draft plus the critique.', artifact: 'final' },
  ],
  due_diligence: () => [
    { name: 'Thesis Setter', goal: 'State the deal thesis and what would kill it.',
      system: 'You state the one-line deal thesis and the hypotheses that, if true, would kill the deal. These drive the whole review.',
      input: 'The original task.', artifact: 'thesis' },
    { name: 'Evidence Gatherer', goal: 'Collect and source every claim.',
      system: 'You gather evidence for and against each hypothesis. Source every number. Interrogate the seller materials rather than repeating them.',
      input: 'The task plus the thesis.', artifact: 'evidence' },
    { name: 'Risk Analyst', goal: 'Rank findings by how badly they hurt the deal.',
      system: 'You sort findings into confirmatory, disconfirmatory, and hidden risks, ranked by severity times likelihood. Mark anything still unsourced.',
      input: 'The evidence.', artifact: 'analysis' },
    { name: 'Memo Drafter', goal: 'Write the diligence memo with a recommendation.',
      system: 'You draft the diligence memo: thesis, findings by severity, open items for management, and a clear recommendation.',
      input: 'The thesis plus the analysis.', artifact: 'draft' },
    { name: 'Bear-case Critic', goal: 'Press the bear case and find what was missed.',
      system: 'You argue the bear case hard. Name what the memo is too soft on and turn each into a specific fix or open question.',
      input: 'The task plus the draft.', artifact: 'critique' },
    { name: 'Editor', goal: 'Produce the final memo.',
      system: 'You apply the fixes and output the finished diligence memo in the requested format.',
      input: 'The draft plus the critique.', artifact: 'final' },
  ],
  post_incident: () => [
    { name: 'Timeline Builder', goal: 'Reconstruct what happened, in order, in UTC.',
      system: 'You rebuild the incident timeline from the available signals. Distinguish the trigger from the underlying cause. Stay blameless — systems, not people.',
      input: 'The original task.', artifact: 'timeline' },
    { name: 'Root-cause Analyst', goal: 'Separate root cause from contributing factors.',
      system: 'You identify the root cause and the contributing factors. Judge each decision by what was knowable at the time, not hindsight.',
      input: 'The task plus the timeline.', artifact: 'analysis' },
    { name: 'Drafter', goal: 'Write the blameless post-mortem.',
      system: 'You draft the post-mortem: summary, timeline, impact, root cause, what went well and badly, and action items with an owner and a date each.',
      input: 'The timeline plus the analysis.', artifact: 'draft' },
    { name: 'Action-item Critic', goal: 'Make sure every fix is specific, owned, and dated.',
      system: 'You check that the post-mortem stays blameless and that every action item is specific, owned, dated, and verifiable. List each weak spot as a fix.',
      input: 'The task plus the draft.', artifact: 'critique' },
    { name: 'Editor', goal: 'Produce the final post-mortem.',
      system: 'You apply the fixes and output the finished post-mortem in the requested format.',
      input: 'The draft plus the critique.', artifact: 'final' },
  ],
};

function chainFor(archetype: ArchetypeId): AgentDef[] {
  const override = CHAIN_OVERRIDES[archetype];
  return override ? override() : defaultChain();
}

export function buildAgentWorkflow(engineered: string, ctx: HarnessContext): string {
  const arch = ARCHETYPES[ctx.archetype] ?? ARCHETYPES.general;
  const chain = chainFor(ctx.archetype);
  const deliverable = deliverableNoun(ctx.outputFormat);
  const out: string[] = [];

  // Header + the two ways to use it.
  out.push(ruleLine('═'));
  out.push(`AGENT WORKFLOW — ${arch.label}`);
  out.push(ruleLine('═'));
  out.push('');
  out.push('This turns the prompt below into a small TEAM of specialists that');
  out.push('hand work to each other, instead of one model doing everything at once.');
  out.push('');
  out.push('TWO WAYS TO USE THIS:');
  out.push('  A) In one chat — paste this whole block into your AI, then say');
  out.push('     "Play each role in order and show me each handoff." It will');
  out.push('     work through the team itself, one step at a time.');
  out.push('  B) In a real orchestrator — give each role below to its own agent in');
  out.push('     Claude Code sub-agents, n8n AI-Agent nodes, or LangGraph, and wire');
  out.push('     them in the order shown.');
  out.push('');
  out.push('HOW TO RUN (orchestrator, 4 steps):');
  out.push('  1. Create one agent per role; paste its "Its instructions" as that agent\'s setup (its system prompt).');
  out.push('  2. Feed each agent the named inputs it lists, using the small JSON envelope shown below.');
  out.push('  3. Run them in the order under ORCHESTRATION; run the parallel steps at the same time.');
  out.push('  4. The last agent\'s "final" output is your finished ' + deliverable + '.');
  out.push('');

  // The shared task — the engineered prompt is the source of truth.
  out.push(ruleLine());
  out.push('THE SHARED TASK (every agent can see this)');
  out.push(ruleLine());
  out.push(engineered.trim());
  out.push('');

  // The handoff envelope.
  out.push(ruleLine());
  out.push('HANDOFF FORMAT (how each agent passes work to the next)');
  out.push(ruleLine());
  out.push('Each agent ends its turn with one small JSON envelope:');
  out.push('{');
  out.push('  "from": "<this agent\'s name>",');
  out.push('  "artifact": "<the named output below>",');
  out.push('  "content": "<the actual work>",');
  out.push('  "open_questions": ["<anything unresolved>"]');
  out.push('}');
  out.push('The next agent reads the previous "content" as its input.');
  out.push('');

  // The agent cards.
  out.push(ruleLine());
  out.push('THE TEAM');
  out.push(ruleLine());
  chain.forEach((a, i) => {
    out.push('');
    out.push(`AGENT ${i + 1} — ${a.name}`);
    out.push(`  Goal:         ${a.goal}`);
    out.push(`  Its input:    ${a.input}`);
    out.push(`  It produces:  "${a.artifact}" (the named handoff)`);
    out.push('  Its instructions (give this to the agent as its setup):');
    out.push(`    ${a.system}`);
  });
  out.push('');

  // Orchestration: order + parallelism + assembly.
  out.push(ruleLine());
  out.push('ORCHESTRATION');
  out.push(ruleLine());
  out.push('Order:');
  out.push('  ' + chain.map((a) => a.name).join('  →  '));
  out.push('');
  if (chain.length >= 4) {
    out.push('Can run in parallel:');
    out.push(`  - ${chain[1].name} and ${chain[2].name} can start together once`);
    out.push(`    ${chain[0].name} finishes, then merge before ${chain[3].name}.`);
    out.push('Everything else runs in order — each step needs the one before it.');
  } else {
    out.push('Run every step in order — each needs the one before it.');
  }
  out.push('');
  out.push('Final assembly:');
  out.push(`  The last agent (${chain[chain.length - 1].name}) outputs the "final"`);
  out.push(`  artifact. That is your finished ${deliverable} — nothing else needs`);
  out.push('  to be combined by hand.');
  out.push('');
  out.push(ruleLine('═'));

  return out.join('\n');
}
