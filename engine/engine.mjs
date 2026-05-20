// PromptDolphin Engine — pure JS, no React, no DOM. Testable in Node.
// Identical logic to spike/app/page.tsx but extracted for harness use.
// MIT License — Robic Direct Inc.

export function detectArchetype(task) {
  const t = String(task).toLowerCase();
  if (/regulatory|submission|fda|health canada|ema|tga|mhra|nda|bla/.test(t)) return "regulatory";
  if (/investor|quarterly update|q[1-4] update|pipeline progress|biotech update/.test(t)) return "investor";
  // Implementation tasks (build/create/HTML/code) — check BEFORE email so "draft a webpage" routes correctly
  if (/\b(build|implement|create|generate|develop|code|prototype|make me|provide|design)\b.*(html|page|web|app|site|component|dashboard|widget|interactive|editable|draggable|resizable|tool|spa|ui|report.*html)/.test(t)) return "implementation";
  if (/\b(html|css|javascript|react|vue|svelte|next\.?js|tailwind|component|interactive|spa|webapp|web app|web application|content[- ]?editable|draggable|resizable)\b/.test(t)) return "implementation";
  if (/\bemail\b|write to|message to|letter to|correspondence|draft.*to/.test(t)) return "email";
  if (/strategy|strategic|should we|recommend|options for|build or buy|make or buy/.test(t)) return "strategy";
  if (/slide|deck|presentation|board update|powerpoint|keynote/.test(t)) return "slides";
  if (/meeting|prep for|prepare for|qbr|agenda|brief for|debrief/.test(t)) return "meeting";
  if (/research|summarize|synthesis|synthesize|analyze|report on|literature/.test(t)) return "research";
  return "general";
}

// Auto-detect output format from task text (returns null if no signal).
// User can override via Power Up panel.
export function detectOutputFormat(task) {
  const t = String(task).toLowerCase();
  if (/\bhtml\b|web ?page|web report|interactive (?:page|report|dashboard|tool)|draggable|resizable|inline edit|content[- ]?editable/.test(t)) return "html";
  if (/\bpowerpoint\b|\bpptx\b|slide deck|slides? for/.test(t)) return "powerpoint";
  if (/\bexcel\b|\bxlsx\b|spreadsheet|pivot table/.test(t)) return "excel";
  if (/\bword (?:doc|document)\b|\bdocx\b/.test(t)) return "word";
  if (/\bone[- ]?pager\b|\b1[- ]?pager\b|executive summary on/.test(t)) return "pdf_1pager";
  if (/\bresearch report\b|full report|long[- ]form (?:research|analysis)|\b\d+[- ]page (?:report|paper)/.test(t)) return "research_report";
  return null;
}

