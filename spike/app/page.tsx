"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type Model = "claude" | "chatgpt" | "gemini" | "copilot" | "grok";
type Archetype =
  | "email" | "strategy" | "meeting" | "slides"
  | "research" | "regulatory" | "investor" | "general";

type Connector =
  | "none" | "m365" | "m365_deep" | "workspace"
  | "chatgpt_memory" | "claude_project" | "claude_web" | "perplexity";

type OutputFormat =
  | "prose" | "word" | "powerpoint" | "excel"
  | "email" | "html" | "pdf_1pager" | "research_report";

type ReviewMode = "standard" | "red_team" | "peer_review" | "steelman";
type OutputDepth = "exec_summary" | "standard" | "detailed_brief" | "full_report";
type RichMedia = "none" | "visuals" | "video_script" | "image_prompts" | "presentation_package";

interface PromptParts {
  role: string;
  context: string;
  task: string;
  format: string;
  constraints: string;
  critique: string;
}

interface PromptConfig {
  task: string;
  archetype: Archetype;
  model: Model;
  connector: Connector;
  outputFormat: OutputFormat;
  reviewMode: ReviewMode;
  depth: OutputDepth;
  richMedia: RichMedia;
}

// ─── Archetype detection (keyword matching, zero AI, zero latency) ─────────────
function detectArchetype(task: string): Archetype {
  const t = task.toLowerCase();
  if (/regulatory|submission|fda|health canada|ema|tga|mhra|nda|bla/.test(t)) return "regulatory";
  if (/investor|quarterly update|q[1-4] update|pipeline progress|biotech update/.test(t)) return "investor";
  if (/\bemail\b|write to|message to|letter to|correspondence|draft.*to/.test(t)) return "email";
  if (/strategy|strategic|should we|recommend|options for|build or buy|make or buy/.test(t)) return "strategy";
  if (/slide|deck|presentation|board update|powerpoint|keynote/.test(t)) return "slides";
  if (/meeting|prep for|prepare for|qbr|agenda|brief for|debrief/.test(t)) return "meeting";
  if (/research|summarize|synthesis|synthesize|analyze|report on|literature/.test(t)) return "research";
  return "general";
}

