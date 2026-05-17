"use client";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type LLM = "claude" | "copilot";
type Profile = "A" | "B" | "C";
type Archetype = "strategy" | "email";
type Step = 1 | 2 | 3 | 4 | 5;

// ─── Deterministic engine (hardcoded templates for spike) ─────────────────────
function assemble(llm: LLM, profile: Profile, archetype: Archetype, task: string): string {
  const profileInstructions: Record<LLM, Record<Profile, string>> = {
    claude: {
      A: "Rely on your training knowledge. Where uncertain, say so explicitly.",
      B: "Use web search to verify current facts. Cite sources inline.",
      C: "Use admin-granted data connectors. Scan relevant sources before generating.",
    },
    copilot: {
      A: "Use your knowledge base. Flag any assumptions clearly.",
      B: "Search the web for current information. Cite each source.",
      C: "Access connected Microsoft 365 data (Outlook, Teams, SharePoint) to ground your response before generating.",
    },
  };

  if (llm === "claude") {
    if (archetype === "strategy") {
      return `<role>
You are a senior strategy consultant with deep expertise in business planning and organizational design. Your tone is analytical, direct, and evidence-backed.
</role>

<context>
Before generating, review the task below carefully. Apply structured strategic thinking. ${profileInstructions.claude[profile]}
</context>

<format>
- Executive summary (3 sentences max)
- Key strategic options (3–5 bullet points with brief rationale for each)
- Recommended path with clear rationale
- Top 3 risks and mitigations
</format>

<do_not>
- Do not use filler phrases or hedge unnecessarily
- Do not exceed 500 words
- Do not recommend options without rationale
</do_not>

<critique>
Before finalizing: Does this advance a clear strategic position? Is every claim defensible? Is the recommendation actionable? If any answer is no, identify the specific failure and revise.
</critique>

### New Input:
${task}`;
    } else {
      return `<role>
You are a senior executive writing a clear, direct business email. Your voice is professional, concise, and action-oriented.
</role>

<context>
Before generating, note the audience, purpose, and action required. ${profileInstructions.claude[profile]}
</context>

<format>
- Subject line
- Opening sentence (context-setting only — no pleasantries)
- Body (2–3 paragraphs max)
- Clear ask or next step
- Professional sign-off
</format>

<do_not>
- Do not use passive voice
- Do not write more than 250 words
- Do not include "I hope this email finds you well" or similar filler
- Do not leave the ask ambiguous
</do_not>

<critique>
Before finalizing: Is the ask crystal clear? Would a busy executive understand this in 30 seconds? Is the tone right for the audience? If any answer is no, revise.
</critique>

### New Input:
${task}`;
    }
  } else {
    if (archetype === "strategy") {
      return `## Role
You are a senior strategy consultant. Be analytical, direct, and evidence-backed.

## Instructions
${profileInstructions.copilot[profile]}

Analyze the task below and provide:
- **Executive summary** (3 sentences)
- **Key strategic options** (3–5 bullets with brief rationale for each)
- **Recommended path** and why
- **Top risks** and how to mitigate them

## Constraints
- Maximum 500 words
- Every recommendation must have a rationale
- Flag any assumption you are making

## Self-check before responding
Is the recommendation actionable? Is every claim defensible? If not, revise before submitting.

## Task
${task}`;
    } else {
      return `## Role
You are a senior executive writing a professional business email. Be concise, direct, and clear.

## Instructions
${profileInstructions.copilot[profile]}

Write a business email with:
- **Subject line**
- **Opening** (1 sentence, context only — no pleasantries)
- **Body** (2–3 paragraphs)
- **Clear ask or next step**
- **Professional sign-off**

## Constraints
- Maximum 250 words
- No passive voice
- The ask must be unambiguous
- No filler phrases

## Self-check before responding
Is the ask clear in under 30 seconds? Is the tone right for the audience? If not, revise.

## Task
${task}`;
    }
  }
}

// ─── Labels ───────────────────────────────────────────────────────────────────
const LLM_LABELS: Record<LLM, string> = {
  claude: "Claude (Anthropic)",
  copilot: "Microsoft Copilot",
};