export const ARCHETYPES = {
  email: {
    role: "a senior executive communications director with 20 years writing clear, direct business correspondence",
    context: "Focus on clarity, tone, and a single specific ask. The reader is busy.",
    format: "Subject line | Opening sentence | Body 2-3 paragraphs | Explicit ask | Sign-off",
    constraints: "No passive voice. No filler phrases. Max 250 words. Unambiguous ask.",
    critique: "Is the ask crystal clear in 30 seconds? Is the tone right? Under 250 words?",
  },
  strategy: {
    role: "a senior strategy consultant and former McKinsey partner",
    context: "Apply structured strategic thinking. Present options with rationale.",
    format: "Exec summary (3 sentences) | Strategic options (3-5 bullets) | Recommended path | Top 3 risks + mitigations",
    constraints: "No hedging without substance. Max 500 words. Defensible recommendations.",
    critique: "Actionable? Every claim defensible? Advances a clear position?",
  },
  meeting: {
    role: "a chief of staff and senior executive advisor",
    context: "Synthesize context, objectives, decisions this meeting must drive.",
    format: "Objective | Background (3 bullets) | Key questions (3-5) | Decision framework | Pre-read",
    constraints: "No generic advice. One page max. Specific to this exact meeting.",
    critique: "Would a senior leader walk in prepared? Questions sharp enough?",
  },
  slides: {
    role: "a senior strategy consultant designing Minto pyramid presentations",
    context: "Minto pyramid: answer first, support with evidence. Story holds without notes.",
    format: "Insight-titled slides | Max 35 words body per slide | Situation/complication/resolution arc",
    constraints: "No descriptive titles. Max 35 words body. Max 12 slides.",
    critique: "Each title states insight? Deck flows coherently?",
  },
  research: {
    role: "a senior research analyst",
    context: "Synthesize into coherent argument. Distinguish fact from interpretation. Flag uncertainty.",
    format: "Key findings (3-5) | Evidence per finding | Implications | Open questions",
    constraints: "No unverified claims. Flag uncertainty. Max 400 words.",
    critique: "Every finding evidenced? Implications clear? Uncertainty flagged?",
  },
  regulatory: {
    role: "a senior regulatory affairs strategist with 15+ years FDA/HC/EMA/TGA experience",
    context: "Regulatory-grade precision. No internal jargon, no unsupported superiority claims.",
    format: "Formal structure | Agency + pathway reference | Specific requirements | Required data",
    constraints: "No superiority claims without evidence. No internal codenames. Flag assumptions. Lawyer-grade precision.",
    critique: "Meets regulatory standards? Claims qualified? Would a reviewer accept?",
  },
  investor: {
    role: "a CFO and investor relations director, biotech/life sciences",
    context: "Be candid. Bad news as prominent as good. No hype.",
    format: "Pipeline progress | Catalysts ahead with timelines | Financial position | Candid outlook",
    constraints: "No hype. No buried bad news. No boilerplate. Label forward-looking statements.",
    critique: "Institutional investor would trust? Bad news visible? Timelines defensible?",
  },
  implementation: {
    role: "a senior full-stack engineer with 15+ years shipping production-grade interactive web applications. You have deep expertise in modern HTML/CSS/JS, design systems, accessibility (WCAG 2.2 AA), performance, and choosing battle-tested libraries (interact.js, react-rnd, ProseMirror, Quill, Tiptap, GridStack, Sortable.js) over hand-rolled solutions",
    context: "Address every technical requirement in the task explicitly — do not skip features. State your tech stack and library choices at the top of the output with one-sentence justification each. If a requirement is ambiguous, implement the most professional interpretation and note the assumption inline. The result must work end-to-end when copied into a single file with no further edits.",
    format: "1. Tech stack & library choices (bulleted, one-sentence rationale each) | 2. Complete production-ready code in a single self-contained block (HTML+CSS+JS or framework file) | 3. Inline comments only at non-obvious decisions | 4. Accessibility notes (keyboard nav, ARIA, focus management) | 5. Browser support + performance notes | 6. How to extend (named extension points only — no placeholder text)",
    constraints: "No placeholders like '...' or '/* add more here */' or 'you can extend this'. No partial implementations. No 'this is a starting point'. Every feature named in the task must be implemented and functional. No external image URLs (use SVG inline or CSS). No external script CDNs unless the library is named and pinned to a version. No console.log debug noise. No TODO comments.",
    critique: "Is every feature from the task implemented and working? Are library choices defensible and current (2025-2026)? Will the code render correctly in one paste? Are accessibility hooks present? Is anything left as a placeholder?",
  },
  general: {
    role: "a world-class domain expert combining deep knowledge with clear communication",
    context: "Think carefully. Address the specific task, not a generic version.",
    format: "Direct answer | Supporting reasoning | Concrete next steps",
    constraints: "No padding. No generic advice. Specific to this exact task.",
    critique: "Directly answers what was asked? Every claim specific?",
  },
};

export const CONNECTORS = {
  none: "",
  m365: "Microsoft 365 access. Search Outlook, Teams, SharePoint, OneDrive. Reference by name. Do not fabricate.",
  m365_deep: "Full M365 agent access. Scan Outlook 90d, Teams recordings, SharePoint, OneDrive, Calendar. Cite by name+date. Flag conflicts.",
  workspace: "Google Workspace: Gmail, Drive, Meet, Calendar. Reference by name. Prioritize last 60d.",
  chatgpt_memory: "Check memory + uploaded files. Reference memory items + filenames. Flag conflicts.",
  claude_project: "Scan Project documents. Reference by name. Do not fabricate.",
  claude_web: "Use web search. Cite sources inline. Flag limitations.",
  perplexity: "Current info required. Search per claim. Cite publication + date. Flag unverified.",
};

export const FORMATS = {
  prose: "",
  word: "Word format: # H1, ## H2, plain bullets, | tables, no code fences.",
  powerpoint: "Slide-by-slide outline. [SLIDE N — Title] / bullets max 8 words / [SPEAKER NOTES: 2-3 sentences]. Insight titles. Max 12 slides.",
  excel: "Excel tables. Row 1 headers, | separators. SUMMARY row. No prose.",
  email: "Subject + 3 paragraphs + sign-off. Max 200 words.",
  html: "Semantic HTML. <h1>/<h2>/<p>/<ul>/<table>. <summary> top. <footer> with date.",
  pdf_1pager: "One-pager max 500 words. Situation/Key Finding/Evidence/Recommendation/Next Step.",
  research_report: "3000-6000 words. Exec Summary/Background/Methodology/Findings/Analysis/Recommendations/Limitations/Appendix.",
};