// ─── Archetype content library ────────────────────────────────────────────────
const ARCHETYPES: Record<Archetype, Omit<PromptParts, "task">> = {
  email: {
    role: "a senior executive communications director with 20 years writing clear, direct business correspondence",
    context: "Focus on clarity, tone, and a single specific ask. The reader is busy.",
    format: "Subject line | Opening sentence (context only — no pleasantries) | Body (2–3 paragraphs) | Explicit ask or next step | Professional sign-off",
    constraints: "No passive voice. No filler phrases. No more than 250 words. The ask must be unambiguous.",
    critique: "Is the ask crystal clear in 30 seconds? Is the tone right for this specific audience? Is it under 250 words?",
  },
  strategy: {
    role: "a senior strategy consultant and former McKinsey partner with expertise in business planning and competitive strategy",
    context: "Apply structured strategic thinking. Present options with rationale — not just a single answer.",
    format: "Executive summary (3 sentences) | Key strategic options (3–5 bullets, each with brief rationale) | Recommended path and why | Top 3 risks and mitigations",
    constraints: "No hedging language without substance. No more than 500 words. Every recommendation must be defensible.",
    critique: "Is the recommendation actionable? Is every claim defensible? Does this advance a clear strategic position?",
  },
  meeting: {
    role: "a chief of staff and senior executive advisor who prepares leaders for high-stakes meetings",
    context: "Synthesize relevant context, objectives, and the specific decisions this meeting must drive.",
    format: "Meeting objective (1 sentence) | Background (3 bullets) | Key questions to drive (3–5) | Decision framework | Pre-read materials needed",
    constraints: "No generic advice. Maximum one page. Every point must be specific to this exact meeting.",
    critique: "Would a senior leader walk in genuinely prepared? Are the questions sharp enough to force a real decision?",
  },
  slides: {
    role: "a senior strategy consultant who designs Minto pyramid-structured executive presentations",
    context: "Apply the Minto pyramid: answer first, then support with evidence. Story must hold without speaker notes.",
    format: "Insight-titled slides (not descriptive titles) | Maximum 35 words of body copy per slide | Story arc: situation → complication → resolution",
    constraints: "No descriptive slide titles — use insight titles. No slide with more than 35 words of body. No more than 12 slides.",
    critique: "Does each title state the insight, not just the topic? Does the deck flow as a coherent argument?",
  },
  research: {
    role: "a senior research analyst with expertise in synthesizing complex information into clear, actionable insights",
    context: "Synthesize into a coherent argument. Clearly distinguish fact from interpretation. Flag uncertainty.",
    format: "Key findings (3–5 bullets) | Supporting evidence per finding | Implications | Open questions that remain",
    constraints: "No unverified claims. Flag uncertainty explicitly. No more than 400 words.",
    critique: "Is every finding supported by evidence? Are implications clearly stated? Is uncertainty explicitly flagged?",
  },
  regulatory: {
    role: "a senior regulatory affairs strategist with 15+ years in FDA, Health Canada, EMA, and TGA submissions",
    context: "Apply regulatory-grade precision. No internal jargon, no superiority claims without supporting evidence.",
    format: "Formal regulatory structure | Clear agency and pathway reference | Specific requirements addressed | Required supporting data or documents",
    constraints: "No superiority claims without cited evidence. No internal codenames. Flag every assumption. Regulatory-lawyer precision throughout.",
    critique: "Does this meet regulatory correspondence standards? Are all claims properly qualified? Would a regulatory reviewer accept this language?",
  },
  investor: {
    role: "a CFO and investor relations director with expertise in biotech and life sciences quarterly communications",
    context: "Be candid. Bad news must be as prominent as good news. No hype. No burying.",
    format: "Pipeline progress with specific milestones | Key catalysts ahead with realistic timelines | Financial position | Candid, specific outlook",
    constraints: "No hype. No buried bad news. No boilerplate. All forward-looking statements must be clearly labeled as such.",
    critique: "Would an institutional investor trust this? Is negative news as visible as positive? Are all timelines defensible?",
  },
  general: {
    role: "a world-class expert in the relevant domain, combining deep knowledge with precise, clear communication",
    context: "Think carefully before responding. Address the specific task exactly as stated — not a generic version of it.",
    format: "Direct answer | Supporting reasoning | Concrete next steps or recommendations",
    constraints: "No padding. No generic advice. Every point must be specific to this exact task. Cut anything vague.",
    critique: "Does this directly answer exactly what was asked? Is every claim specific and defensible?",
  },
};

// ─── Connector library — what data the model can access ──────────────────────
const CONNECTORS: Record<Connector, string> = {
  none: "",
  m365:
    "You have access to this user's Microsoft 365 environment. Before generating, search for relevant context across:\n- Outlook: emails, calendar entries, meeting requests\n- Microsoft Teams: chat history, channel posts, meeting recordings and transcripts\n- SharePoint: documents, site pages, lists\n- OneDrive: personal files and shared documents\nReference specific documents, emails, or recordings by name where relevant. Do not fabricate references.",
  m365_deep:
    "You are operating as a Copilot agent with access to this user's complete Microsoft 365 footprint. Conduct a thorough search before responding:\n1. Scan Outlook for emails related to this task from the last 90 days.\n2. Check Teams for meeting recordings or chats on this topic.\n3. Search SharePoint and OneDrive for relevant documents, presentations, or spreadsheets.\n4. Check the user's calendar for upcoming or recent meetings relevant to this task.\nSynthesize what you find. Cite each source by name and date. If you find conflicting information across sources, flag the conflict explicitly.",
  workspace:
    "You have access to this user's Google Workspace. Before generating, search for relevant context across:\n- Gmail: emails and threads related to this task\n- Google Drive: documents, spreadsheets, presentations, and shared files\n- Google Meet: meeting recordings and transcripts where available\n- Google Calendar: upcoming and recent meetings\nReference specific documents and emails by name. Prioritize items from the last 60 days unless the task requires historical context.",
  chatgpt_memory:
    "Before generating, check: (1) your memory of this user's prior conversations, preferences, and ongoing projects; (2) any files uploaded to this conversation. Synthesize relevant context from memory and uploaded materials into your response. Reference specific memory items or file names where relevant. If memory contains conflicting information, note the conflict and ask for clarification before proceeding.",
  claude_project:
    "Before generating, scan all documents in this Project for relevant context. Reference specific documents by name. If a document contains data that directly addresses the task, quote or paraphrase it with a citation. Do not fabricate document references.",
  claude_web:
    "Before generating, use web search to verify current facts, find recent data, and check for information that may have changed since your training cutoff. Cite all web sources inline with the claim they support. If a search returns no useful results, proceed on training knowledge and flag the limitation.",
  perplexity:
    "This task requires current, verified information. For every factual claim:\n1. Conduct a targeted web search.\n2. Cite the source inline (publication name + date).\n3. Flag any claim you could not verify with current sources.\nDo not rely on training data for time-sensitive facts. Prefer primary sources over secondary summaries.",
};

