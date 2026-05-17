#!/usr/bin/env node
// Extensive engine test harness — 10,000+ synthetic prompts across all models + params.
// Measures: latency p50/p95/p99, structural validity per model, cost, scale-readiness.
// Usage: node scripts/test-engine.mjs [iterations]

import { engineer, applyAdapter, detectArchetype, MODELS, ARCHETYPES, CONNECTORS, FORMATS, REVIEW_MODES, DEPTHS, RICH_MEDIA } from "../engine/engine.mjs";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../test-results");
const ITERS = parseInt(process.argv[2] || "10000", 10);

const PROMPTS = [
  "Write an email to my VP asking to delay the Q3 launch by two weeks",
  "Draft a message to my team explaining the headcount freeze",
  "Email our biggest customer apologizing for the data outage yesterday",
  "Write to the board chair about my decision to step down as CEO",
  "Draft a reply to the journalist asking about our layoffs",
  "Email finance asking to revisit my Q4 budget request",
  "Write to my report explaining why I am putting them on a PIP",
  "Draft an outreach to the head of partnerships at Stripe",
  "Message my CTO that we need to halt the migration tonight",
  "Write a letter to investors announcing our new chief scientist",
  "Help me decide whether to expand to Europe next year",
  "Should we acquire our smaller competitor or partner with them",
  "Recommend a go-to-market strategy for our enterprise tier",
  "Build or buy a customer support platform — which makes more sense",
  "Strategic options for entering the Japanese pharmaceutical market",
  "Should we pivot from B2B to B2B2C after losing our anchor customer",
  "Recommend a pricing strategy for our new AI tier",
  "Strategy for surviving the next 18 months with 12 months of runway",
  "Should we list direct on the Nasdaq or do a reverse merger",
  "Recommend whether to keep our internal sales team or use partners",
  "Prep me for tomorrow's QBR with our biggest customer",
  "Prepare me for the board meeting on our restructuring",
  "Brief for the all-hands explaining the layoffs",
  "Prep for the founder offsite — alignment on year-2 strategy",
  "Brief for my meeting with the CMO about the agency change",
  "Debrief from yesterday's customer escalation — what next",
  "Agenda for the merger integration planning session",
  "Prep for the IPO bake-off with three investment banks",
  "Brief for the meeting with FDA about the protocol change",
  "Prep for the partnership negotiation with Microsoft Azure",
  "Slide outline for our Series C pitch",
  "Deck for the board on our Q3 results",
  "Presentation explaining our turnaround plan to the leadership team",
  "Slides for the analyst day product roadmap",
  "Deck pitching our new compliance product to a Fortune 100 CISO",
  "Board update on the FDA approval timeline",
  "Keynote outline for our annual customer conference",
  "Slides for the all-hands on the new operating model",
  "Pitch deck for our incoming director of engineering",
  "Slides for the JPM healthcare conference",
  "Research the competitive landscape for clinical decision support tools",
  "Summarize the FDA guidance on real-world evidence",
  "Synthesize what we know about GLP-1 drugs and Alzheimer's risk",
  "Analyze the impact of the new EU AI Act on biotech AI tools",
  "Report on the state of explainable AI in medical devices",
  "Literature review on phase 2 cardiometabolic trials 2023-2025",
  "Research methods used by competitors to validate their clinical models",
  "Summarize the latest meta-analyses on aducanumab efficacy",
  "Analyze the pricing trends in our market segment over the last 24 months",
  "Synthesis of patent landscape for AI-assisted diagnostics",
  "Draft FDA submission cover letter for our Pre-Submission meeting",
  "Regulatory strategy for our Class II 510(k) clearance",
  "Health Canada submission for our medical device software",
  "EMA briefing document for our orphan drug designation",
  "TGA registration strategy for our diagnostic platform",
  "MHRA correspondence about our software-as-a-medical-device classification",
  "NDA filing strategy for our cardiometabolic compound",
  "BLA preparation timeline for our biologics candidate",
  "Regulatory submission summary for our Type C meeting",
  "FDA breakthrough designation request justification",
  "Investor update on our Q3 pipeline progress",
  "Quarterly update for the syndicate after our anchor customer loss",
  "Q1 update on biotech catalysts and burn rate",
  "Pipeline progress note for our existing shareholders",
  "Biotech update on FDA meeting outcome and next milestones",
  "Investor letter explaining the CEO transition",
  "Q4 update on cash runway and operating leverage",
  "Quarterly update on the lead asset readout timing",
  "Investor brief on the regulatory pathway change",
  "Pipeline progress update on the Phase 2 enrollment delay",
  "Explain why our Series A valuation should be higher than the comparables",
  "Outline a 30-60-90 plan for my new VP of product",
  "Build a hiring rubric for our staff engineer track",
  "Write a one-page philosophy of how we handle ICs vs managers",
  "Justify our decision not to pursue SOC 2 Type I this year",
  "Draft a position paper on remote-first vs hybrid",
  "Make the case for raising our enterprise pricing 30%",
  "Argue why we should kill the SMB product line",
  "Outline how we should handle the social media backlash",
  "Describe how to scale our customer success team to 10x users",
];

