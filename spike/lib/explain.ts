// PromptDolphin — Explainer
// Parses engineered prompt into segments by adapter syntax + scans each segment for lexicon terms.
// Each segment gets a human explanation: what this block is for, why it helps.
// MIT License — Robic Direct Inc.

import { ADAPTERS, type AdapterId } from './engine-v2';
import { LEXICON, findTerms } from './lexicon';

export type SegmentKind =
  | 'role' | 'task' | 'context' | 'reasoning' | 'format'
  | 'exclusions' | 'examples' | 'critique' | 'extra' | 'literal';

export interface Segment {
  kind: SegmentKind;
  open: string;
  content: string;
  close: string;
  startIndex: number;
  endIndex: number;
  lexiconTerms: string[];
}

export interface SegmentExplanation {
  title: string;
  short: string;
  long: string;
  whyItHelps: string;
}

export const SEGMENT_EXPLAINS: Record<SegmentKind, SegmentExplanation> = {
  role: {
    title: 'Role assignment',
    short: 'Tells the AI WHO to be — a specific expert with credentials, experience, and a point of view.',
    long: 'LLMs change their behavior dramatically based on the role assigned. Asking "as a senior FDA regulatory strategist" produces different vocabulary, structure, and rigor than asking "as a helpful assistant." This block anchors the entire response in a specific persona\'s standards.',
    whyItHelps: 'Most general AI replies sound generic because no role is set. Pinning a role to a real expert profile makes the model lean on the right vocabulary, judgments, and conventions of that profession.',
  },
  task: {
    title: 'The task',
    short: 'Your raw request, preserved verbatim. Pre-flight verifies the engine did not paraphrase it.',
    long: 'PromptDolphin guarantees your exact task wording survives engineering. We add structure around it — role, format, constraints — but never rewrite what you actually want done. Pre-flight checks the first 40 characters of your task appear verbatim in the final prompt.',
    whyItHelps: 'Many "prompt enhancer" tools paraphrase your task and silently drift from what you wanted. We preserve it byte-for-byte so the LLM answers your actual question.',
  },
  context: {
    title: 'Context & depth',
    short: 'Sets the situation, the audience, and how much depth the response should have (your Quality Axis selection).',
    long: 'This block does two things: (1) gives the model the situational context for the archetype (e.g., "Board members are time-constrained — surface decisions needed"), and (2) injects the Quality Axis depth descriptor — word count, structure, and reading-time target you picked.',
    whyItHelps: 'Without depth guidance the model picks a length somewhere in the middle by default. Explicit depth + audience framing produces responses that match the use case.',
  },
  reasoning: {
    title: 'Reasoning approach',
    short: 'Instructs the model HOW to think before it writes — step-by-step, with options scored, with verification, etc.',
    long: 'This is Chain-of-Thought + Plan-and-Solve + (for strategic_depth and exhaustive_research) full Chain-of-Verification scaffolding. The model is told to frame the question, gather evidence, generate alternatives, test each, pick the best-supported, and state confidence. Reasoning-model variants (o1, o3, Claude extended thinking, Gemini Thinking) honor this implicitly.',
    whyItHelps: 'Skip reasoning instructions and the model jumps to an answer, often confidently wrong. Explicit reasoning steps catch errors before they reach you.',
  },
  format: {
    title: 'Output format',
    short: 'Defines the exact structure of the response — section headings, bullets, tables, file format.',
    long: 'Combines the archetype\'s natural output structure (e.g., board memo = ask + background + options + recommendation + risks) with your selected output format (Excel, PowerPoint, JSON, etc.). The model gets explicit headers, bullet counts, and formatting rules so the result lands ready to use.',
    whyItHelps: 'Vague format = inconsistent output. Strict format = reliable, paste-ready deliverables you do not have to reformat.',
  },
  exclusions: {
    title: 'What NOT to do',
    short: 'Lists what the model must avoid — passive voice, hype, hedging, fake citations — plus your verbatim user constraints.',
    long: 'Two parts: (1) archetype-specific anti-patterns the model is told to skip (e.g., "no superiority claims without head-to-head data" for regulatory submissions), and (2) any constraints you typed into Refine, preserved word-for-word. Pre-flight verifies your constraints survived.',
    whyItHelps: 'Telling the model what to avoid is often more effective than telling it what to do — it surfaces the failure modes the model knows but defaults to anyway.',
  },
  examples: {
    title: 'Worked examples',
    short: 'Two concrete illustrative cases for the archetype. In-context learning at its simplest.',
    long: 'Few-shot prompting: two real example tasks of the same shape. The model uses these to calibrate tone, format, and rigor for your task. Even when not directly relevant, they sharpen the model\'s sense of what "good" looks like.',
    whyItHelps: 'Models behave better when they have seen 2-5 examples of the target task than when they have none, even if those examples are not topically similar.',
  },
  critique: {
    title: 'Self-check before responding',
    short: 'Forces the model to verify its own answer against specific quality questions before submitting.',
    long: 'These are the questions the model is told to ask itself before finalizing: "Is the recommendation defensible? Is bad news visible? Are the action items owned and dated?" Combined with peer-review / red-team passes (at higher Quality Axis settings) this catches errors most one-shot prompts miss.',
    whyItHelps: 'The "verify before answering" step adds tokens but consistently catches sloppy responses. Especially powerful when paired with red team mode.',
  },
  extra: {
    title: 'Review pass + extras',
    short: 'Optional review modes (peer review, red team, both) and rich-media additions (visuals, video scripts) layered on at higher depths.',
    long: 'Comprehensive depth adds a peer-review pass. Strategic depth adds red team (3 objections + responses). Exhaustive research adds both + visual-direction blocks per section. These are the techniques that separate a one-shot reply from a board-grade deliverable.',
    whyItHelps: 'A single response is just a draft. Layering review passes is the difference between a draft and a deliverable.',
  },
  literal: {
    title: 'Literal markup',
    short: 'Adapter-specific syntax (XML tags for Claude, ## headings for ChatGPT, etc.) that the target model is tuned to recognize.',
    long: 'Each AI handles structure best in its own native syntax. Claude reads <role>...</role> XML tags reliably. ChatGPT prefers ## Markdown headings. PromptDolphin uses the right syntax per model.',
    whyItHelps: 'Using the wrong syntax for a model is a silent quality hit. Claude is less attentive to markdown headings; ChatGPT is less attentive to XML tags.',
  },
};