// ─── Output format library ────────────────────────────────────────────────────
const FORMATS: Record<OutputFormat, string> = {
  prose: "",
  word:
    "Structure your output for direct paste into Microsoft Word:\n- Use clear heading levels (# H1, ## H2, ### H3)\n- Plain bullet points only\n- Format data as plain-text tables with | column separators\n- No markdown code fences. No emoji.\n- Paragraphs of 3–5 sentences for readability at 12pt.",
  powerpoint:
    "Structure your output as a slide-by-slide PowerPoint outline.\n\nFor each slide:\n[SLIDE N — Title]\n• Bullet point (max 8 words)\n• Bullet point (max 8 words)\n• Bullet point (max 5 bullets per slide)\n[SPEAKER NOTES: 2–3 sentences expanding the slide for the presenter]\n\nRules: every slide title states the insight (not the topic). No slide with more than 35 words of body. Maximum 12 slides. Open with AGENDA and close with NEXT STEPS.",
  excel:
    "Structure your output as one or more tables for direct paste into Excel:\n- Row 1: column headers (capitalized)\n- Subsequent rows: data\n- Use | to separate columns, newlines to separate rows\n- Label multiple tables with a bold heading before each\n- Include a SUMMARY row or column where analytically appropriate\n- No prose paragraphs — all findings in table cells.",
  email:
    "Format your output as a ready-to-send executive email:\nSubject: [subject line]\n\n[Paragraph 1: context in 2 sentences]\n[Paragraph 2: the main point or ask]\n[Paragraph 3: next step or timeline]\n\n[Sign-off]\nMaximum 200 words.",
  html:
    "Format your output as clean semantic HTML:\n- <h1>, <h2>, <h3> for hierarchy\n- <p> for prose, <ul>/<li> for bullets, <table> for data\n- Include a <summary> section at the top (2–3 sentences)\n- No inline styles. No JavaScript. No external references.\n- Close with a <footer> noting the date.",
  pdf_1pager:
    "Format as an executive one-pager (max 500 words):\nStructure: Situation (2 sentences) | Key Finding (1 bold sentence) | Evidence (3 bullets) | Recommendation (1–2 sentences) | Next Step (1 sentence)\nEvery sentence must earn its place. If the task cannot fit in 500 words, prioritize the recommendation and flag what was omitted.",
  research_report:
    "Format as a comprehensive research report (3,000–6,000 words):\n1. Executive Summary (300 words max)\n2. Background and Context\n3. Methodology\n4. Findings (with subsections per major theme)\n5. Analysis and Implications\n6. Recommendations (numbered, prioritized)\n7. Limitations and Caveats\n8. Appendix (sources, supporting data)\nCite all factual claims. Flag uncertainty. Do not pad.",
};

