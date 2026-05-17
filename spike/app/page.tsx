"use client";
import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Model = "claude" | "chatgpt" | "gemini" | "copilot" | "grok";
type Archetype =
  | "email" | "strategy" | "meeting" | "slides"
  | "research" | "regulatory" | "investor" | "general";

interface PromptParts {
  role: string;
  context: string;
  task: string;
  format: string;
  constraints: string;
  critique: string;
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
    format: "Meeting objective (1 sentence) | Background (3 bullets) | Key questions to drive (3–5, sharp enough to reach a decision) | Decision framework | Pre-read materials needed",
    constraints: "No generic advice. Maximum one page. Every point must be specific to this exact meeting.",
    critique: "Would a senior leader walk in genuinely prepared? Are the questions sharp enough to force a real decision?",
  },
  slides: {
    role: "a senior strategy consultant who designs Minto pyramid-structured executive presentations",
    context: "Apply the Minto pyramid: answer first, then support with evidence. Story must hold without speaker notes.",
    format: "Insight-titled slides (not descriptive titles) | Maximum 35 words of body copy per slide | Story arc: situation → complication → resolution",
    constraints: "No descriptive slide titles — use insight titles. No slide with more than 35 words of body. No more than 12 slides.",
    critique: "Does each title state the insight, not just the topic? Does the deck flow as a coherent argument without narration?",
  },
  research: {
    role: "a senior research analyst with expertise in synthesizing complex information into clear, actionable insights",
    context: "Synthesize into a coherent argument. Clearly distinguish fact from interpretation. Flag uncertainty.",
    format: "Key findings (3–5 bullets) | Supporting evidence per finding | Implications | Open questions that remain",
    constraints: "No unverified claims. Flag uncertainty explicitly. No more than 400 words.",
    critique: "Is every finding supported by evidence? Are implications clearly stated? Is uncertainty explicitly and honestly flagged?",
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
    critique: "Does this directly answer exactly what was asked? Is every claim specific and defensible? Is there any padding that should be cut?",
  },
};

// ─── Model adapters — each model has optimal idioms ───────────────────────────
function applyAdapter(parts: PromptParts, model: Model): string {
  const { role, context, task, format, constraints, critique } = parts;
  switch (model) {
    case "claude":
      // Claude: XML section tags, critique block, adaptive extended thinking trigger
      return [
        `<role>\n${role}\n</role>`,
        `<context>\nBefore generating, read the task carefully. ${context}\n</context>`,
        `<format>\n${format}\n</format>`,
        `<do_not>\n${constraints}\n</do_not>`,
        `<critique>\nBefore finalizing: ${critique}\nIf any answer is no, identify the specific failure and revise before outputting.\n</critique>`,
        `### New Input:\n${task}`,
      ].join("\n\n");

    case "chatgpt":
      // GPT-5: "You are..." role assertion, markdown headers, numbered constraints
      return [
        `You are ${role}.`,
        `## Task\n${task}`,
        `## Instructions\n${context}`,
        `## Output format\n${format}`,
        `## Constraints\n${constraints}`,
        `## Before you respond\nVerify: ${critique}`,
      ].join("\n\n");

    case "gemini":
      // Gemini Pro: natural language, conversational structure, verification step
      return [
        `You are ${role}.`,
        `Here is my task:\n${task}`,
        context,
        `When you respond, please structure your answer as:\n${format}`,
        `As you work, ensure:\n${constraints}`,
        `Before giving your final answer, verify: ${critique}`,
      ].join("\n\n");

    case "copilot":
      // Copilot/M365: explicit tenant data grounding, markdown section headers
      return [
        `## Role\n${role}`,
        `## Task\n${task}`,
        `## Context\n${context} Reference relevant emails, documents, and calendar items from Microsoft 365 where available.`,
        `## Output format\n${format}`,
        `## Constraints\n${constraints}`,
        `## Quality check before responding\n${critique}`,
      ].join("\n\n");

    case "grok":
      // Grok: terse, direct, no pleasantries, blunt constraint framing
      return [
        `${role}.`,
        `Task: ${task}`,
        context,
        `Format: ${format}`,
        `Avoid: ${constraints}`,
        `Before answering, check: ${critique} Be direct. No sugarcoating.`,
      ].join("\n\n");
  }
}