const PROFILE_LABELS: Record<Profile, { title: string; description: string }> = {
  A: { title: "Just the AI", description: "Using the AI in a browser tab. No special tools connected." },
  B: { title: "AI + Web & Memory", description: "Your AI can search the web and remember past conversations." },
  C: { title: "AI in Your Work Tools", description: "Copilot in Microsoft 365, or your AI connected to company data." },
};

const ARCHETYPE_LABELS: Record<Archetype, { title: string; description: string }> = {
  strategy: { title: "Strategy Brief", description: "Analyze a situation and recommend a clear path forward." },
  email: { title: "Executive Email", description: "Write a direct business email with a specific ask." },
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [llm, setLlm] = useState<LLM | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [task, setTask] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    if (!llm || !profile || !archetype || !task.trim()) return;
    setOutput(assemble(llm, profile, archetype, task.trim()));
    setStep(5);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() {
    setStep(1); setLlm(null); setProfile(null);
    setArchetype(null); setTask(""); setOutput(""); setCopied(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">PromptDolphin</h1>
          <p className="text-gray-500 text-sm">Turn any task into a ready-to-paste prompt — in 60 seconds.</p>
          <p className="text-xs text-gray-400 mt-1">Nothing you type is saved or sent anywhere.</p>
        </div>

        {/* Step indicator */}
        {step < 5 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                  ${step > s ? "bg-blue-600 text-white" : step === s
                    ? "bg-blue-100 text-blue-700 border border-blue-400"
                    : "bg-gray-200 text-gray-400"}`}>
                  {step > s ? "✓" : s}
                </div>
                {s < 4 && <div className={`w-8 h-px ${step > s ? "bg-blue-400" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Pick LLM */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Which AI are you using?</h2>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(LLM_LABELS) as LLM[]).map((key) => (
                <button key={key}
                  onClick={() => { setLlm(key); setStep(2); }}
                  className="p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <div className="font-medium text-gray-800">{LLM_LABELS[key]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pick profile */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Which best describes your setup?</h2>
            <div className="flex flex-col gap-3">
              {(Object.keys(PROFILE_LABELS) as Profile[]).map((key) => (
                <button key={key}
                  onClick={() => { setProfile(key); setStep(3); }}
                  className="p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <div className="font-semibold text-gray-800">{PROFILE_LABELS[key].title}</div>
                  <div className="text-sm text-gray-500 mt-1">{PROFILE_LABELS[key].description}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">← Back</button>
          </div>
        )}

        {/* Step 3: Pick archetype */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">What type of task is this?</h2>
            <div className="flex flex-col gap-3">
              {(Object.keys(ARCHETYPE_LABELS) as Archetype[]).map((key) => (
                <button key={key}
                  onClick={() => { setArchetype(key); setStep(4); }}
                  className="p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <div className="font-semibold text-gray-800">{ARCHETYPE_LABELS[key].title}</div>
                  <div className="text-sm text-gray-500 mt-1">{ARCHETYPE_LABELS[key].description}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">← Back</button>
          </div>
        )}

        {/* Step 4: Describe task */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Describe your task in one sentence.</h2>
            <p className="text-sm text-gray-400 mb-4">
              Example: &ldquo;Write an email to my VP asking to delay the Q3 launch by two weeks.&rdquo;
            </p>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && task.trim()) { e.preventDefault(); generate(); } }}
              placeholder="What do you need the AI to do?"
              className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-800 text-sm resize-none focus:outline-none focus:border-blue-400"
              rows={4}
              autoFocus
            />
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setStep(3)} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
              <button
                onClick={generate}
                disabled={!task.trim()}
                className="ml-auto px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Generate prompt →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Output */}
        {step === 5 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Your prompt is ready.</h2>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all min-w-[110px]">
                {copied ? "✓ Copied!" : "Copy prompt"}
              </button>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-gray-200">
              {output}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Paste directly into {llm ? LLM_LABELS[llm] : "your AI"}.
              </p>
              <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">Start over</button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
