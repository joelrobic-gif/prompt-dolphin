#!/usr/bin/env node
// Batch-generate PromptDolphin hero exploration variants via Krentix bridge.
// Usage: node scripts/gen-hero-explorations.mjs [cycle-number]

import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../spike/public/brand/exploration");
const BRIDGE = "http://localhost:4100/api/image/generate";

const cycle = process.argv[2] || "1";

const STYLES = [
  {
    id: "A-editorial-photo",
    prompt:
      "Cinematic underwater photograph of a single dolphin gliding through deep navy ocean water, dramatic rays of sunlight piercing down from the surface, dolphin in sharp focus mid-frame body partially silhouetted, water particles and bubbles trailing behind, deep cerulean to midnight blue gradient with copper-tinged highlights catching the dolphin's back, photorealistic National Geographic style, 50mm lens depth of field, professional editorial composition, magazine cover quality, no people, no boats, no text, no logos, no watermarks, 16:9 widescreen",
    provider: "dall-e-3",
    photoreal: true,
  },
  {
    id: "B-painterly-stripepress",
    prompt:
      "Editorial illustration in the style of Stripe Press book covers, single dolphin in profile underwater against deep blue water column, restrained brushwork visible texture, warm burnished copper light catching the dolphin's dorsal ridge, painterly oil-on-canvas quality, sophisticated and quiet composition, magazine cover gravitas, deep navy ocean with subtle caustic light patterns, no text, no logos, no watermarks, no signatures",
    provider: "dall-e-3",
  },
  {
    id: "C-minimalist-vector",
    prompt:
      "Minimalist vector illustration of a single dolphin in elegant side profile, deep navy 1A3A5C and burnished copper A67C3D color palette only, flat geometric design with clean precise lines, single dolphin centered and curving through frame, ocean depth suggested by graduated horizontal bands of deepening blue, no surface ripples, no waves, Linear app aesthetic premium tech brand quality, no text, no logos, no watermarks",
    provider: "dall-e-3",
  },
  {
    id: "D-abstract-conceptual",
    prompt:
      "Abstract conceptual digital art representing AI depth and ocean exploration, swirling currents of deep navy water spiraling downward into darkness, no literal dolphin figure, instead suggested form through light streaks and motion blur, deep ocean blue color palette with single thin copper ray of light piercing from above, museum-quality contemplative composition, dark and powerful mood, no text, no logos, no watermarks, no signatures",
    provider: "dall-e-3",
  },
  {
    id: "E-bbcearth-documentary",
    prompt:
      "BBC Earth documentary still photograph, single dolphin breaking through the surface tension of deep blue ocean water mid-leap, dramatic side lighting from golden hour sun, water droplets suspended frozen in mid-air around the animal, deep ocean stretching to horizon line, captured single moment of pure motion frozen, professional wildlife photography masterclass, no people, no boats, no text overlay, no watermarks, 16:9 cinematic widescreen",
    provider: "dall-e-3",
    photoreal: true,
  },
];

async function generate(style) {
  const t0 = Date.now();
  console.log(`[${style.id}] requesting...`);
  const res = await fetch(BRIDGE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: style.prompt,
      size: "1024x1024",
      n: 1,
      preferences: {
        provider: style.provider,
      },
    }),
  });
  const json = await res.json();
  const latency = Date.now() - t0;
  if (!json.imageUrl) {
    console.log(`[${style.id}] FAILED in ${latency}ms:`, json.error || JSON.stringify(json).slice(0, 200));
    return null;
  }
  const base64 = json.imageUrl.replace(/^data:image\/\w+;base64,/, "");
  const buf = Buffer.from(base64, "base64");
  const outPath = resolve(OUT_DIR, `cycle${cycle}-${style.id}.jpg`);
  await writeFile(outPath, buf);
  console.log(`[${style.id}] SAVED (${(buf.length / 1024).toFixed(0)}KB, ${latency}ms) -> ${outPath}`);
  return outPath;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Cycle ${cycle} - generating ${STYLES.length} hero variants...\n`);
  const results = [];
  for (const style of STYLES) {
    try {
      const r = await generate(style);
      results.push({ id: style.id, path: r });
    } catch (e) {
      console.log(`[${style.id}] ERROR:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(`\nCycle ${cycle} complete. ${results.filter((r) => r.path).length}/${STYLES.length} succeeded.`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