// ─── Review mode library ──────────────────────────────────────────────────────
const REVIEW_MODES: Record<ReviewMode, string> = {
  standard: "",
  red_team:
    "After completing your primary response, switch roles. You are now a rigorous skeptic with deep domain expertise who disagrees with your analysis.\n\nIdentify the three strongest objections to your own conclusions:\n1. Where is the evidence weakest?\n2. What assumption, if wrong, would invalidate the recommendation?\n3. What did you not consider that a domain expert would immediately flag?\n\nFormat:\n[RED TEAM ANALYSIS]\nObjection 1: [state] / Counter: [strongest response]\nObjection 2: [state] / Counter: [strongest response]\nObjection 3: [state] / Counter: [strongest response]\nNet assessment: [is the recommendation strengthened or weakened?]",
  peer_review:
    "After completing your primary response, take on the role of a senior editor at The Economist reviewing this work before publication.\n\nReview criteria: accuracy, clarity, logic, tone.\nProvide exactly three specific improvement recommendations, then apply them.\n\nFormat:\n[EDITOR'S NOTES]\n1. [finding + specific change]\n2. [finding + specific change]\n3. [finding + specific change]\n[REVISED OUTPUT]\n[full revised response with all three changes applied]",
  steelman:
    "After completing your primary response, steelman the strongest possible counterargument to your recommendation. Present it as its most articulate advocate would. Then respond to it directly.\n\nFormat:\n[STEELMAN]\n[the strongest case against your recommendation]\n[RESPONSE TO STEELMAN]\n[why the recommendation stands, or how it should be modified]",
};

// ─── Output depth library ─────────────────────────────────────────────────────
const DEPTHS: Record<OutputDepth, string> = {
  exec_summary: "Maximum 300 words. Lead with the recommendation. Every sentence advances the argument. Nothing decorative.",
  standard: "",
  detailed_brief: "Target 800–1,200 words. Cover the topic thoroughly but remain focused. Include supporting evidence for all major claims. Earn every paragraph.",
  full_report: "Comprehensive coverage. No artificial length limit. Include all relevant analysis, evidence, counterarguments, and recommendations. A busy professional should be able to act on this without reading anything else.",
};

// ─── Rich media library ──────────────────────────────────────────────────────
const RICH_MEDIA: Record<RichMedia, string> = {
  none: "",
  visuals:
    "After your main response, add a [VISUAL DIRECTION] section. For each major section, specify: chart/diagram type, what it should show, the data or relationships it encodes. Specific enough for a designer to execute without further briefing.",
  video_script:
    "After your main response, add a [VIDEO SCRIPT] section — a 2–3 minute talking-head script.\nFormat:\n[HOOK — 15 seconds]: opening that frames the problem\n[BODY — 90 seconds]: 3 key points, each with one supporting fact\n[CALL TO ACTION — 30 seconds]: what the viewer should do next\nInclude [PAUSE] markers and [B-ROLL SUGGESTION: ...] where relevant. Write for speaking, not reading.",
  image_prompts:
    "After your main response, add [IMAGE GENERATION PROMPTS] — 3 specific prompts for DALL-E, Midjourney, or Stable Diffusion.\nEach prompt specifies: Subject | Style | Composition | Mood | What to exclude.\nFormat: [IMAGE N: full prompt text]",
  presentation_package:
    "After your main response, provide a complete package:\n[SLIDE OUTLINE]: full slide-by-slide outline\n[VISUAL DIRECTION]: one specific visual per slide\n[SPEAKER NOTES]: 3–5 sentences per slide\n[HANDOUT SUMMARY]: 1-page prose summary for the audience",
};