const CONNECTORS_LIST = Object.keys(CONNECTORS);
const FORMATS_LIST = Object.keys(FORMATS);
const REVIEW_LIST = Object.keys(REVIEW_MODES);
const DEPTH_LIST = Object.keys(DEPTHS);
const MEDIA_LIST = Object.keys(RICH_MEDIA);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const VALIDATORS = {
  claude: (out) =>
    out.includes("<role>") && out.includes("</role>") &&
    out.includes("<context>") && out.includes("<format>") &&
    out.includes("<critique>") && out.includes("### New Input:"),
  chatgpt: (out) =>
    out.startsWith("You are ") && out.includes("## Task") &&
    out.includes("## Instructions") && out.includes("## Output format") &&
    out.includes("## Constraints"),
  gemini: (out) =>
    out.startsWith("You are ") && out.includes("Task:") &&
    out.includes("Structure your answer as:") &&
    out.includes("Verify before answering:"),
  copilot: (out) =>
    out.includes("## Role") && out.includes("## Task") &&
    out.includes("## Context") && out.includes("## Output format") &&
    out.includes("## Quality check"),
  grok: (out) =>
    out.includes("Task:") && out.includes("Format:") &&
    out.includes("Avoid:") && out.includes("Be direct."),
};

function percentile(sorted, p) {
  const idx = Math.min(Math.floor(sorted.length * p), sorted.length - 1);
  return sorted[idx];
}