export function parseSegments(engineered: string, adapterId: AdapterId): Segment[] {
  const adapter = ADAPTERS[adapterId];
  const segments: Segment[] = [];
  const text = engineered;

  const markers: { name: SegmentKind; open: string; close: string; idx: number }[] = [];

  for (const block of adapter.blocks) {
    if (!block.open) continue;
    const startFrom = markers.length ? markers[markers.length - 1].idx + 1 : 0;
    const idx = text.indexOf(block.open, startFrom);
    if (idx >= 0) {
      markers.push({ name: block.name as SegmentKind, open: block.open, close: block.close, idx });
    }
  }

  if (markers.length && markers[0].idx > 0) {
    segments.push({
      kind: 'literal',
      open: '',
      content: text.slice(0, markers[0].idx),
      close: '',
      startIndex: 0,
      endIndex: markers[0].idx,
      lexiconTerms: [],
    });
  }

  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    const nextStart = i + 1 < markers.length ? markers[i + 1].idx : text.length;
    const segmentEnd = nextStart;
    const openLen = m.open.length;
    let contentEnd = segmentEnd;
    if (m.close && text.slice(m.idx + openLen, segmentEnd).includes(m.close)) {
      const closeIdx = text.lastIndexOf(m.close, segmentEnd);
      if (closeIdx > m.idx + openLen) contentEnd = closeIdx;
    }
    const content = text.slice(m.idx + openLen, contentEnd);
    segments.push({
      kind: m.name,
      open: m.open,
      content,
      close: m.close,
      startIndex: m.idx,
      endIndex: segmentEnd,
      lexiconTerms: findTerms(content),
    });
  }

  return segments;
}

export function collectLexiconTerms(engineered: string): string[] {
  return findTerms(engineered);
}

export { LEXICON };