export const REVIEW_MODES = {
  standard: "",
  red_team: "After primary response, switch to rigorous skeptic. Identify 3 objections + counters. Format: [RED TEAM ANALYSIS]",
  peer_review: "After primary response, take role of senior editor. 3 specific improvements, then apply. Format: [EDITOR'S NOTES] [REVISED OUTPUT]",
  steelman: "After primary response, steelman strongest counterargument. Format: [STEELMAN] [RESPONSE TO STEELMAN]",
};

export const DEPTHS = {
  exec_summary: "Max 300 words. Lead with recommendation.",
  standard: "",
  detailed_brief: "800-1200 words. Thorough, focused. Evidence per claim.",
  full_report: "Comprehensive. No length limit.",
};

export const RICH_MEDIA = {
  none: "",
  visuals: "After main response, add [VISUAL DIRECTION] per section: chart type, data encoded.",
  video_script: "After main response, add [VIDEO SCRIPT] — 2-3 min talking head. [HOOK 15s] [BODY 90s] [CTA 30s].",
  image_prompts: "After main response, add [IMAGE GENERATION PROMPTS] — 3 specific prompts. Subject/Style/Composition/Mood.",
  presentation_package: "After main response: [SLIDE OUTLINE] / [VISUAL DIRECTION] / [SPEAKER NOTES] / [HANDOUT SUMMARY].",
};

export const MODELS = ["claude", "chatgpt", "gemini", "copilot", "grok"];

export function applyAdapter(config) {
  const parts = ARCHETYPES[config.archetype];
  if (!parts) throw new Error(`Unknown archetype: ${config.archetype}`);
  const { role, context: baseContext, format: baseFormat, constraints, critique } = parts;
  const { task, model, connector = "none", outputFormat = "prose", reviewMode = "standard", depth = "standard", richMedia = "none" } = config;

  const fullContext = CONNECTORS[connector] ? `${baseContext}\n\n${CONNECTORS[connector]}` : baseContext;
  const fullFormat = FORMATS[outputFormat] ? `${baseFormat}\n\nAlso apply this output format:\n${FORMATS[outputFormat]}` : baseFormat;
  const fullConstraints = DEPTHS[depth] ? `${constraints}\n\nDepth: ${DEPTHS[depth]}` : constraints;
  const suffix = [REVIEW_MODES[reviewMode], RICH_MEDIA[richMedia]].filter(Boolean).join("\n\n");

  switch (model) {
    case "claude":
      return [
        `<role>\n${role}\n</role>`,
        `<context>\n${fullContext}\n</context>`,
        `<format>\n${fullFormat}\n</format>`,
        `<do_not>\n${fullConstraints}\n</do_not>`,
        `<critique>\n${critique}\n</critique>`,
        suffix && `<extra>\n${suffix}\n</extra>`,
        `### New Input:\n${task}`,
      ].filter(Boolean).join("\n\n");
    case "chatgpt":
      return [
        `You are ${role}.`,
        `## Task\n${task}`,
        `## Instructions\n${fullContext}`,
        `## Output format\n${fullFormat}`,
        `## Constraints\n${fullConstraints}`,
        `## Verify\n${critique}`,
        suffix && `## Additional\n${suffix}`,
      ].filter(Boolean).join("\n\n");
    case "gemini":
      return [
        `You are ${role}.`,
        `Task:\n${task}`,
        fullContext,
        `Structure your answer as:\n${fullFormat}`,
        `Ensure:\n${fullConstraints}`,
        `Verify before answering: ${critique}`,
        suffix,
      ].filter(Boolean).join("\n\n");
    case "copilot":
      return [
        `## Role\n${role}`,
        `## Task\n${task}`,
        `## Context\n${fullContext}`,
        `## Output format\n${fullFormat}`,
        `## Constraints\n${fullConstraints}`,
        `## Quality check\n${critique}`,
        suffix && `## Additional\n${suffix}`,
      ].filter(Boolean).join("\n\n");
    case "grok":
      return [
        `${role}.`,
        `Task: ${task}`,
        fullContext,
        `Format: ${fullFormat}`,
        `Avoid: ${fullConstraints}`,
        `Check: ${critique} Be direct.`,
        suffix,
      ].filter(Boolean).join("\n\n");
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

export function engineer(task, options = {}) {
  const archetype = options.archetype || detectArchetype(task);
  const autoFormat = detectOutputFormat(task);
  const outputFormat = options.outputFormat || autoFormat || "prose";
  return applyAdapter({
    task: String(task).trim(),
    archetype,
    model: options.model || "claude",
    outputFormat,
    ...options,
  });
}