// ─── Model adapters — apply with full config ─────────────────────────────────
function applyAdapter(config: PromptConfig): string {
  const parts = ARCHETYPES[config.archetype];
  const { role, context: baseContext, format: baseFormat, constraints, critique } = parts;
  const { task, model, connector, outputFormat, reviewMode, depth, richMedia } = config;

  const connectorBlock = CONNECTORS[connector];
  const formatExtra = FORMATS[outputFormat];
  const depthExtra = DEPTHS[depth];
  const reviewExtra = REVIEW_MODES[reviewMode];
  const mediaExtra = RICH_MEDIA[richMedia];

  // Compose context: archetype context + connector grounding
  const fullContext = connectorBlock
    ? `${baseContext}\n\n${connectorBlock}`
    : baseContext;

  // Compose format: archetype format + output format override
  const fullFormat = formatExtra
    ? `${baseFormat}\n\nAlso apply this output format:\n${formatExtra}`
    : baseFormat;

  // Compose constraints: archetype constraints + depth
  const fullConstraints = depthExtra
    ? `${constraints}\n\nDepth: ${depthExtra}`
    : constraints;

  // Review + rich media suffix
  const suffix = [reviewExtra, mediaExtra].filter(Boolean).join("\n\n");

  switch (model) {
    case "claude":
      return [
        `<role>\n${role}\n</role>`,
        `<context>\nBefore generating, read the task carefully. ${fullContext}\n</context>`,
        `<format>\n${fullFormat}\n</format>`,
        `<do_not>\n${fullConstraints}\n</do_not>`,
        `<critique>\nBefore finalizing: ${critique}\nIf any answer is no, identify the specific failure and revise before outputting.\n</critique>`,
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
        `## Before you respond\nVerify: ${critique}`,
        suffix && `## Additional\n${suffix}`,
      ].filter(Boolean).join("\n\n");
    case "gemini":
      return [
        `You are ${role}.`,
        `Here is my task:\n${task}`,
        fullContext,
        `When you respond, please structure your answer as:\n${fullFormat}`,
        `As you work, ensure:\n${fullConstraints}`,
        `Before giving your final answer, verify: ${critique}`,
        suffix,
      ].filter(Boolean).join("\n\n");
    case "copilot":
      return [
        `## Role\n${role}`,
        `## Task\n${task}`,
        `## Context\n${fullContext}`,
        `## Output format\n${fullFormat}`,
        `## Constraints\n${fullConstraints}`,
        `## Quality check before responding\n${critique}`,
        suffix && `## Additional\n${suffix}`,
      ].filter(Boolean).join("\n\n");
    case "grok":
      return [
        `${role}.`,
        `Task: ${task}`,
        fullContext,
        `Format: ${fullFormat}`,
        `Avoid: ${fullConstraints}`,
        `Before answering, check: ${critique} Be direct. No sugarcoating.`,
        suffix,
      ].filter(Boolean).join("\n\n");
  }
}

const MODELS: { id: Model; label: string; badge: string; hint: string }[] = [
  { id: "claude", label: "Claude", badge: "XML tags", hint: "XML section tags + critique block — Claude's native dialect." },
  { id: "chatgpt", label: "ChatGPT", badge: "Role + headers", hint: "'You are...' framing and markdown headers — GPT-5's native pattern." },
  { id: "gemini", label: "Gemini", badge: "Natural flow", hint: "Conversational structure with verification step." },
  { id: "copilot", label: "Copilot", badge: "M365-aware", hint: "Explicit Microsoft 365 grounding — Outlook, Teams, SharePoint." },
  { id: "grok", label: "Grok", badge: "Direct mode", hint: "Terse and blunt — Grok's preferred register." },
];

const CONNECTOR_LABELS: { id: Connector; label: string }[] = [
  { id: "none", label: "Training data only" },
  { id: "m365", label: "Microsoft 365 (email, Teams, SharePoint)" },
  { id: "m365_deep", label: "Microsoft 365 — deep search (agent mode)" },
  { id: "workspace", label: "Google Workspace (Gmail, Drive, Meet)" },
  { id: "chatgpt_memory", label: "ChatGPT memory + my files" },
  { id: "claude_project", label: "Claude Project documents" },
  { id: "claude_web", label: "Claude with web search" },
  { id: "perplexity", label: "Perplexity (real-time web)" },
];

const FORMAT_LABELS: { id: OutputFormat; label: string }[] = [
  { id: "prose", label: "Written response (default)" },
  { id: "word", label: "Word document" },
  { id: "powerpoint", label: "PowerPoint with speaker notes" },
  { id: "excel", label: "Excel table" },
  { id: "email", label: "Executive email" },
  { id: "html", label: "HTML for web" },
  { id: "pdf_1pager", label: "Executive one-pager" },
  { id: "research_report", label: "Full research report (3–6k words)" },
];

const DEPTH_LABELS: { id: OutputDepth; label: string }[] = [
  { id: "exec_summary", label: "Executive summary (fits on one page)" },
  { id: "standard", label: "Standard" },
  { id: "detailed_brief", label: "Detailed brief" },
  { id: "full_report", label: "Full report (no limit)" },
];

const REVIEW_LABELS: { id: ReviewMode; label: string }[] = [
  { id: "standard", label: "Standard (single-pass)" },
  { id: "red_team", label: "Red team (adversarial self-critique)" },
  { id: "peer_review", label: "Peer review (editor revision)" },
  { id: "steelman", label: "Steelman (strongest counterargument)" },
];

