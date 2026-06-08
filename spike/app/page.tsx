"use client";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  QUALITY_AXIS,
  ARCHETYPES,
  OUTPUT_FORMATS,
  OUTPUT_FORMAT_ORDER,
  type AdapterId,
  type QualityId,
  type OutputFormatId,
} from "@/lib/engine-v2";

const UI_QUALITY_ORDER: QualityId[] = ['quick_verdict', 'comprehensive', 'exhaustive_research'];
import {
  engineerV3 as engineer,
  type EngineerV3Result as EngineerResult,
} from "@/lib/engine-v3";
import {
  LANGUAGES,
  LANGUAGE_ORDER,
  TRANSLATIONS,
  t as translate,
  detectInitialLang,
  persistLang,
  type LangId,
} from "@/lib/i18n";
import {
  parseSegments,
  SEGMENT_EXPLAINS,
  type Segment,
  type SegmentKind,
} from "@/lib/explain";
import { LEXICON } from "@/lib/lexicon";
import { defaultHeroImage } from "@/lib/hero-images";

// Build feedback payload — privacy-first.
function buildFeedbackPayload(args: {
  rating: number;
  feedbackText: string;
  task: string;
  result: EngineerResult | null;
  userConstraints: string;
  lang: LangId;
}): string {
  const lines: string[] = [];
  lines.push("# PromptDolphin feedback");
  lines.push("");
  lines.push(`Rating: ${args.rating > 0 ? `${args.rating}/5` : "(not rated)"}`);
  lines.push(`UI language: ${args.lang}`);
  lines.push("");
  lines.push("## Feedback");
  lines.push(args.feedbackText.trim() || "(no comment)");
  lines.push("");
  lines.push("## Session context (no PII — config only)");
  if (args.result) {
    lines.push(`- Detected archetype: ${args.result.archetype}`);
    if (args.result.classification.secondary) {
      lines.push(`- Composite secondary: ${args.result.classification.secondary}`);
    }
    lines.push(`- Classifier confidence: ${args.result.classification.confidence}`);
    lines.push(`- Self-eval: ${args.result.selfEval.scaled.toFixed(1)}/12 (total ${args.result.selfEval.total}/120)`);
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
  const [quality, setQuality] = useState<QualityId>("comprehensive");
  const adapter: AdapterId = 'chatgpt';
  // Default to HTML — the most impressive showcase format for first-time users.
  // Users still freely switch via dropdown; text/markdown/etc are one click away.
  const [outputFormat, setOutputFormat] = useState<OutputFormatId>("html");
  const [userConstraints, setUserConstraints] = useState("");
  const [result, setResult] = useState<EngineerResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  // Language
  const [lang, setLang] = useState<LangId>("en");
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  // Educational format section toggle
  const [formatsOpen, setFormatsOpen] = useState(false);
  // Hero image
  const heroSrc = defaultHeroImage();
  const heroAlt = 'A dolphin leaping out of the ocean at speed';
  // Engineered prompt explain
  const [activeSegmentIdx, setActiveSegmentIdx] = useState<number | null>(null);
  const [showLong, setShowLong] = useState(false);
  // Voice input
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string>("");
  const [voiceInterim, setVoiceInterim] = useState<string>("");
  const recognitionRef = useRef<unknown>(null);
  const taskBeforeMicRef = useRef<string>("");
  // Feedback widget
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [feedbackStatus, setFeedbackStatus] = useState<"" | "copied" | "emailed">("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);

  const T = useMemo(() => (k: Parameters<typeof translate>[0]) => translate(k, lang), [lang]);
  const dir = LANGUAGES[lang].dir;

  // Detect initial language client-side after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const detected = detectInitialLang();
    setLang(detected);
  }, []);


  // Persist lang + update <html> dir/lang
  useEffect(() => {
    persistLang(lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);

  // Parallax hero — translate + scale dolphin image with scroll
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const el = heroImgRef.current?.querySelector("img");
        if (el) {
          // Parallax: image moves down ~25% of scroll, scales up slightly
          // Subtle so it feels premium not gimmicky
          const translate = Math.min(y * 0.28, 200);
          const scale = 1 + Math.min(y * 0.00015, 0.06);
          (el as HTMLElement).style.transform = `translate3d(0, ${translate}px, 0) scale(${scale})`;
          (el as HTMLElement).style.willChange = "transform";
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const constraintsList = useMemo(
    () => userConstraints.split("\n").map((s) => s.trim()).filter(Boolean),
    [userConstraints]
  );

  // Parse segments for the active engineered prompt
  const segments = useMemo<Segment[]>(() => {
    if (!result) return [];
    return parseSegments(result.engineered, result.adapter);
  }, [result]);

  // Detect Web Speech API availability
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  const toggleMic = useCallback(() => {
    if (typeof window === "undefined") return;
    type SRResult = { isFinal: boolean; readonly length: number; 0: { transcript: string } };
    type SRResultList = { readonly length: number; [i: number]: SRResult };
    type SREvent = { resultIndex: number; results: SRResultList };
    type SRInstance = {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      maxAlternatives: number;
      onresult: (e: SREvent) => void;
      onerror: (e: { error: string; message?: string }) => void;
      onend: () => void;
      onstart: () => void;
      onspeechstart?: () => void;
      onspeechend?: () => void;
      onnomatch?: () => void;
      start: () => void;
      stop: () => void;
      abort: () => void;
    };
    type SRConstructor = new () => SRInstance;
    const SR = ((window as unknown as { SpeechRecognition?: SRConstructor }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: SRConstructor }).webkitSpeechRecognition) as SRConstructor | undefined;
    if (!SR) {
      setVoiceError("Voice input not supported in this browser. Try Chrome, Edge, or Safari (latest).");
      return;
    }

    // If already listening, stop and finalize
    if (isListening && recognitionRef.current) {
      try { (recognitionRef.current as SRInstance).stop(); } catch { /* ignore */ }
      setIsListening(false);
      return;
    }

    // BCP-47 with regional fallbacks. The Web Speech API on Chrome uses Google's server-side
    // recognizer which accepts variants per language. Picking widely-supported codes.
    const bcp47Map: Record<string, string> = {
      en: "en-US",
      fr: "fr-FR",
      es: "es-ES",
      de: "de-DE",
      it: "it-IT",
      pt: "pt-BR",      // Brazilian Portuguese has stronger Web Speech support than pt-PT in practice
      nl: "nl-NL",
      ja: "ja-JP",
      "zh-CN": "cmn-Hans-CN",  // Standard Mandarin, simplified, China
      "zh-TW": "cmn-Hant-TW",  // Standard Mandarin, traditional, Taiwan
      ko: "ko-KR",
      ar: "ar-SA",
      ru: "ru-RU",
      pl: "pl-PL",
    };

    const recognition = new SR();
    recognition.lang = bcp47Map[lang] || "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;  // keep listening across pauses; user clicks to stop
    recognition.maxAlternatives = 1;

    // Anchor: capture the task content BEFORE mic starts. Final transcripts append to anchor;
    // interim transcripts render after anchor but get replaced on each new chunk.
    taskBeforeMicRef.current = task;
    let committed = task;  // tracks anchor + already-finalized speech
    setVoiceError("");
    setVoiceInterim("");

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (e) => {
      let interim = "";
      // Only walk results from e.resultIndex onward. Prior indices have already been processed.
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          committed = committed.trim()
            ? committed.trim() + " " + piece.trim()
            : piece.trim();
        } else {
          interim += piece;
        }
      }
      // Push committed (anchor + finals) to task. Interim shown separately.
      setTask(committed);
      setVoiceInterim(interim);
    };

    recognition.onerror = (e) => {
      const errMap: Record<string, string> = {
        "not-allowed": "Microphone permission denied. Click the mic icon in your browser's address bar to allow.",
        "service-not-allowed": "Browser blocked the speech service. Check your site settings.",
        "no-speech": "No speech detected — try again, speak closer to the mic.",
        "audio-capture": "No microphone found. Check your audio input device.",
        "network": "Network error reaching the speech service. Try again.",
        "aborted": "",  // expected on stop()
        "language-not-supported": `Language ${recognition.lang} not supported by your browser's speech service. Try a different UI language or use Chrome.`,
      };
      const msg = errMap[e.error] !== undefined ? errMap[e.error] : `Speech error: ${e.error}`;
      if (msg) setVoiceError(msg);
      setIsListening(false);
      setVoiceInterim("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceInterim("");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      // onstart will flip isListening to true; set optimistically too for snappy UI
      setIsListening(true);
    } catch (err) {
      setIsListening(false);
      setVoiceError(`Could not start mic: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }, [isListening, lang, task]);

  useEffect(() => {
    if (!result) return;
    const r = engineer(task.trim(), {
      adapter,
      quality,
      outputFormat,
      userConstraints: constraintsList,
    });
    setResult(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, outputFormat, userConstraints]);

  function run() {
    if (!task.trim()) return;
    const r = engineer(task.trim(), {
      adapter,
      quality,
      outputFormat,
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
    setQuality("comprehensive");
    setOutputFormat("text");
    setCopied(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      document.getElementById("input-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  return (
    <main className="min-h-screen bg-[#F5F9FC]" dir={dir}>

      {/* Hero (parallax) */}
      <section
        ref={heroImgRef}
        className="relative w-full h-[60vh] min-h-[380px] sm:min-h-[420px] md:min-h-[480px] max-h-[720px] overflow-hidden"
      >
        <Image
          src={heroSrc}
          alt={heroAlt}
          fill priority sizes="100vw"
          className="object-cover transition-none"
          quality={85}
          style={{ transform: "translate3d(0,0,0) scale(1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F35]/80 via-[#0A1F35]/45 to-[#0A1F35]/10 pointer-events-none" />

        {/* Language picker — top right corner. Wrapper uses `fixed` so the
            dropdown escapes the hero `overflow-hidden` clip. Without this,
            the menu was clipped at the hero bottom and appeared "cut off". */}
        <div className={`fixed top-3 sm:top-4 md:top-5 ${dir === 'rtl' ? 'left-3 sm:left-4 md:left-6' : 'right-3 sm:right-4 md:right-6'} z-50`}>
          <div className="relative">
            <button
              onClick={() => {
                const next = !langOpen;
                setLangOpen(next);
                if (!next) setLangSearch("");
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0A1F35]/70 hover:bg-[#0A1F35]/90 backdrop-blur-sm text-[#F5F9FC] rounded-md text-xs font-semibold border border-[#F5F9FC]/20 transition-all"
              aria-label={T("lang_picker_label")}
              aria-expanded={langOpen}
            >
              <span className="text-base leading-none">{LANGUAGES[lang].flag}</span>
              <span>{LANGUAGES[lang].native}</span>
              <span className="text-[#A67C3D] text-[10px]">▾</span>
            </button>

            {langOpen && (() => {
              const q = langSearch.trim().toLowerCase();
              const filtered = q.length === 0
                ? LANGUAGE_ORDER
                : LANGUAGE_ORDER.filter((id) => {
                    const m = LANGUAGES[id];
                    return (
                      id.toLowerCase().includes(q) ||
                      m.label.toLowerCase().includes(q) ||
                      m.native.toLowerCase().includes(q)
                    );
                  });
              return (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setLangOpen(false); setLangSearch(""); }}
                    aria-hidden="true"
                  />
                  <div
                    className={`absolute top-full mt-1.5 ${dir === 'rtl' ? 'left-0' : 'right-0'} z-50 bg-[#0A1F35] border border-[#F5F9FC]/20 rounded-md shadow-xl min-w-[220px] flex flex-col`}
                    style={{ maxHeight: 'min(70vh, 480px)' }}
                  >
                    {/* Search input — sticky at top, NOT inside scrollable list */}
                    <div className="p-2 border-b border-[#F5F9FC]/10 flex-shrink-0">
                      <input
                        type="text"
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        placeholder="Search…"
                        autoFocus
                        className="w-full px-2 py-1.5 bg-[#143352] border border-[#F5F9FC]/15 rounded text-xs text-[#F5F9FC] placeholder-[#F5F9FC]/40 focus:outline-none focus:border-[#A67C3D]/60"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setLangOpen(false);
                            setLangSearch("");
                          } else if (e.key === 'Enter' && filtered.length > 0) {
                            setLang(filtered[0]);
                            setLangOpen(false);
                            setLangSearch("");
                          }
                        }}
                      />
                    </div>
                    {/* Scrollable list */}
                    <ul
                      className="overflow-y-auto flex-1"
                      role="listbox"
                      aria-label={T("lang_picker_label")}
                    >
                      {filtered.length === 0 ? (
                        <li className="px-3 py-2 text-xs text-[#F5F9FC]/50 italic">No language matches</li>
                      ) : filtered.map((id) => {
                        const meta = LANGUAGES[id];
                        const active = id === lang;
                        return (
                          <li key={id}>
                            <button
                              onClick={() => {
                                setLang(id);
                                setLangOpen(false);
                                setLangSearch("");
                              }}
                              role="option"
                              aria-selected={active}
                              className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-start transition-colors ${
                                active
                                  ? "bg-[#143352] text-[#A67C3D] font-semibold"
                                  : "text-[#F5F9FC] hover:bg-[#143352]/60"
                              }`}
                            >
                              <span className="text-base leading-none">{meta.flag}</span>
                              <span className="flex-1">{meta.native}</span>
                              <span className="text-[#F5F9FC]/40 text-[10px]">{meta.label}</span>
                              {active && <span className="text-[#A67C3D]">✓</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Headline */}
        <div className="absolute inset-0 flex items-end pb-6 sm:pb-8 md:pb-10 pointer-events-none">
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 md:px-10 lg:px-16">
            <h1
              className="text-[#F5F9FC] font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight max-w-[26ch]"
              style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}
            >
              {T("hero_lead")}{" "}
              <span className="text-[#A67C3D]">{T("hero_emphasis")}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* App */}
      <section id="input-section" className="py-8 sm:py-10 md:py-12 lg:py-14 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-2xl md:max-w-3xl mx-auto">

          <div className="text-center mb-6 md:mb-8">
            <p className="text-[#4A5A6E] text-sm md:text-base">
              {T("subhead_lead")}{" "}
              <span className="font-semibold text-[#143352]">{T("subhead_emphasis")}</span>
            </p>
          </div>

          {/* Input */}
          <div className="relative">
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
              placeholder={T("input_placeholder")}
              className={`w-full border-2 border-[#C4D2E0] rounded-lg p-4 ${voiceSupported ? "pe-14" : ""} text-[#0E1A2A] text-base sm:text-sm resize-none focus:outline-none focus:border-[#143352] focus:ring-2 focus:ring-[#A67C3D]/20 focus:shadow-md bg-white leading-relaxed placeholder:text-[#8FA6BC] shadow-sm transition-shadow`}
              rows={5}
              autoFocus
              dir={dir}
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleMic}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                aria-pressed={isListening}
                className={`absolute top-3 ${dir === 'rtl' ? 'left-3' : 'right-3'} w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-[#8B3A2E] text-white shadow-md ring-2 ring-[#8B3A2E]/40 animate-pulse"
                    : "bg-[#F5F9FC] text-[#143352] border border-[#C4D2E0] hover:border-[#143352] hover:bg-[#E8EFF5]"
                }`}
                title={isListening ? "Tap to stop" : "Tap to dictate"}
              >
                {isListening ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                    <rect width="14" height="14" rx="2" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
            )}
            {isListening && (
              <p className={`absolute -bottom-5 ${dir === 'rtl' ? 'right-2' : 'left-2'} text-[10px] text-[#8B3A2E] font-semibold flex items-center gap-1`}>
                <span className="inline-block w-2 h-2 rounded-full bg-[#8B3A2E] animate-pulse" aria-hidden="true" />
                listening · {LANGUAGES[lang].native}
                {voiceInterim && <span className="ms-1 text-[#4A5A6E] font-normal italic">&ldquo;{voiceInterim.slice(0, 60)}{voiceInterim.length > 60 ? "…" : ""}&rdquo;</span>}
              </p>
            )}
          </div>
          {voiceError && (
            <div className="mt-2 text-xs text-[#8B3A2E] bg-[#FBEAE8] border border-[#E4B5AE] rounded-md px-3 py-2 flex items-start justify-between gap-2">
              <span className="flex-1">⚠ {voiceError}</span>
              <button onClick={() => setVoiceError("")} className="text-[#8B3A2E] hover:text-[#0E1A2A] shrink-0" aria-label="Dismiss">×</button>
            </div>
          )}

          {/* Quality Axis — PRIMARY CONTROL */}
          <div className="mt-5">
            <p className="text-xs text-[#4A5A6E] mb-2 font-semibold uppercase tracking-wider">
              {T("depth_heading")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {UI_QUALITY_ORDER.map((qid) => {
                const active = quality === qid;
                const labelKey = (
                  qid === "quick_verdict" ? "q_quick_label"
                  : qid === "fast_detailed" ? "q_fast_label"
                  : qid === "comprehensive" ? "q_comp_label"
                  : qid === "strategic_depth" ? "q_strat_label"
                  : "q_exh_label"
                ) as Parameters<typeof translate>[0];
                const blurbKey = (
                  qid === "quick_verdict" ? "q_quick_blurb"
                  : qid === "fast_detailed" ? "q_fast_blurb"
                  : qid === "comprehensive" ? "q_comp_blurb"
                  : qid === "strategic_depth" ? "q_strat_blurb"
                  : "q_exh_blurb"
                ) as Parameters<typeof translate>[0];
                return (
                  <button
                    key={qid}
                    onClick={() => setQuality(qid)}
                    title={T(blurbKey)}
                    className={`pd-lift relative flex flex-col items-start px-3 py-2.5 rounded-lg border text-start ${
                      active
                        ? "border-[#A67C3D] bg-gradient-to-br from-[#143352] to-[#0A1F35] text-white shadow-md ring-1 ring-[#A67C3D]/30"
                        : "border-[#C4D2E0] bg-white text-[#0E1A2A] hover:border-[#143352] hover:bg-[#E8EFF5] hover:shadow-sm"
                    }`}
                  >
                    {active && (
                      <span className={`absolute top-1 ${dir === 'rtl' ? 'start-1.5' : 'end-1.5'} text-[10px] text-[#D4A85F]`} aria-hidden="true">✓</span>
                    )}
                    <span className="text-xs font-semibold leading-tight">{T(labelKey)}</span>
                    <span className={`text-[10px] mt-0.5 leading-snug ${active ? "text-[#D4A85F]" : "text-[#4A5A6E]"}`}>
                      {T(blurbKey).split(".")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Output format — compact dropdown */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <label htmlFor="format-select" className="text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider shrink-0">
              {T("format_heading")}
            </label>
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <select
                id="format-select"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormatId)}
                className="flex-1 border border-[#C4D2E0] rounded-md px-2.5 py-1.5 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352] cursor-pointer"
              >
                {OUTPUT_FORMAT_ORDER.map((fid) => {
                  const f = OUTPUT_FORMATS[fid];
                  const prefix = f.recommended ? '✨ ' : '';
                  const suffix = f.timeEstimate ? `  ·  ${f.timeEstimate}` : '';
                  const recTag = f.recommended ? '  ·  Recommended' : '';
                  return (
                    <option key={fid} value={fid}>
                      {prefix}{f.icon} · {f.label}{recTag}{suffix}
                    </option>
                  );
                })}
              </select>
              <a
                href="#formats-explained"
                onClick={(e) => {
                  e.preventDefault();
                  setFormatsOpen(true);
                  setTimeout(() => {
                    document.getElementById("formats-explained")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 80);
                }}
                className="text-[10px] text-[#A67C3D] hover:text-[#8a6530] underline whitespace-nowrap"
              >
                what&apos;s this?
              </a>
            </div>
          </div>
          {outputFormat !== "text" && (
            <p className="mt-1 text-[10px] text-[#A67C3D] leading-snug">
              ✓ {T("format_chosen_note")}
            </p>
          )}
          {outputFormat === "html" && (
            <p className="mt-1 text-[10px] text-[#143352] leading-snug">
              ✨ <strong>HTML is the most impressive format</strong> — magazine-grade design, opens in any browser, prints to PDF beautifully. Takes {OUTPUT_FORMATS.html.timeEstimate} to render.
            </p>
          )}
          {outputFormat !== "html" && outputFormat !== "text" && OUTPUT_FORMATS[outputFormat]?.timeEstimate && (
            <p className="mt-1 text-[10px] text-[#4A5A6E] leading-snug">
              ⏱ Takes ~{OUTPUT_FORMATS[outputFormat].timeEstimate} to render. Want the most polished output? Try ✨ HTML.
            </p>
          )}

          <button
            onClick={run}
            disabled={!task.trim()}
            className="pd-lift mt-5 w-full py-3.5 bg-gradient-to-br from-[#143352] to-[#0A1F35] text-white rounded-lg text-sm font-semibold hover:from-[#1A4068] hover:to-[#143352] hover:shadow-lg hover:shadow-[#143352]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none tracking-wide border border-[#0A1F35]/20"
          >
            {T("engineer_button")}
          </button>

          <p className="mt-3 text-center text-[11px] text-[#8FA6BC]">
            {T("privacy_line")}{" "}
            <a href="/trust" className="underline hover:text-[#143352] transition-colors">
              {T("verify_link")}
            </a>
          </p>

          {/* Output */}
          {result && (
            <div id="output" className="mt-10">

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-[#4A5A6E]">{T("detected")}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#E8EFF5] text-[#A67C3D] font-semibold border border-[#C4D2E0]">
                  {ARCHETYPES[result.archetype].label}
                </span>
                {result.classification.secondary && (
                  <span className="text-[10px] text-[#8FA6BC]">
                    (+ {ARCHETYPES[result.classification.secondary].label})
                  </span>
                )}
                <span className="text-xs text-[#4A5A6E] ms-2">·</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded font-semibold border ${
                    result.selfEval.scaled >= 11
                      ? "bg-[#E0F0E5] text-[#1F6F4F] border-[#A8D5BA]"
                      : result.selfEval.scaled >= 9
                      ? "bg-[#F0E9DE] text-[#A67C3D] border-[#E0D2BB]"
                      : "bg-[#FBEAE8] text-[#8B3A2E] border-[#E4B5AE]"
                  }`}
                  title={result.selfEval.dimensions.map((d) => `${d.label}: ${d.score}/12 — ${d.why}`).join("\n")}
                >
                  <span>Self-eval {result.selfEval.scaled.toFixed(1)}/12</span>
                  <span className="pd-score-bar" aria-hidden="true">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span key={i} className={i < Math.round(result.selfEval.scaled) ? "on" : ""} />
                    ))}
                  </span>
                </span>
                <span className="text-xs text-[#4A5A6E] ms-2">·</span>
                <span className="text-xs text-[#4A5A6E]">{T("depth_label")}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#E8EFF5] text-[#143352] font-semibold border border-[#C4D2E0]">
                  {QUALITY_AXIS[result.quality].label}
                </span>
                <span className="text-xs text-[#4A5A6E] ms-2">·</span>
                {result.preflight.passed ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#E8F5EC] text-[#1F6F4F] font-semibold border border-[#A8D5BA]">
                    {T("preflight_pass")}
                  </span>
                ) : (
                  <span
                    className="text-xs px-2 py-0.5 rounded bg-[#FBEAE8] text-[#8B3A2E] font-semibold border border-[#E4B5AE]"
                    title={result.preflight.issues.map((i) => i.message).join(" / ")}
                  >
                    {T("preflight_fail")} ({result.preflight.issues.filter((i) => i.severity === "high").length})
                  </span>
                )}
              </div>

              <div
                className="pd-fade-in bg-gradient-to-br from-[#0A1F35] to-[#143352] border border-[#143352] rounded-xl p-3 sm:p-5 text-xs sm:text-sm text-[#F5F9FC] font-mono whitespace-pre-wrap leading-relaxed max-h-[28rem] overflow-y-auto shadow-2xl shadow-[#0A1F35]/30 ring-1 ring-[#A67C3D]/10"
                dir="ltr"
              >
                {segments.length === 0 ? (
                  result.engineered
                ) : (
                  segments.map((seg, idx) => {
                    const active = activeSegmentIdx === idx;
                    const isClickable = seg.kind !== "literal";
                    const segmentColors: Record<SegmentKind, string> = {
                      role: "rgba(166, 124, 61, 0.18)",
                      task: "rgba(31, 111, 79, 0.22)",
                      context: "rgba(70, 130, 180, 0.18)",
                      reasoning: "rgba(139, 58, 107, 0.18)",
                      format: "rgba(166, 124, 61, 0.14)",
                      exclusions: "rgba(139, 58, 46, 0.18)",
                      examples: "rgba(70, 130, 180, 0.14)",
                      critique: "rgba(31, 111, 79, 0.14)",
                      extra: "rgba(139, 58, 107, 0.14)",
                      literal: "transparent",
                    };
                    return (
                      <span
                        key={idx}
                        onClick={() => {
                          if (!isClickable) return;
                          setActiveSegmentIdx(active ? null : idx);
                          setShowLong(false);
                        }}
                        className={`${isClickable ? "cursor-pointer hover:brightness-125" : ""} ${active ? "outline outline-2 outline-[#A67C3D]" : ""}`}
                        style={{
                          backgroundColor: active ? "rgba(166, 124, 61, 0.32)" : segmentColors[seg.kind],
                          borderRadius: "3px",
                          padding: isClickable ? "1px 2px" : "0",
                          display: "inline",
                          transition: "background-color 0.15s, outline 0.15s",
                        }}
                        title={isClickable ? `Tap to learn: ${SEGMENT_EXPLAINS[seg.kind].title}` : undefined}
                      >
                        {seg.open}{seg.content}{seg.close}
                      </span>
                    );
                  })
                )}
              </div>

              {/* Per-segment explanation drawer */}
              {activeSegmentIdx !== null && segments[activeSegmentIdx] && segments[activeSegmentIdx].kind !== "literal" && (() => {
                const seg = segments[activeSegmentIdx];
                const ex = SEGMENT_EXPLAINS[seg.kind];
                return (
                  <div className="mt-3 bg-white border-2 border-[#A67C3D] rounded-md p-4 sm:p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#A67C3D] mb-0.5">
                          {seg.kind} block
                        </p>
                        <h3 className="text-base sm:text-lg font-semibold text-[#0E1A2A]">{ex.title}</h3>
                      </div>
                      <button
                        onClick={() => { setActiveSegmentIdx(null); setShowLong(false); }}
                        className="shrink-0 w-7 h-7 rounded-full bg-[#F5F9FC] hover:bg-[#E8EFF5] text-[#4A5A6E] text-base flex items-center justify-center"
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-[#0E1A2A] leading-relaxed mb-3">{ex.short}</p>

                    {showLong && (
                      <div className="space-y-3 mb-3">
                        <p className="text-sm text-[#0E1A2A] leading-relaxed">{ex.long}</p>
                        <div className="bg-[#F5F9FC] border-l-2 border-[#1F6F4F] p-3 rounded-r">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#1F6F4F] mb-1">Why it helps</p>
                          <p className="text-xs sm:text-sm text-[#0E1A2A] leading-relaxed">{ex.whyItHelps}</p>
                        </div>
                      </div>
                    )}

                    {/* Lexicon terms detected in this segment */}
                    {seg.lexiconTerms.length > 0 && (
                      <div className="mb-3 pt-3 border-t border-[#E8EFF5]">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#4A5A6E] mb-2">
                          Terms in this block
                        </p>
                        <div className="space-y-2">
                          {seg.lexiconTerms.map((termId) => {
                            const term = LEXICON[termId];
                            if (!term) return null;
                            return (
                              <div key={termId} className="bg-[#F5F9FC] rounded p-2.5">
                                <p className="text-xs font-semibold text-[#143352] mb-0.5">{term.label}</p>
                                <p className="text-[11px] text-[#4A5A6E] leading-snug">{term.short}</p>
                                {term.links && term.links.length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-2">
                                    {term.links.map((l, li) => (
                                      <a key={li} href={l.url} target="_blank" rel="noopener noreferrer"
                                         className="text-[10px] text-[#A67C3D] hover:text-[#8a6530] underline">
                                        {l.label} ↗
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setShowLong(!showLong)}
                      className="text-xs font-semibold text-[#143352] hover:text-[#0A1F35] transition-colors"
                    >
                      {showLong ? "Show less" : "Learn more →"}
                    </button>
                  </div>
                );
              })()}

              <p className="mt-2 text-[10px] text-[#8FA6BC]">
                {T("output_lang_note")}{" "}
                <span className="hidden sm:inline">· Tap any colored block above to learn what it does.</span>
                <span className="sm:hidden">· Tap any block above to learn.</span>
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <p className="text-xs text-[#4A5A6E] leading-relaxed">
                  {T("paste_into")}{" "}
                  {T("switch_intro")}{" "}
                  <span className="font-semibold text-[#143352]">{T("render_speed")}</span>.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={reset} className="text-xs text-[#8FA6BC] hover:text-[#143352] px-2 py-1 transition-colors">
                    {T("start_over")}
                  </button>
                  <button
                    onClick={copy}
                    className="pd-lift px-4 py-2 bg-gradient-to-br from-[#A67C3D] to-[#8a6530] text-white rounded-lg text-xs font-semibold hover:shadow-md hover:shadow-[#A67C3D]/30 min-w-[110px] border border-[#8a6530]/40"
                  >
                    {copied ? T("copied") : T("copy_prompt")}
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
                  {T("refine")}
                </button>
                {refineOpen && (
                  <div className="mt-3 p-5 bg-white border border-[#C4D2E0] rounded-md space-y-4">
                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        {T("constraints_label")}
                      </label>
                      <textarea
                        value={userConstraints}
                        onChange={(e) => setUserConstraints(e.target.value)}
                        className="w-full border border-[#C4D2E0] rounded-md p-2 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352] font-mono leading-relaxed"
                        rows={4}
                        dir={dir}
                      />
                      <p className="text-[10px] text-[#8FA6BC] mt-1.5">
                        {T("constraints_help")}
                      </p>
                    </div>

                    {!result.preflight.passed && (
                      <div className="border border-[#E4B5AE] bg-[#FBEAE8] rounded-md p-3">
                        <p className="text-xs font-semibold text-[#8B3A2E] mb-1.5">{T("preflight_issues_label")}</p>
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
                      {T("refine_footer")}
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div className="mt-6">
                <button
                  onClick={() => setFeedbackOpen(!feedbackOpen)}
                  className="flex items-center gap-2 text-xs text-[#143352] font-semibold uppercase tracking-wider hover:text-[#0A1F35] transition-colors"
                >
                  <span className="inline-block w-4 text-center">{feedbackOpen ? "−" : "+"}</span>
                  {T("feedback_button")}
                  {rating > 0 && <span className="text-[#A67C3D]">★ {rating}/5</span>}
                </button>

                {feedbackOpen && (
                  <div className="mt-3 p-5 bg-white border border-[#C4D2E0] rounded-md space-y-4">
                    <p className="text-xs text-[#4A5A6E] leading-relaxed">
                      {T("feedback_intro")}
                    </p>

                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        {T("rating_label")}
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
                            aria-label={`${n}`}
                          >
                            ★
                          </button>
                        ))}
                        {rating > 0 && (
                          <button
                            onClick={() => setRating(0)}
                            className="text-[10px] text-[#8FA6BC] hover:text-[#143352] px-2"
                          >
                            {T("clear_rating")}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[#4A5A6E] font-semibold uppercase tracking-wider mb-2">
                        {T("feedback_textarea_label")}
                      </label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full border border-[#C4D2E0] rounded-md p-3 text-sm text-[#0E1A2A] bg-white focus:outline-none focus:border-[#143352] leading-relaxed"
                        rows={5}
                        dir={dir}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          const body = buildFeedbackPayload({
                            rating, feedbackText, task, result, userConstraints, lang,
                          });
                          const subject = `PromptDolphin feedback${rating ? ` (${rating}/5)` : ""} [${lang}]`;
                          const href = `mailto:feedback@promptdolphin.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                          window.location.href = href;
                          setFeedbackStatus("emailed");
                          setTimeout(() => setFeedbackStatus(""), 3000);
                        }}
                        disabled={!feedbackText.trim() && rating === 0}
                        className="flex-1 px-4 py-2 bg-[#143352] text-white rounded-md text-xs font-semibold hover:bg-[#0A1F35] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {feedbackStatus === "emailed" ? T("email_opened") : T("send_email")}
                      </button>
                      <button
                        onClick={() => {
                          const body = buildFeedbackPayload({
                            rating, feedbackText, task, result, userConstraints, lang,
                          });
                          navigator.clipboard.writeText(body).then(() => {
                            setFeedbackStatus("copied");
                            setTimeout(() => setFeedbackStatus(""), 3000);
                          });
                        }}
                        disabled={!feedbackText.trim() && rating === 0}
                        className="flex-1 px-4 py-2 bg-white border border-[#143352] text-[#143352] rounded-md text-xs font-semibold hover:bg-[#E8EFF5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {feedbackStatus === "copied" ? T("copied") : T("copy_clipboard")}
                      </button>
                    </div>

                    <p className="text-[10px] text-[#8FA6BC] pt-2 border-t border-[#C4D2E0] leading-relaxed">
                      {T("feedback_footer")}
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
            <p className="text-sm font-semibold text-[#0E1A2A] mt-2 mb-1">{T("acq_compute_label")}</p>
            <p className="text-xs text-[#4A5A6E] leading-relaxed">{T("acq_compute_body")}</p>
          </div>
          <div>
            <p className="text-5xl font-serif text-[#143352]" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>0</p>
            <p className="text-sm font-semibold text-[#0E1A2A] mt-2 mb-1">{T("acq_retention_label")}</p>
            <p className="text-xs text-[#4A5A6E] leading-relaxed">{T("acq_retention_body")}</p>
          </div>
          <div>
            <p className="text-5xl font-serif text-[#143352]" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>0</p>
            <p className="text-sm font-semibold text-[#0E1A2A] mt-2 mb-1">{T("acq_it_label")}</p>
            <p className="text-xs text-[#4A5A6E] leading-relaxed">
              {T("acq_it_body")} <a href="/trust" className="underline text-[#143352]">{T("acq_read_proof")}</a>
            </p>
          </div>
        </div>
      </section>

      {/* What can your AI deliver? — collapsed by default, secondary interest */}
      <section id="formats-explained" className="bg-white py-10 sm:py-12 md:py-14 px-4 sm:px-6 md:px-8 border-b border-[#C4D2E0]">
        <div className="w-full max-w-4xl mx-auto">
          <button
            onClick={() => setFormatsOpen(!formatsOpen)}
            className="w-full flex items-center justify-between gap-4 text-start group"
            aria-expanded={formatsOpen}
          >
            <div className="flex-1 min-w-0">
              <h2
                className="text-[#0E1A2A] font-serif text-xl sm:text-2xl md:text-3xl leading-tight tracking-tight"
                style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}
              >
                {T("format_section_title")}
              </h2>
              {!formatsOpen && (
                <p className="mt-2 text-xs sm:text-sm text-[#4A5A6E] leading-relaxed">
                  {T("format_section_subtitle")}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-[#C4D2E0] bg-[#F5F9FC] text-[#143352] text-base font-semibold transition-transform group-hover:border-[#143352] ${formatsOpen ? "rotate-45" : ""}`}
              aria-hidden="true"
            >
              +
            </span>
          </button>

          {formatsOpen && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {OUTPUT_FORMAT_ORDER.map((fid) => {
                const f = OUTPUT_FORMATS[fid];
                const active = outputFormat === fid;
                const categoryColors: Record<string, { bg: string; text: string }> = {
                  text: { bg: "#E8EFF5", text: "#143352" },
                  document: { bg: "#F0E9DE", text: "#A67C3D" },
                  data: { bg: "#E0F0E5", text: "#1F6F4F" },
                  visual: { bg: "#F3E5F1", text: "#8B3A6B" },
                };
                const cat = categoryColors[f.category];
                return (
                  <button
                    key={fid}
                    onClick={() => {
                      setOutputFormat(fid);
                      document.getElementById("input-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    title={`${T("format_ideal_for")}: ${f.audience}\n\n${T("format_how_to_download")}: ${f.downloadTruth}`}
                    className={`text-start bg-white border rounded-md p-3 transition-all ${
                      active
                        ? "border-[#143352] shadow-sm ring-1 ring-[#143352]"
                        : "border-[#C4D2E0] hover:border-[#143352] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold shrink-0"
                        style={{ backgroundColor: cat.bg, color: cat.text }}
                      >
                        {f.icon}
                      </span>
                      <p className="text-[11px] sm:text-xs font-semibold text-[#0E1A2A] leading-tight">{f.label}</p>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-[#4A5A6E] leading-snug line-clamp-3">
                      {f.valueShort}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {formatsOpen && (
            <p className="mt-4 text-[11px] text-[#8FA6BC] text-center">
              {T("format_section_cta")}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1F35] py-10 sm:py-12 md:py-14 px-4 sm:px-6 text-center">
        <p className="mb-3 text-sm text-[#C4D2E0]">
          {T("footer_powered_by")}{" "}
          <a href="https://krentix.com" target="_blank" rel="noopener noreferrer"
             className="font-semibold text-[#A67C3D] hover:text-[#c9973f] transition-colors underline-offset-2 underline">
            Krentix
          </a>
        </p>
        <p className="text-[11px] text-[#8FA6BC] space-x-3">
          <a href="/for-teams" className="hover:text-[#F5F9FC] transition-colors">{T("footer_for_teams")}</a>
          <span>·</span>
          <a href="/trust" className="hover:text-[#F5F9FC] transition-colors">{T("footer_trust")}</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-[#F5F9FC] transition-colors">{T("footer_privacy")}</a>
          <span>·</span>
          <a href="https://github.com/joelrobic-gif/promptdolphin-engine" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F9FC] transition-colors">
            {T("footer_oss")}
          </a>
          <span>·</span>
          <span>{T("footer_no_cookies")}</span>
        </p>
        <p className="text-[10px] text-[#4A5A6E] mt-3">
          {T("footer_legal")}
        </p>
      </footer>

    </main>
  );
}
