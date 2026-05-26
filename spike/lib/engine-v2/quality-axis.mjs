// PromptDolphin Engine v2 — Quality Axis primitive
// MIT License — Robic Direct Inc.

export const QUALITY_AXIS = {
  quick_verdict: {
    label: 'Quick verdict',
    blurb: 'Snap answer. Headline + one-line reason. Read in 30 seconds.',
    depth: {
      maxWords: 150,
      summary: 'Lead with the verdict in one sentence. Max 150 words total. No preamble.',
    },
    reviewMode: null,
    reasoning: 'minimal',
    richMedia: null,
  },
  fast_detailed: {
    label: 'Fast detailed',
    blurb: 'Compact briefing. Verdict plus three to five supporting points. Read in 2 minutes.',
    depth: {
      maxWords: 500,
      summary: '300-500 words. Lead with verdict, then bullets with one-line justifications.',
    },
    reviewMode: null,
    reasoning: 'standard',
    richMedia: null,
  },
  comprehensive: {
    label: 'Comprehensive',
    blurb: 'Full work-through with a peer-review pass. Read in 10 minutes.',
    depth: {
      maxWords: 1200,
      summary: '800-1200 words. Every claim supported. End with a single-pass peer review.',
    },
    reviewMode: 'peer_review',
    reasoning: 'expanded',
    richMedia: null,
  },
  strategic_depth: {
    label: 'Strategic depth',
    blurb: 'Decision-grade. Options weighed, risks named, red-teamed. Read in 30 minutes.',
    depth: {
      maxWords: 2500,
      summary: '1500-2500 words. Multiple options scored. Red-team pass after the recommendation.',
    },
    reviewMode: 'red_team',
    reasoning: 'structured',
    richMedia: null,
  },
  exhaustive_research: {
    label: 'Exhaustive research',
    blurb: 'Long-form report with citations, red-team and editor pass. Read in 2 hours.',
    depth: {
      maxWords: 6000,
      summary: '3000-6000 words. Standard report structure: Exec Summary / Background / Method / Findings / Analysis / Recommendations / Limitations / Appendix. Cite every external claim.',
    },
    reviewMode: 'red_team_plus_peer',
    reasoning: 'full',
    richMedia: 'visuals',
  },
};

export const QUALITY_AXIS_ORDER = [
  'quick_verdict',
  'fast_detailed',
  'comprehensive',
  'strategic_depth',
  'exhaustive_research',
];

export const REASONING_PRESETS = {
  minimal: '',
  standard: 'Think before you respond. Show key reasoning only when load-bearing.',
  expanded: 'Think step by step. Show the reasoning chain. Distinguish premise from conclusion.',
  structured: 'Reason in this order: (1) frame the decision (2) generate distinct options (3) score options on the stated criteria (4) pick one (5) defend it (6) name what would change your mind.',
  full: 'Reason in this order: (1) frame the question (2) gather and cite evidence (3) generate alternative interpretations (4) test each against the evidence (5) pick the best-supported (6) state confidence and remaining uncertainty.',
};

export const REVIEW_MODES = {
  standard: '',
  peer_review: 'After your primary response, switch role to senior editor. Identify 3 specific improvements. Apply them and label the revised section. Format: [EDITOR NOTES] then [REVISED SECTION].',
  red_team: 'After your primary response, switch role to rigorous skeptic. Identify the 3 strongest objections. Respond to each. Format: [RED TEAM] / [OBJECTION 1..3] / [RESPONSE].',
  red_team_plus_peer: 'After your primary response, run a red-team pass (3 objections plus responses) THEN an editor pass (3 improvements plus revisions). Format: [RED TEAM ...] then [EDITOR NOTES] [REVISED SECTIONS].',
};

export const RICH_MEDIA = {
  visuals: 'After the main response, add a [VISUAL DIRECTION] block per major section: chart type, axes, and what data to encode.',
  video_script: 'After the main response, add a [VIDEO SCRIPT] block — 2-3 minute talking head. Structure: [HOOK 15s] [BODY 90s] [CTA 30s].',
  image_prompts: 'After the main response, add 3 [IMAGE GENERATION PROMPTS] tuned to a modern diffusion model. Each: Subject / Style / Composition / Mood.',
  presentation_package: 'After the main response, add a presentation package: [SLIDE OUTLINE] [VISUAL DIRECTION] [SPEAKER NOTES] [HANDOUT SUMMARY].',
};