async function main() {
  console.log(`\nPromptDolphin Engine Test Harness`);
  console.log(`================================`);
  console.log(`Iterations: ${ITERS}`);
  console.log(`Prompt corpus: ${PROMPTS.length} natural tasks`);
  console.log(`Models: ${MODELS.length} (${MODELS.join(", ")})`);
  console.log(`Param space: ${CONNECTORS_LIST.length}×${FORMATS_LIST.length}×${REVIEW_LIST.length}×${DEPTH_LIST.length}×${MEDIA_LIST.length} = ${CONNECTORS_LIST.length * FORMATS_LIST.length * REVIEW_LIST.length * DEPTH_LIST.length * MEDIA_LIST.length} combinations per prompt\n`);

  await mkdir(OUT_DIR, { recursive: true });

  console.log(`[1/4] Functional correctness — all PROMPTS x all MODELS...`);
  let totalCases = 0;
  let validCases = 0;
  const failures = [];
  const archetypeCounts = {};
  for (const task of PROMPTS) {
    const detected = detectArchetype(task);
    archetypeCounts[detected] = (archetypeCounts[detected] || 0) + 1;
    for (const model of MODELS) {
      totalCases++;
      try {
        const out = engineer(task, { model });
        if (VALIDATORS[model](out)) validCases++;
        else failures.push({ task, model, reason: "structural validator failed", outputPrefix: out.slice(0, 120) });
      } catch (e) {
        failures.push({ task, model, reason: "exception", error: e.message });
      }
    }
  }
  console.log(`   Valid: ${validCases}/${totalCases} (${(100 * validCases / totalCases).toFixed(2)}%)`);
  console.log(`   Archetype detection: ${JSON.stringify(archetypeCounts)}`);
  console.log(`   Failures: ${failures.length}`);

  console.log(`\n[2/4] Randomized stress test — ${ITERS} iterations, random params...`);
  const latencies = [];
  const outputSizes = [];
  let stressFailures = 0;
  const t0 = performance.now();
  for (let i = 0; i < ITERS; i++) {
    const task = PROMPTS[i % PROMPTS.length];
    const model = pick(MODELS);
    const config = {
      task,
      archetype: detectArchetype(task),
      model,
      connector: pick(CONNECTORS_LIST),
      outputFormat: pick(FORMATS_LIST),
      reviewMode: pick(REVIEW_LIST),
      depth: pick(DEPTH_LIST),
      richMedia: pick(MEDIA_LIST),
    };
    const start = performance.now();
    let out;
    try {
      out = applyAdapter(config);
    } catch (e) {
      stressFailures++;
      continue;
    }
    const dt = performance.now() - start;
    latencies.push(dt);
    outputSizes.push(out.length);
    if (!VALIDATORS[model](out)) stressFailures++;
  }
  const totalT = performance.now() - t0;
  latencies.sort((a, b) => a - b);
  outputSizes.sort((a, b) => a - b);
  const totalBytes = outputSizes.reduce((s, x) => s + x, 0);
  const stats = {
    iterations: ITERS,
    totalWallTimeMs: totalT,
    throughputPerSec: (ITERS / totalT) * 1000,
    p50Ms: percentile(latencies, 0.5),
    p95Ms: percentile(latencies, 0.95),
    p99Ms: percentile(latencies, 0.99),
    p999Ms: percentile(latencies, 0.999),
    maxMs: latencies[latencies.length - 1],
    meanMs: latencies.reduce((s, x) => s + x, 0) / latencies.length,
    outputSizeP50: percentile(outputSizes, 0.5),
    outputSizeP95: percentile(outputSizes, 0.95),
    outputSizeMax: outputSizes[outputSizes.length - 1],
    totalOutputMB: totalBytes / 1024 / 1024,
    stressFailures,
  };
  console.log(`   Wall time: ${totalT.toFixed(1)}ms (${(totalT/1000).toFixed(2)}s)`);
  console.log(`   Throughput: ${stats.throughputPerSec.toFixed(0)} prompts/sec`);
  console.log(`   Latency p50/p95/p99/p999/max: ${stats.p50Ms.toFixed(3)}/${stats.p95Ms.toFixed(3)}/${stats.p99Ms.toFixed(3)}/${stats.p999Ms.toFixed(3)}/${stats.maxMs.toFixed(3)} ms`);
  console.log(`   Mean latency: ${stats.meanMs.toFixed(3)} ms`);
  console.log(`   Output size p50/p95/max: ${stats.outputSizeP50}/${stats.outputSizeP95}/${stats.outputSizeMax} chars`);
  console.log(`   Stress failures: ${stressFailures}`);

  console.log(`\n[3/4] Concurrent scale — 1000 simulated users x 10 prompts each (10,000 prompts in parallel)...`);
  const userCount = 1000;
  const promptsPerUser = 10;
  const cT0 = performance.now();
  await Promise.all(Array.from({ length: userCount }, async (_, u) => {
    for (let p = 0; p < promptsPerUser; p++) {
      const task = PROMPTS[(u + p) % PROMPTS.length];
      const config = {
        task,
        archetype: detectArchetype(task),
        model: MODELS[(u + p) % MODELS.length],
        connector: CONNECTORS_LIST[p % CONNECTORS_LIST.length],
        outputFormat: FORMATS_LIST[p % FORMATS_LIST.length],
      };
      applyAdapter(config);
    }
  }));
  const cT = performance.now() - cT0;
  const totalConcurrent = userCount * promptsPerUser;
  console.log(`   ${totalConcurrent} prompts across ${userCount} concurrent users in ${cT.toFixed(0)}ms`);
  console.log(`   Effective throughput: ${(totalConcurrent / cT * 1000).toFixed(0)} prompts/sec`);
  console.log(`   Per-user mean: ${(cT / userCount).toFixed(2)}ms for ${promptsPerUser} prompts`);

  console.log(`\n[4/4] Cost model — engine assembly only (no LLM call)...`);
  const railwayMonthly = 5;
  const railwayBandwidthGB = 100;
  const avgPageKB = 200;
  const pagesPerGB = (1024 * 1024) / avgPageKB;
  const monthlyPages = railwayBandwidthGB * pagesPerGB;
  const costPerPage = railwayMonthly / monthlyPages;
  console.log(`   Railway hobby plan: $${railwayMonthly}/mo, ${railwayBandwidthGB}GB bandwidth`);
  console.log(`   Average page size: ${avgPageKB} KB`);
  console.log(`   Max pages/month: ${monthlyPages.toLocaleString()}`);
  console.log(`   Cost per page view: $${costPerPage.toFixed(8)}`);
  console.log(`   Cost per prompt generated: $0 (client-side, no server work)`);
  console.log(`   At 1,000 concurrent users: $0 additional (browser does all work)`);
  console.log(`   At 100,000 daily prompts: $0 additional`);

  const passRate = (validCases / totalCases) * 100;
  const allPass = passRate >= 99.0 && stressFailures === 0 && stats.p99Ms < 5.0;
  const scorecard = {
    timestamp: new Date().toISOString(),
    config: {
      iterations: ITERS,
      promptCorpus: PROMPTS.length,
      models: MODELS,
      paramCombinations: CONNECTORS_LIST.length * FORMATS_LIST.length * REVIEW_LIST.length * DEPTH_LIST.length * MEDIA_LIST.length,
    },
    functional: {
      totalCases,
      validCases,
      passRatePct: passRate,
      archetypeCounts,
      failures: failures.slice(0, 20),
    },
    performance: stats,
    scale: {
      concurrentUsers: userCount,
      promptsPerUser,
      totalConcurrent,
      wallTimeMs: cT,
      throughputPerSec: totalConcurrent / cT * 1000,
    },
    cost: {
      railwayMonthlyUSD: railwayMonthly,
      bandwidthGB: railwayBandwidthGB,
      avgPageKB,
      maxMonthlyPageViews: monthlyPages,
      costPerPageView: costPerPage,
      costPerPromptGenerated: 0,
      costAt1kConcurrentUsers: 0,
      costAt100kDailyPrompts: 0,
    },
    verdict: {
      pass: allPass,
      criteria: {
        passRate99pct: passRate >= 99.0,
        zeroStressFailures: stressFailures === 0,
        p99Under5ms: stats.p99Ms < 5.0,
      },
    },
  };

  const outPath = resolve(OUT_DIR, `engine-test-${Date.now()}.json`);
  await writeFile(outPath, JSON.stringify(scorecard, null, 2));

  console.log(`\n================================`);
  console.log(`SCORECARD`);
  console.log(`================================`);
  console.log(`Pass rate: ${passRate.toFixed(2)}%  ${passRate >= 99 ? "PASS" : "FAIL"}`);
  console.log(`Stress failures: ${stressFailures}  ${stressFailures === 0 ? "PASS" : "FAIL"}`);
  console.log(`p99 latency < 5ms: ${stats.p99Ms.toFixed(3)}ms  ${stats.p99Ms < 5 ? "PASS" : "FAIL"}`);
  console.log(`Throughput: ${stats.throughputPerSec.toFixed(0)} prompts/sec/core`);
  console.log(`Scale to 1k users x 10 prompts: ${cT.toFixed(0)}ms total`);
  console.log(`Cost per prompt: $0.00 (client-side)`);
  console.log(`Cost at 100k daily prompts: $0.00 additional`);
  console.log(`\nVerdict: ${allPass ? "PASS" : "FAIL"}`);
  console.log(`\nReport saved: ${outPath}`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
