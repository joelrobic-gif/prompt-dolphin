"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  engineer,
  QUALITY_AXIS,
  QUALITY_AXIS_ORDER,
  ADAPTER_ORDER,
  ADAPTERS,
  ARCHETYPES,
  type AdapterId,
  type QualityId,
  type EngineerResult,
} from "@/lib/engine-v2";

// Build feedback payload — privacy-first.
// Includes: rating, free-text feedback, archetype/quality/adapter that were selected,
// pre-flight status. Explicitly EXCLUDES task text and user constraints.
function buildFeedbackPayload(args: {
  rating: number;
  feedbackText: string;
  task: string;
  result: EngineerResult | null;
  userConstraints: string;
}): string {
  const lines: string[] = [];
  lines.push("# PromptDolphin feedback");
  lines.push("");
  lines.push(`Rating: ${args.rating > 0 ? `${args.rating}/5` : "(not rated)"}`);
  lines.push("");
  lines.push("## Feedback");
  lines.push(args.feedbackText.trim() || "(no comment)");
  lines.push("");
  lines.push("## Session context (no PII — config only)");
  if (args.result) {
    lines.push(`- Detected archetype: ${args.result.archetype}`);
    if (args.result.classification.runnerUp) {
      lines.push(`- Runner-up: ${args.result.classification.runnerUp}`);
    }
    lines.push(`- Quality preset: ${args.result.quality}`);
    lines.push(`- Adapter (model): ${args.result.adapter}`);
    lines.push(`- Pre-flight: ${args.result.preflight.passed ? "passed" : "FAILED"}`);
    if (!args.result.preflight.passed) {
      for (const i of args.result.preflight.issues) {
        lines.push(`  - [${i.severity}] ${i.code}: ${i.message}`);
      }
    }
    lines.push(`- Engineered prompt length: ${args.result.engineered.length} chars`);
  } else {
    lines.push("(no result generated yet)");
  }
  lines.push(`- Task length: ${args.task.length} chars (content withheld)`);
  lines.push(`- User constraints count: ${args.userConstraints.split("\n").filter((s) => s.trim()).length} (content withheld)`);
  lines.push("");
  lines.push(`Engine version: v2.0.0`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  return lines.join("\n");
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [task, setTask] = useState("");
  const [quality, setQuality] = useState<QualityId>("fast_detailed");
  const [adapter, setAdapter] = useState<AdapterId>("claude");
  const [userConstraints, setUserConstraints] = useState("");
  const [result, setResult] = useState<EngineerResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  // Feedback widget — privacy-first (mailto/clipboard, no server)
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [feedbackStatus, setFeedbackStatus] = useState<"" | "copied" | "emailed">("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse user constraints (one per line)
  const constraintsList = useMemo(
    () => userConstraints.split("\n").map((s) => s.trim()).filter(Boolean),
    [userConstraints]
  );

  // Re-engineer whenever any control changes after first generation
  useEffect(() => {
    if (!result) return;
    const r = engineer(task.trim(), {
      adapter,
      quality,
      userConstraints: constraintsList,
    });
    setResult(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, quality, userConstraints]);

  function run() {
    if (!task.trim()) return;
    const r = engineer(task.trim(), {
      adapter,
      quality,
      userConstraints: constraintsList,
    });
    setResult(r);
    setTimeout(() => {
      document.getElementById("output")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result.engineered).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() {
    setTask("");
    setResult(null);
    setUserConstraints("");
    setRefineOpen(false);
    setQuality("fast_detailed");
    setAdapter("claude");
    setCopied(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      document.getElementById("input-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  return (
    <main className="min-h-screen bg-[#F5F9FC]">

      {/* Hero */}
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

      {/* App */}
      <section id="input-section" className="py-8 sm:py-10 md:py-12 lg:py-14 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-2xl md:max-w-3xl mx-auto">

          <div className="text-center mb-6 md:mb-8">
            <p className="text-[#4A5A6E] text-sm md:text-base">
              Describe your task. Pick how much depth you need. PromptDolphin returns a paste-ready prompt tuned to your model.{" "}
              <span className="font-semibold text-[#143352]">60 seconds. Free. Nothing leaves your browser.</span>
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
                  run();
                }
              }}
              placeholder={`Examples:
"Write an email to my VP asking to delay the Q3 launch by two weeks"
"Should we expand to Europe next year?"
"Prep me for tomorrow's QBR with our biggest customer"
"Build me a prompt I can reuse weekly to summarize my team standups"`}
              className="w-full border-2 border-[#C4D2E0] rounded-md p-4 text-[#0E1A2A] text-sm resize-none focus:outline-none focus:border-[#143352] bg-white leading-relaxed placeholder:text-[#8FA6BC] shadow-sm"
              rows={5}
              autoFocus
            />
          </div>

          {/* Quality Axis — PRIMARY CONTROL */}
          <div className="mt-5">
            <p className="text-xs text-[#4A5A6E] mb-2 font-semibold uppercase tracking-wider">
              How much depth do you want?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {QUALITY_AXIS_ORDER.map((qid) => {
                const q = QUALITY_AXIS[qid];
                const active = quality === qid;
                return (
                  <button
                    key={qid}
                    onClick={() => setQuality(qid)}
                    title={q.blurb}
                    className={`flex flex-col items-start px-3 py-2 rounded-md border text-left transition-all ${
                      active
                        ? "border-[#143352] bg-[#143352] text-white shadow-sm"
                        : "border-[#C4D2E0] bg-white text-[#0E1A2A] hover:border-[#143352] hover:bg-[#E8EFF5]"
                    }`}
                  >
                    <span className="text-xs font-semibold leading-tight">{q.label}</span>
                    <span className={`text-[10px] mt-0.5 leading-snug ${active ? "text-[#A67C3D]" : "text-[#4A5A6E]"}`}>
                      {q.blurb.split(".")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model adapter row */}
          <div className="mt-4">
            <p className="text-xs text-[#4A5A6E] mb-2 font-semibold uppercase tracking-wider">
              Which AI will you paste this into?
            </p>
            <div className="flex flex-wrap gap-2">
              {ADAPTER_ORDER.map((aid) => {
                const a = ADAPTERS[aid];
                const active = adapter === aid;
                return (
                  <button
                    key={aid}
                    onClick={() => setAdapter(aid)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-semibold transition-all ${
                      active
                        ? "border-[#143352] bg-[#143352] text-white"
                        : "border-[#C4D2E0] bg-white text-[#0E1A2A] hover:border-[#143352] hover:bg-[#E8EFF5]"
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engineer button */}
          <button
            onClick={run}
            disabled={!task.trim()}
            className="mt-5 w-full py-3 bg-[#143352] text-white rounded-md text-sm font-semibold hover:bg-[#0A1F35] disabled:opacity-40 disabled:cursor-not-allowed transition-colors tracking-wide"
          >
            Engineer this prompt →
          </button>

          <p className="mt-3 text-center text-[11px] text-[#8FA6BC]">
            🐟 Goldfish memory — nothing you type is stored or transmitted.{" "}
            <a href="/trust" className="underline hover:text-[#143352] transition-colors">
              Verify
            </a>
          </p>

          {/* Output */}
          {result && (
            <div id="output" className="mt-10">

              {/* Header: archetype chip + preflight badge */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-[#4A5A6E]">Detected:</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#E8EFF5] text-[#A67C3D] font-semibold border border-[#C4D2E0]">
                  {ARCHETYPES[result.archetype].label}
                </span>
                {result.classification.runnerUp && (
                  <span className="text-[10px] text-[#8FA6BC]">
                    (runner-up: {ARCHETYPES[result.classification.runnerUp].label})
                  </span>
                )}
                <span className="text-xs text-[#4A5A6E] ml-2">·</span>
                <span className="text-xs text-[#4A5A6E]">Depth:</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#E8EFF5] text-[#143352] font-semibold border border-[#C4D2E0]">
                  {QUALITY_AXIS[result.quality].label}
                </span>
                <span className="text-xs text-[#4A5A6E] ml-2">·</span>
                {result.preflight.passed ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#E8F5EC] text-[#1F6F4F] font-semibold border border-[#A8D5BA]" title="Pre-flight self-check passed">
                    ✓ Pre-flight
                  </span>
                ) : (
                  <span
                    className="text-xs px-2 py-0.5 rounded bg-[#FBEAE8] text-[#8B3A2E] font-semibold border border-[#E4B5AE]"
                    title={result.preflight.issues.map((i) => i.message).join(" / ")}
                  >
                    ✕ Pre-flight ({result.preflight.issues.filter((i) => i.severity === "high").length})
                  </span>
                )}
              </div>

              {/* Engineered prompt */}
              <div className="bg-[#0A1F35] border border-[#143352] rounded-md p-5 text-sm text-[#F5F9FC] font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto shadow-lg">
                {result.engineered}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <p className="text-xs text-[#4A5A6E] leading-relaxed">
                  Paste into{" "}
                  <span className="font-semibold text-[#143352]">{ADAPTERS[adapter].label}</span>.
                  Switch depth or model to re-render in{" "}
                  <span className="font-semibold text-[#143352]">&lt;1 ms</span>.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={reset} className="text-xs text-[#8FA6BC] hover:text-[#143352] px-2 py-1 transition-colors">
                    Start over
                  </button>
                  <button
                    onClick={copy}
                    className="px-4 py-2 bg-[#A67C3D] text-white rounded-md text-xs font-semibold hover:bg-[#8a6530] transition-colors min-w-[110px]"
                  >
                    {copied ? "✓ Copied" : "Copy prompt"}
                  </button>
                </div>
              </div>

              {/* Refine */}
              <div className="mt-6">
                <button
                  onClick={() => setRefineOpen(!refineOpen)}
                  className="flex items-center gap-2 text-xs text-[#143352] font-semibold uppercase tracking-wider hover:text-[#0A1F35] transition-colors"
                >
                  <span className="inline-block w-4 text-center">{refineOpen ? "−" : "+"}</span>
                  Refine
                </button>
                {refineOpen && (
                  <div className="mt-3 p-5 bg-white border border-[#C4D2E0] rounded-md space-y-4">
                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        Constraints to preserve verbatim (one per line)
                      </label>
                      <textarea
                        value={userConstraints}
                        onChange={(e) => setUserConstraints(e.target.value)}
                        placeholder={`Use named panel of 5 experts
Cite every source
Output in French`}
                        className="w-full border border-[#C4D2E0] rounded-md p-2 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352] font-mono leading-relaxed placeholder:text-[#8FA6BC]"
                        rows={4}
                      />
                      <p className="text-[10px] text-[#8FA6BC] mt-1.5">
                        These are injected verbatim into the engineered prompt&apos;s exclusions block. Pre-flight verifies preservation.
                      </p>
                    </div>

                    {!result.preflight.passed && (
                      <div className="border border-[#E4B5AE] bg-[#FBEAE8] rounded-md p-3">
                        <p className="text-xs font-semibold text-[#8B3A2E] mb-1.5">Pre-flight issues:</p>
                        <ul className="text-xs text-[#0E1A2A] space-y-1">
                          {result.preflight.issues.map((i, idx) => (
                            <li key={idx}>
                              <span className={`font-semibold ${i.severity === "high" ? "text-[#8B3A2E]" : "text-[#A67C3D]"}`}>
                                [{i.severity}]
                              </span>{" "}
                              {i.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-[10px] text-[#8FA6BC] pt-2 border-t border-[#C4D2E0]">
                      Any change re-engineers the prompt instantly. Still client-side. Still zero retention.
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback widget — privacy-first, no server */}
              <div className="mt-6">
                <button
                  onClick={() => setFeedbackOpen(!feedbackOpen)}
                  className="flex items-center gap-2 text-xs text-[#143352] font-semibold uppercase tracking-wider hover:text-[#0A1F35] transition-colors"
                >
                  <span className="inline-block w-4 text-center">{feedbackOpen ? "−" : "+"}</span>
                  Give feedback
                  {rating > 0 && <span className="text-[#A67C3D]">★ {rating}/5</span>}
                </button>

                {feedbackOpen && (
                  <div className="mt-3 p-5 bg-white border border-[#C4D2E0] rounded-md space-y-4">
                    <p className="text-xs text-[#4A5A6E] leading-relaxed">
                      Help us make this better. Rate the engineered prompt and tell us what you would change. Nothing transmits until you click <strong>Email</strong> or <strong>Copy</strong> — both routes stay on your machine.
                    </p>

                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        Quality rating
                      </label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setRating(n === rating ? 0 : n)}
                            className={`w-9 h-9 rounded-md border text-base font-bold transition-colors ${
                              n <= rating
                                ? "border-[#A67C3D] bg-[#A67C3D] text-white"
                                : "border-[#C4D2E0] bg-white text-[#8FA6BC] hover:border-[#A67C3D]"
                            }`}
                            aria-label={`${n} star${n > 1 ? "s" : ""}`}
                          >
                            ★
                          </button>
                        ))}
                        {rating > 0 && (
                          <button
                            onClick={() => setRating(0)}
                            className="text-[10px] text-[#8FA6BC] hover:text-[#143352] px-2"
                          >
                            clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        What worked? What didn&apos;t? What would you change?
                      </label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder={`Examples:
"Wrong archetype detected — this was a meeting prep not an email"
"Quality axis label 'Strategic depth' confused me — what does it actually output?"
"The pre-flight badge is great, more of that"
"Add a German adapter"`}
                        className="w-full border border-[#C4D2E0] rounded-md p-3 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352] leading-relaxed placeholder:text-[#8FA6BC]"
                        rows={5}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          const body = buildFeedbackPayload({
                            rating, feedbackText, task, result, userConstraints,
                          });
                          const subject = `PromptDolphin feedback${rating ? ` (${rating}/5)` : ""}`;
                          const href = `mailto:feedback@promptdolphin.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                          window.location.href = href;
                          setFeedbackStatus("emailed");
                          setTimeout(() => setFeedbackStatus(""), 3000);
                        }}
                        disabled={!feedbackText.trim() && rating === 0}
                        className="flex-1 px-4 py-2 bg-[#143352] text-white rounded-md text-xs font-semibold hover:bg-[#0A1F35] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {feedbackStatus === "emailed" ? "✓ Email opened" : "Send via your email"}
                      </button>
                      <button
                        onClick={() => {
                          const body = buildFeedbackPayload({
                            rating, feedbackText, task, result, userConstraints,
                          });
                          navigator.clipboard.writeText(body).then(() => {
                            setFeedbackStatus("copied");
                            setTimeout(() => setFeedbackStatus(""), 3000);
                          });
                        }}
                        disabled={!feedbackText.trim() && rating === 0}
                        className="flex-1 px-4 py-2 bg-white border border-[#143352] text-[#143352] rounded-md text-xs font-semibold hover:bg-[#E8EFF5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {feedbackStatus === "copied" ? "✓ Copied" : "Copy to clipboard"}
                      </button>
                    </div>

                    <p className="text-[10px] text-[#8FA6BC] pt-2 border-t border-[#C4D2E0] leading-relaxed">
                      We bundle your feedback with the archetype, depth, and model that were selected — so we can debug without seeing your task content. <strong>Your task text and any constraints are NOT included.</strong> Verify by clicking Copy first.
                    </p>
                  </div>
                )}
              </div>

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
          <a href="https://github.com/joelrobic-gif/promptdolphin-engine" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F9FC] transition-colors">
            Open-source engine
          </a>
          <span>·</span>
          <span>No tracking cookies</span>
        </p>
        <p className="text-[10px] text-[#4A5A6E] mt-3">
          Robic Direct Inc. · No third-party connections · Engine v2.0
        </p>
      </footer>

    </main>
  );
}