// ─── Model metadata ───────────────────────────────────────────────────────────
const MODELS: { id: Model; label: string; badge: string; hint: string }[] = [
  {
    id: "claude",
    label: "Claude",
    badge: "XML tags",
    hint: "XML section tags + critique block — Claude's native dialect. Triggers adaptive extended thinking automatically.",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    badge: "Role + headers",
    hint: "'You are...' framing and markdown headers — GPT-5 responds better to explicit role assertion than XML tags.",
  },
  {
    id: "gemini",
    label: "Gemini",
    badge: "Natural flow",
    hint: "Conversational structure with a verification step — Gemini Pro handles natural language better than heavy formatting.",
  },
  {
    id: "copilot",
    label: "Copilot",
    badge: "M365-aware",
    hint: "Explicit Microsoft 365 grounding — unlocks Copilot's ability to reference your Outlook, Teams, and SharePoint data.",
  },
  {
    id: "grok",
    label: "Grok",
    badge: "Direct mode",
    hint: "Terse and blunt — Grok responds better to direct prompts than formal structure or pleasantries.",
  },
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
  const [parts, setParts] = useState<PromptParts | null>(null);
  const [activeModel, setActiveModel] = useState<Model>("claude");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function engineer() {
    if (!task.trim()) return;
    const detected = detectArchetype(task.trim());
    const arch = ARCHETYPES[detected];
    const p: PromptParts = { ...arch, task: task.trim() };
    setParts(p);
    setArchetype(detected);
    setOutput(applyAdapter(p, activeModel));
  }

  function switchModel(model: Model) {
    setActiveModel(model);
    if (parts) setOutput(applyAdapter(parts, model));
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() {
    setTask("");
    setParts(null);
    setOutput("");
    setArchetype(null);
    setCopied(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return (
    <main className="min-h-screen bg-[#FDFCF8] py-14 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[#1F2F4A] mb-2 tracking-tight">
            PromptDolphin
          </h1>
          <p className="text-[#555555] text-base">
            Describe your task. Get a precision-engineered prompt — instantly.
          </p>
          <p className="text-xs text-[#999] mt-1">
            Nothing you type leaves your browser.
          </p>
        </div>

        {/* Input */}
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
            placeholder={`Describe your task in plain language.\n\nExamples:\n"Write an email to my VP asking to delay the Q3 launch by two weeks"\n"Help me decide whether we should expand to Europe next year"\n"Prep me for tomorrow's QBR with our biggest customer"`}
            className="w-full border-2 border-[#D8D2C4] rounded-md p-4 text-[#1A1A1A] text-sm resize-none focus:outline-none focus:border-[#1F2F4A] bg-white leading-relaxed placeholder:text-[#bbb]"
            rows={5}
            autoFocus
          />
          <button
            onClick={engineer}
            disabled={!task.trim()}
            className="mt-3 w-full py-3 bg-[#1F2F4A] text-white rounded-md text-sm font-semibold hover:bg-[#16243a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors tracking-wide"
          >
            Engineer this prompt →
          </button>
          <p className="mt-3 text-center text-[11px] text-[#bbb]">
            Goldfish memory — nothing you type is stored or transmitted.{" "}
            <a href="/trust" className="underline hover:text-[#777] transition-colors">
              Verify
            </a>
          </p>
        </div>

        {/* Output */}
        {output && (
          <div className="mt-10">

            {/* Detected archetype badge */}
            {archetype && (
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs text-[#777]">Detected format:</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#F4EFE2] text-[#A67C3D] font-semibold border border-[#D8D2C4]">
                  {ARCHETYPE_LABELS[archetype]}
                </span>
              </div>
            )}

            {/* Model selector */}
            <div className="mb-4">
              <p className="text-xs text-[#777] mb-2 font-medium uppercase tracking-wider">
                Optimize for your AI
              </p>
              <div className="flex flex-wrap gap-2">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => switchModel(m.id)}
                    title={m.hint}
                    className={`flex flex-col items-start px-3 py-2 rounded-md border text-left transition-all ${
                      activeModel === m.id
                        ? "border-[#1F2F4A] bg-[#1F2F4A] text-white"
                        : "border-[#D8D2C4] bg-white text-[#1A1A1A] hover:border-[#1F2F4A] hover:bg-[#F7F2E8]"
                    }`}
                  >
                    <span className="text-xs font-semibold">{m.label}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        activeModel === m.id ? "text-[#c9973f]" : "text-[#999]"
                      }`}
                    >
                      {m.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt output */}
            <div className="bg-[#F4EFE2] border border-[#D8D2C4] rounded-md p-4 text-sm text-[#1A1A1A] font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {output}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-[#999]">
                Paste into{" "}
                <span className="font-medium text-[#555]">
                  {MODELS.find((m) => m.id === activeModel)?.label}
                </span>
                . Switch models to reformat in{" "}
                <span className="font-medium text-[#555]">&lt;1ms</span>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className="text-xs text-[#aaa] hover:text-[#555] px-2 py-1 transition-colors"
                >
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

            {/* Active model hint */}
            <p className="mt-3 text-[10px] text-[#ccc] text-center leading-relaxed">
              {MODELS.find((m) => m.id === activeModel)?.hint}
            </p>

          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center">
        <p className="text-[11px] text-[#ccc] space-x-3">
          <a href="/trust" className="hover:text-[#777] transition-colors">
            Goldfish memory — nothing stored
          </a>
          <span>·</span>
          <a
            href="https://github.com/joelrobic-gif/prompt-dolphin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#777] transition-colors"
          >
            Open-source engine
          </a>
          <span>·</span>
          <a href="/privacy" className="hover:text-[#777] transition-colors">
            Privacy
          </a>
          <span>·</span>
          <span>No tracking cookies</span>
        </p>
        <p className="text-[10px] text-[#ddd] mt-1">
          Robic Direct Inc. · connect-src: none
        </p>
      </footer>

    </main>
  );
}
