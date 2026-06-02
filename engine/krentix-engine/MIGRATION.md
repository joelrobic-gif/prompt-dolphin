# @krentix/prompt-engine — Migration guide

## v1.x → v2.1.0 (L99 PE-Phases 0-10)

### TL;DR
- Engine is now brand-neutral by default — `engineer(task)` will NOT inject
  Krentix branding into HTML reports unless you pass `{ brandTokens }`.
- New optional params: `brandTokens`, `fewShot`, `refinement`, `provider`,
  `model`. All default to safe values; existing callers see no behavior
  change for non-html outputs.
- HTML output now emits a full design contract (palette, typography,
  sources policy). The previous bland stub is gone.
- New archetype: `html_news_report` (editorial design + sources).
- New modules: `./few-shot`, `./directives/refinement`, `./providers/shape-variants`,
  `./telemetry/cost-tracker`, `./validators/html-report-schema`.
- Score on the 24-prompt golden set: baseline 85 → v2.1 = 93.2 (det-only).

### Breaking changes
| Surface | Old (v1) | New (v2.1) |
|---|---|---|
| `DOLPHIN_ENGINE_VERSION` | `'1.0.0'` | `'2.1.0'` |
| `ARCHETYPES` keys | 8 | 9 (adds `html_news_report`) |
| `FORMATS.html` (string) | ~23 words generic | replaced at runtime by `buildHtmlDesignContract(brand)` |
| `engineer()` returns `options.brandId` | n/a | always present |
| Test asserting `DOLPHIN_ENGINE_VERSION === '1.0.0'` | passes | fails (use semver regex) |
| Test asserting archetype count = 8 | passes | fails (use 9) |

### Additive (no-break) changes
- `engineer(task, { brandTokens })` — opt-in brand injection.
- `engineer(task, { fewShot: 0 })` — disable few-shot bank (default 1 when input >=60 chars).
- `engineer(task, { refinement: 'none'|'cod'|'self_refine'|'cod_then_refine'|'auto' })`.
- `engineer(task, { provider: 'claude'|'gpt'|'gemini'|'generic' })` — provider-specific envelope shape.
- `engineer(task, { model: 'gpt-4o' })` — auto-detects provider from model id.

### PromptDolphin migration steps (Option A — npm package, recommended)

1. **In Krentix** (one-time):
   ```bash
   cd src/prompt-engineer
   npm publish --access public  # publishes @krentix/prompt-engine@2.1.0
   ```

2. **In PromptDolphin** (one-time):
   ```bash
   npm install @krentix/prompt-engine@^2.1.0
   ```

3. **Update PromptDolphin call sites:**

   Before (v1):
   ```js
   const { engineer } = require('./local-dolphin-engine.js');
   const out = engineer(userPrompt);
   ```

   After (v2.1 — brand-neutral default):
   ```js
   import { engineer } from '@krentix/prompt-engine';
   const out = engineer(userPrompt);
   // out.enhanced ships with neutral brand defaults — no Krentix leakage.
   ```

   After (v2.1 — PromptDolphin-branded):
   ```js
   import { engineer } from '@krentix/prompt-engine';
   import { resolveBrand } from '@krentix/prompt-engine/brand';
   const PD_BRAND = resolveBrand({
     id: 'promptdolphin',
     productName: 'PromptDolphin',
     palette: { primaryLight: '#0F766E', primaryDark: '#5EEAD4', /* + ink/paper */ },
     fontStack: { sans: '...', mono: '...', serif: '...' },
   });
   const out = engineer(userPrompt, { brandTokens: PD_BRAND });
   ```

4. **Verify against PromptDolphin's own eval set:**
   ```bash
   node node_modules/@krentix/prompt-engine/eval/golden-runner.js
   ```

5. **Pin the major version** in package.json: `"@krentix/prompt-engine": "^2.1.0"`.

### PromptDolphin tokenization parity check (manual)

```js
import { engineer, ARCHETYPES, DOLPHIN_ENGINE_VERSION } from '@krentix/prompt-engine';
console.log(DOLPHIN_ENGINE_VERSION); // "2.1.0"
console.log(Object.keys(ARCHETYPES).length); // 9
const r = engineer('Write me a weekly news digest as HTML report', { brandTokens: PD_BRAND });
console.log(r.archetype); // "html_news_report"
console.log(r.enhanced.length); // > 2000 chars (design contract embedded)
```

### Rollback plan

If PromptDolphin sees a regression after migrating:
```bash
npm install @krentix/prompt-engine@1.x
```
v1.x will remain on npm. v2.x is API-compatible for the no-opts case, so
rollback should be needed only for output-shape-sensitive callers.

### Eval baseline (det-only)

```
v1.0.0    baseline:                 mean 85   archetype 75%   format 79%   brand-leaks 1
v2.0.0    Phase 1+9 (brand neutral): mean 91.9 archetype 95.8% format 95.8% brand-leaks 0
v2.1.0    Phases 3-7 integrated:    mean 93.2 archetype 95.8% format 95.8% brand-leaks 0
```

Run `node src/prompt-engineer/eval/golden-runner.js` to reproduce.

### Support
File issues at https://github.com/joelrobic-gif/krentix/issues with the `prompt-engine` label.
