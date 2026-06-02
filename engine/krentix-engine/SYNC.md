# `@krentix/prompt-engine` — Sync Models

This directory is the canonical source of the prompt-engineering engine.
PromptDolphin (separate product) consumes it through ONE of these three
sync models. Pick one and stick to it.

---

## Option A — npm package (RECOMMENDED, production)

**Krentix side (one-time):**
```bash
cd src/prompt-engineer
npm publish --access public
```

Re-publish on every change: bump `version` in `package.json`, then `npm publish`.

**PromptDolphin side:**
```bash
npm install @krentix/prompt-engine
```

```js
import { engineer, ARCHETYPES } from '@krentix/prompt-engine';
const out = engineer('write me a news report', { archetype: 'auto' });
```

Receive updates via `npm update @krentix/prompt-engine`.

**Why recommended:**
- Versioned (semver) — PromptDolphin pins to a known-good release
- One source of truth — no drift between Krentix and PromptDolphin engines
- Bug fix in Krentix → publish → PromptDolphin upgrades when ready
- Standard tooling (lockfile, audit, dependabot)

**Trade-off:** requires npm publish access + publish ceremony per change.

---

## Option B — Git submodule

**PromptDolphin side (one-time):**
```bash
git submodule add -b main https://github.com/joelrobic-gif/krentix \
  vendor/krentix
git submodule update --init --recursive
```

Path-import:
```js
import { engineer } from './vendor/krentix/src/prompt-engineer/dolphin-engine.js';
```

Pull updates:
```bash
git submodule update --remote vendor/krentix
git commit -am 'chore: bump @krentix/prompt-engine submodule'
```

**Why:** zero publish ceremony, exact-SHA pinning.
**Trade-off:** clones entire Krentix repo (large), brittle for non-submodule-savvy teams.

---

## Option C — Manual copy script (fastest, dirtiest)

**PromptDolphin side:**

Add this script (`scripts/sync-prompt-engine.sh`):
```bash
#!/usr/bin/env bash
set -euo pipefail
KRENTIX_PATH="${KRENTIX_PATH:-../krentix}"
SRC="$KRENTIX_PATH/src/prompt-engineer"
DST="./src/prompt-engine"
[ -d "$SRC" ] || { echo "Set KRENTIX_PATH to the Krentix repo"; exit 1; }
rm -rf "$DST"
cp -R "$SRC" "$DST"
rm -f "$DST/package.json"
echo "Synced $SRC -> $DST"
```

Run weekly OR when Krentix releases:
```bash
KRENTIX_PATH=~/code/krentix ./scripts/sync-prompt-engine.sh
git add src/prompt-engine && git commit -m 'chore: sync prompt-engine from krentix'
```

**Why:** zero dependency on npm or submodules. Works for prototypes.
**Trade-off:** no version tracking, manual sync drift risk, no diff visibility.

---

## Decision matrix

| Criterion | A: npm | B: submodule | C: cp script |
|---|---|---|---|
| Version pinning | semver | git SHA | none |
| Update overhead | `npm publish` per change | `git submodule update` | manual run |
| Clean PromptDolphin tree | yes | adds `vendor/` | adds `src/prompt-engine/` |
| Diff visibility | npm diff | git diff | git diff |
| Bug-fix propagation | publish then install | submodule update | manual cp |
| Beginner-friendly | yes | needs submodule know-how | yes |
| Production-safe | yes | yes | risky |
| Tests/CI shareable | yes | yes | manual sync |

**Default recommendation: A (npm).** Start with C if pre-launch and tight on time; migrate to A when stable.

---

## Update protocol (any option)

1. Make change in `src/prompt-engineer/` here in Krentix repo
2. Run eval harness: `node src/prompt-engineer/eval/golden-runner.js`
3. Verify scores meet quality bar (>=85 mean across 20 golden prompts)
4. Bump `version` in `package.json` (semver: patch/minor/major)
5. Update `CHANGELOG.md`
6. Commit + tag: `git tag prompt-engine-v2.X.Y && git push --tags`
7. (Option A only) `npm publish` from the directory
8. PromptDolphin pulls the update via its chosen sync mechanism

---

## Brand-neutral default

The engine ships with a brand-neutral premium default (single dark accent
`#0F172A`, system serif/sans stack, AAA contrast). Krentix injects its own
tokens via `engineer(task, { brandTokens: KRENTIX_BRAND })`. PromptDolphin
either uses the neutral default OR injects PromptDolphin tokens the same
way. NO product-specific branding is baked into the engine code itself.
