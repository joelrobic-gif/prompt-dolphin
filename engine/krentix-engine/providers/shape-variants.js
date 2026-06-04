/**
 * src/prompt-engineer/providers/shape-variants.js
 *
 * L99 PE-Phase 6: provider-aware envelope shapes.
 *
 * The base engine emits a Claude-style XML envelope (most portable).
 * Empirically, each provider parses different syntactic shapes more
 * faithfully:
 *
 *   - Claude:  XML tags <role>...</role> (native - what Anthropic trains on)
 *   - GPT:     Markdown sections with bold-emphasized headings
 *   - Gemini:  Concise plain-text with sectioned bullets
 *
 * shapeFor(provider) returns a renderer that takes the resolved envelope
 * pieces and produces the provider-tuned string. Default (no provider or
 * unknown) returns the Claude XML form for backward compatibility.
 */

export const SHAPE_VARIANTS_VERSION = '1.0.0';

export const SUPPORTED_PROVIDERS = Object.freeze(['claude', 'gpt', 'gemini', 'generic']);

function renderClaudeXml(parts) {
  const { role, context, format, constraints, critique, examples, refinement, capabilities, taskClarified, suffix, task } = parts;
  return [
    `<role>\n${role}\n</role>`,
    `<context>\n${context}\n</context>`,
    taskClarified && `<task_clarified>\n${taskClarified}\n</task_clarified>`,
    `<format>\n${format}\n</format>`,
    `<do_not>\n${constraints}\n</do_not>`,
    `<critique>\n${critique}\n</critique>`,
    examples && `<examples>\n${examples}\n</examples>`,
    refinement && `<refinement>\n${refinement}\n</refinement>`,
    capabilities && `<capabilities>\n${capabilities}\n</capabilities>`,
    suffix && `<extra>\n${suffix}\n</extra>`,
    `### New Input:\n${task}`,
  ].filter(Boolean).join('\n\n');
}

function renderGptMarkdown(parts) {
  const { role, context, format, constraints, critique, examples, refinement, capabilities, taskClarified, suffix, task } = parts;
  return [
    `**Role**\n${role}`,
    `**Context**\n${context}`,
    taskClarified && `**Task clarified (best-practice schema)**\n${taskClarified}`,
    `**Output format**\n${format}`,
    `**Constraints (do NOT)**\n${constraints}`,
    `**Self-critique**\n${critique}`,
    examples && `**Examples**\n${examples}`,
    refinement && `**Refinement**\n${refinement}`,
    capabilities && `**Capability routing**\n${capabilities}`,
    suffix && `**Additional**\n${suffix}`,
    `---\n**Task**\n${task}\n\nNow produce the response.`,
  ].filter(Boolean).join('\n\n');
}

function renderGeminiConcise(parts) {
  const { role, context, format, constraints, critique, examples, refinement, capabilities, taskClarified, suffix, task } = parts;
  return [
    `ROLE: ${role}`,
    `CONTEXT: ${context}`,
    taskClarified && `TASK_CLARIFIED:\n${taskClarified}`,
    `FORMAT: ${format}`,
    `CONSTRAINTS: ${constraints}`,
    `CRITIQUE: ${critique}`,
    examples && `EXAMPLES:\n${examples}`,
    refinement && `REFINEMENT:\n${refinement}`,
    capabilities && `CAPABILITY_ROUTING:\n${capabilities}`,
    suffix && `EXTRA: ${suffix}`,
    `\nTASK:\n${task}`,
  ].filter(Boolean).join('\n\n');
}

export function shapeFor(provider) {
  switch (provider) {
    case 'gpt':
    case 'openai':
    case 'chatgpt':
      return renderGptMarkdown;
    case 'gemini':
    case 'google':
      return renderGeminiConcise;
    case 'claude':
    case 'anthropic':
    case 'generic':
    default:
      return renderClaudeXml;
  }
}

export function detectProviderFromModel(modelId) {
  if (!modelId || typeof modelId !== 'string') return 'generic';
  const m = modelId.toLowerCase();
  if (/claude|sonnet|opus|haiku|anthropic/.test(m)) return 'claude';
  if (/gpt|chatgpt|openai/.test(m) || /\bo[1-9]\b/.test(m)) return 'gpt';
  if (/gemini|bison|palm|google/.test(m)) return 'gemini';
  return 'generic';
}