const RICH_MEDIA_LABELS: { id: RichMedia; label: string }[] = [
  { id: "none", label: "None" },
  { id: "visuals", label: "Visual direction (chart/diagram specs)" },
  { id: "video_script", label: "Video script (2–3 min talking head)" },
  { id: "image_prompts", label: "Image prompts (DALL-E / Midjourney)" },
  { id: "presentation_package", label: "Full presentation package" },
];

const ARCHETYPE_LABELS: Record<Archetype, string> = {
  email: "Executive Email",
  strategy: "Strategy Brief",
  meeting: "Meeting Prep",
  slides: "Deck Outline",
  research: "Research Synthesis",
  regulatory: "Regulatory Draft",
  investor: "Investor Update",
  general: "General Task",
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [task, setTask] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [activeModel, setActiveModel] = useState<Model>("claude");
  const [connector, setConnector] = useState<Connector>("none");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("prose");
  const [depth, setDepth] = useState<OutputDepth>("standard");
  const [reviewMode, setReviewMode] = useState<ReviewMode>("standard");
  const [richMedia, setRichMedia] = useState<RichMedia>("none");
  const [powerUpOpen, setPowerUpOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Re-assemble whenever any config changes after first generation
  useEffect(() => {
    if (!archetype) return;
    const config: PromptConfig = {
      task: task.trim(),
      archetype,
      model: activeModel,
      connector,
      outputFormat,
      reviewMode,
      depth,
      richMedia,
    };
    setOutput(applyAdapter(config));
  }, [archetype, activeModel, connector, outputFormat, reviewMode, depth, richMedia, task]);

  function engineer() {
    if (!task.trim()) return;
    const detected = detectArchetype(task.trim());
    setArchetype(detected);
    // useEffect will re-assemble
    setTimeout(() => {
      document.getElementById("output")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() {
    setTask("");
    setOutput("");
    setArchetype(null);
    setCopied(false);
    setConnector("none");
    setOutputFormat("prose");
    setDepth("standard");
    setReviewMode("standard");
    setRichMedia("none");
    setPowerUpOpen(false);
    setAdvancedOpen(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      document.getElementById("input-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  return (
    <main className="min-h-screen bg-[#F5F9FC]">

      {/* Compact hero banner — dolphin photo + headline only, no CTA */}
      <section className="relative w-full h-[40vh] min-h-[280px] sm:min-h-[320px] md:min-h-[360px] max-h-[480px] overflow-hidden">
        <Image
          src="/brand/dolphin-hero.jpg"
          alt="A dolphin curving through deep ocean water"
          fill priority sizes="100vw"
          className="object-cover"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F35]/90 via-[#0A1F35]/60 to-[#0A1F35]/20" />
        <div className="absolute inset-0 flex items-end pb-6 sm:pb-8 md:pb-10">
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 md:px-10 lg:px-16">
            <h1
              className="text-[#F5F9FC] font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight max-w-[22ch]"
              style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}
            >
              Your AI is only as good as{" "}
              <span className="text-[#A67C3D]">your prompt.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* App — input is the action, immediately visible below hero */}
      <section id="input-section" className="py-8 sm:py-10 md:py-12 lg:py-14 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-2xl md:max-w-3xl mx-auto">

          <div className="text-center mb-6 md:mb-8">
            <p className="text-[#4A5A6E] text-sm md:text-base">
              Describe your task in one sentence. PromptDolphin engineers it into a paste-ready prompt — tuned to{" "}
              <span className="font-semibold text-[#143352]">Claude, ChatGPT, Gemini, Copilot, or Grok</span>. 60 seconds. Free. Nothing leaves your browser.
            </p>
          </div>

          <div>
            <textarea
              ref={textareaRef}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && task.trim()) {
                  e.preventDefault();
                  engineer();
                }
              }}
              placeholder={`Examples:\n"Write an email to my VP asking to delay the Q3 launch by two weeks"\n"Help me decide whether we should expand to Europe next year"\n"Prep me for tomorrow's QBR with our biggest customer"`}
              className="w-full border-2 border-[#C4D2E0] rounded-md p-4 text-[#0E1A2A] text-sm resize-none focus:outline-none focus:border-[#143352] bg-white leading-relaxed placeholder:text-[#8FA6BC] shadow-sm"
              rows={5}
              autoFocus
            />
            <button
              onClick={engineer}
              disabled={!task.trim()}
              className="mt-3 w-full py-3 bg-[#143352] text-white rounded-md text-sm font-semibold hover:bg-[#0A1F35] disabled:opacity-40 disabled:cursor-not-allowed transition-colors tracking-wide"
            >
              Engineer this prompt →
            </button>
            <p className="mt-3 text-center text-[11px] text-[#8FA6BC]">
              🐟 Goldfish memory — nothing you type is stored or transmitted.{" "}
              <a href="/trust" className="underline hover:text-[#143352] transition-colors">
                Verify
              </a>
            </p>
          </div>

          {output && (
            <div id="output" className="mt-12">

              {archetype && (
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs text-[#4A5A6E]">Detected format:</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#E8EFF5] text-[#A67C3D] font-semibold border border-[#C4D2E0]">
                    {ARCHETYPE_LABELS[archetype]}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs text-[#4A5A6E] mb-2 font-semibold uppercase tracking-wider">
                  Optimize for your AI
                </p>
                <div className="flex flex-wrap gap-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveModel(m.id)}
                      title={m.hint}
                      className={`flex flex-col items-start px-3 py-2 rounded-md border text-left transition-all ${
                        activeModel === m.id
                          ? "border-[#143352] bg-[#143352] text-white"
                          : "border-[#C4D2E0] bg-white text-[#0E1A2A] hover:border-[#143352] hover:bg-[#E8EFF5]"
                      }`}
                    >
                      <span className="text-xs font-semibold">{m.label}</span>
                      <span className={`text-[10px] mt-0.5 ${activeModel === m.id ? "text-[#A67C3D]" : "text-[#4A5A6E]"}`}>
                        {m.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Power Up panel — Tier 2 */}
              <div className="mb-4">
                <button
                  onClick={() => setPowerUpOpen(!powerUpOpen)}
                  className="flex items-center gap-2 text-xs text-[#143352] font-semibold uppercase tracking-wider hover:text-[#0A1F35] transition-colors"
                >
                  <span className="inline-block w-4 text-center">{powerUpOpen ? "−" : "+"}</span>
                  Power up this prompt
                </button>
                {powerUpOpen && (
                  <div className="mt-3 p-5 bg-white border border-[#C4D2E0] rounded-md space-y-5">

                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        What does your AI have access to?
                      </label>
                      <select
                        value={connector}
                        onChange={(e) => setConnector(e.target.value as Connector)}
                        className="w-full border border-[#C4D2E0] rounded-md p-2 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352]"
                      >
                        {CONNECTOR_LABELS.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        What format do you need?
                      </label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                        className="w-full border border-[#C4D2E0] rounded-md p-2 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352]"
                      >
                        {FORMAT_LABELS.map((f) => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        How detailed?
                      </label>
                      <select
                        value={depth}
                        onChange={(e) => setDepth(e.target.value as OutputDepth)}
                        className="w-full border border-[#C4D2E0] rounded-md p-2 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352]"
                      >
                        {DEPTH_LABELS.map((d) => (
                          <option key={d.id} value={d.id}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Advanced — Tier 3 */}
                    <div className="pt-3 border-t border-[#C4D2E0]">
                      <button
                        onClick={() => setAdvancedOpen(!advancedOpen)}
                        className="flex items-center gap-2 text-xs text-[#143352] font-semibold uppercase tracking-wider hover:text-[#0A1F35] transition-colors"
                      >
                        <span className="inline-block w-4 text-center">{advancedOpen ? "−" : "+"}</span>
                        Advanced
                      </button>
                      {advancedOpen && (
                        <div className="mt-3 space-y-4">
                          <div>
                            <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                              Review mode
                            </label>
                            <select
                              value={reviewMode}
                              onChange={(e) => setReviewMode(e.target.value as ReviewMode)}
                              className="w-full border border-[#C4D2E0] rounded-md p-2 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352]"
                            >
                              {REVIEW_LABELS.map((r) => (
                                <option key={r.id} value={r.id}>{r.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                              Add to output
                            </label>
                            <select
                              value={richMedia}
                              onChange={(e) => setRichMedia(e.target.value as RichMedia)}
                              className="w-full border border-[#C4D2E0] rounded-md p-2 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352]"
                            >
                              {RICH_MEDIA_LABELS.map((rm) => (
                                <option key={rm.id} value={rm.id}>{rm.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-[#8FA6BC] pt-2 border-t border-[#C4D2E0]">
                      Any selection re-engineers the prompt instantly. Still client-side. Still zero retention.
                    </p>
                  </div>
                )}
              </div>

              {/* Prompt output */}
              <div className="bg-[#0A1F35] border border-[#143352] rounded-md p-5 text-sm text-[#F5F9FC] font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto shadow-lg">
                {output}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <p className="text-xs text-[#4A5A6E] leading-relaxed">
                  Paste into{" "}
                  <span className="font-semibold text-[#143352]">
                    {MODELS.find((m) => m.id === activeModel)?.label}
                  </span>
                  . Switch models or settings to reformat in{" "}
                  <span className="font-semibold text-[#143352]">&lt;1ms</span>.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={reset} className="text-xs text-[#8FA6BC] hover:text-[#143352] px-2 py-1 transition-colors">
                    Start over
                  </button>
                  <button
                    onClick={copy}
                    className="px-4 py-2 bg-[#A67C3D] text-white rounded-md text-xs font-semibold hover:bg-[#8a6530] transition-colors min-w-[100px]"
                  >
                    {copied ? "✓ Copied" : "Copy prompt"}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-[10px] text-[#8FA6BC] text-center leading-relaxed">
                {MODELS.find((m) => m.id === activeModel)?.hint}
              </p>

            </div>
          )}
        </div>
      </section>

      {/* Acquisition argument */}
      <section className="bg-white py-12 sm:py-14 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 border-y border-[#C4D2E0]">
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          <div>
            <p className="text-5xl font-serif text-[#143352]" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>0</p>
            <p className="text-sm font-semibold text-[#0E1A2A] mt-2 mb-1">Compute cost</p>
            <p className="text-xs text-[#4A5A6E] leading-relaxed">All assembly happens in your browser. Our server costs are flat. Yours are nothing.</p>
          </div>
          <div>
            <p className="text-5xl font-serif text-[#143352]" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>0</p>
            <p className="text-sm font-semibold text-[#0E1A2A] mt-2 mb-1">Retention</p>
            <p className="text-xs text-[#4A5A6E] leading-relaxed">Nothing you type leaves your browser. No third-party connections allowed by our CSP. Verifiable in DevTools.</p>
          </div>
          <div>
            <p className="text-5xl font-serif text-[#143352]" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>0</p>
            <p className="text-sm font-semibold text-[#0E1A2A] mt-2 mb-1">IT objections</p>
            <p className="text-xs text-[#4A5A6E] leading-relaxed">Compatible with Zscaler, Netskope, Umbrella, Palo Alto. Open-source engine. <a href="/trust" className="underline text-[#143352]">Read the proof →</a></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1F35] py-10 sm:py-12 md:py-14 px-4 sm:px-6 text-center">
        <p className="mb-3 text-sm text-[#C4D2E0]">
          Prompt intelligence powered by{" "}
          <a href="https://krentix.com" target="_blank" rel="noopener noreferrer"
             className="font-semibold text-[#A67C3D] hover:text-[#c9973f] transition-colors underline-offset-2 underline">
            Krentix
          </a>
        </p>
        <p className="text-[11px] text-[#8FA6BC] space-x-3">
          <a href="/for-teams" className="hover:text-[#F5F9FC] transition-colors">For teams</a>
          <span>·</span>
          <a href="/trust" className="hover:text-[#F5F9FC] transition-colors">Trust</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-[#F5F9FC] transition-colors">Privacy</a>
          <span>·</span>
          <a href="https://github.com/joelrobic-gif/prompt-dolphin" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F9FC] transition-colors">
            Open-source engine
          </a>
          <span>·</span>
          <span>No tracking cookies</span>
        </p>
        <p className="text-[10px] text-[#4A5A6E] mt-3">
          Robic Direct Inc. · No third-party connections
        </p>
      </footer>

    </main>
  );
}
