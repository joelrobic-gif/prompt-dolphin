/**
 * src/prompt-engineer/brand/tokens.js
 *
 * L99 PE-Phase 1+9: brand-token contracts for the prompt engine.
 *
 * The engine ships brand-NEUTRAL by default. Callers (Krentix,
 * PromptDolphin, anonymous) inject brandTokens via
 * `engineer(input, { brandTokens })`. No product-specific identity
 * is baked into the engine code itself.
 */

export const TOKENS_VERSION = '1.0.0';

export const NEUTRAL_BRAND = Object.freeze({
  id: 'neutral',
  productName: 'Briefing',
  palette: Object.freeze({
    primaryLight: '#0F172A',
    primaryDark:  '#94A3B8',
    inkLight:     '#0F172A',
    paperLight:   '#FFFFFF',
    inkDark:      '#F8FAFC',
    paperDark:    '#0F172A',
  }),
  fontStack: Object.freeze({
    sans:  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    mono:  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    serif: 'Georgia, "Times New Roman", serif',
  }),
  designSystem: null,
  logoSvgRef:   null,
});

export const KRENTIX_BRAND = Object.freeze({
  id: 'krentix',
  productName: 'Krentix',
  palette: Object.freeze({
    primaryLight: '#1A3A6B',
    primaryDark:  '#8FB1E0',
    inkLight:     '#14141A',
    paperLight:   '#FAFAF7',
    inkDark:      '#F2F4F7',
    paperDark:    '#14181F',
  }),
  fontStack: Object.freeze({
    sans:  '"InterVariable", Inter, -apple-system, system-ui, sans-serif',
    mono:  '"JetBrainsMonoVariable", "JetBrains Mono", ui-monospace, monospace',
    serif: 'Source Serif 4, Georgia, serif',
  }),
  designSystem: 'Krentix design system v2.0',
  logoSvgRef:   '/components/mark.svg',
});

export function validateBrandTokens(tokens) {
  const errors = [];
  if (!tokens || typeof tokens !== 'object') {
    return { ok: false, errors: ['brandTokens must be an object'] };
  }
  if (typeof tokens.id !== 'string' || !tokens.id) errors.push('id required (string)');
  if (typeof tokens.productName !== 'string' || !tokens.productName) errors.push('productName required (string)');
  if (!tokens.palette || typeof tokens.palette !== 'object') {
    errors.push('palette required (object)');
  } else {
    for (const key of ['primaryLight', 'primaryDark', 'inkLight', 'paperLight', 'inkDark', 'paperDark']) {
      if (typeof tokens.palette[key] !== 'string' || !/^#[0-9a-f]{6}$/i.test(tokens.palette[key])) {
        errors.push(`palette.${key} must be 6-digit hex (e.g. "#1A3A6B")`);
      }
    }
  }
  if (!tokens.fontStack || typeof tokens.fontStack !== 'object') {
    errors.push('fontStack required (object)');
  } else {
    for (const key of ['sans', 'mono', 'serif']) {
      if (typeof tokens.fontStack[key] !== 'string' || !tokens.fontStack[key]) {
        errors.push(`fontStack.${key} required (string)`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

export function resolveBrand(tokens) {
  if (!tokens) return NEUTRAL_BRAND;
  const v = validateBrandTokens(tokens);
  if (!v.ok) return NEUTRAL_BRAND;
  return Object.freeze({
    id: tokens.id,
    productName: tokens.productName,
    palette: Object.freeze({ ...tokens.palette }),
    fontStack: Object.freeze({ ...tokens.fontStack }),
    designSystem: tokens.designSystem || null,
    logoSvgRef: tokens.logoSvgRef || null,
  });
}
