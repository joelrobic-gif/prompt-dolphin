#!/usr/bin/env node
// Cycle 2: refinements based on panel critique
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../spike/public/brand/exploration");
const BRIDGE = "http://localhost:4100/api/image/generate";

const STYLES = [
  {
    id: "A-deep-refined",
    prompt:
      "Cinematic underwater photograph of a single large bottlenose dolphin curving gracefully toward the viewer through deep navy ocean water, dolphin filling 50 percent of the frame body in sharp focus, dramatic god-rays of sunlight piercing down from the surface above in distinct columns, bubble trails behind the dolphin, deep midnight blue water with brilliant cerulean highlights catching the dolphin back, photorealistic National Geographic editorial style, no text, no logos, no watermarks, no people, no boats",
    size: "1024x1024",
  },
  {
    id: "A-wide-attempt",
    prompt:
      "Wide cinematic underwater photograph of a single dolphin gliding through deep ocean water, dramatic shafts of sunlight piercing from the surface, deep navy and cerulean blue color palette, professional editorial composition, no text, no logos",
    size: "1792x1024",
  },
  {
    id: "E-cool-graded",
    prompt:
      "Dramatic photograph of a single dolphin leaping fully clear of dark deep blue ocean water mid-arc, water droplets and spray frozen in mid-air around the animal, cool blue lighting NOT golden hour, deep navy ocean stretching to horizon, twilight blue sky above, single moment of motion captured frozen, professional wildlife photography, no people, no boats, no text, no watermarks, no logos",
    size: "1024x1024",
  },
  {
    id: "F-pod-swimming",
    prompt:
      "Underwater photograph of three bottlenose dolphins swimming together as a pod through deep blue ocean water, the dolphins arranged in a graceful V formation moving through the frame, deep navy and cerulean ocean depth around them, shafts of sunlight from above, photorealistic National Geographic editorial quality, no people, no boats, no text, no logos, no watermarks",
    size: "1024x1024",
  },
];

async function generate(style) {
  const t0 = Date.now();
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(BRIDGE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: style.prompt,
          size: style.size,
          n: 1,
          preferences: { provider: "dall-e-3" },
        }),
      });
      const json = await res.json();
      if (json.imageUrl) {
        const base64 = json.imageUrl.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(base64, "base64");
        const outPath = resolve(OUT_DIR, `cycle2-${style.id}.jpg`);
        await writeFile(outPath, buf);
        console.log(`[${style.id}] SAVED ${(buf.length / 1024).toFixed(0)}KB ${Date.now() - t0}ms`);
        return;
      }
      console.log(`[${style.id}] attempt ${attempt} no image:`, json.error || "unknown");
    } catch (e) {
      console.log(`[${style.id}] attempt ${attempt} ERR:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.log(`[${style.id}] FAILED all attempts`);
}

await mkdir(OUT_DIR, { recursive: true });
console.log(`Cycle 2 - ${STYLES.length} refinements\n`);
for (const s of STYLES) {
  await generate(s);
  await new Promise((r) => setTimeout(r, 3000));
}
console.log("\nCycle 2 complete");
