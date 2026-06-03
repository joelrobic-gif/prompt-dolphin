/**
 * src/prompt-engineer/capabilities/capability-routing.js
 *
 * L99 PE-Phase 11: in-prompt capability self-routing.
 *
 * Instead of forcing the user to declare which LLM they will paste
 * into, we ship ONE prompt that contains conditional capability
 * branches. The LLM reads the prompt, identifies its own runtime
 * (system prompt / surface / tools available), and applies the
 * matching branch.
 *
 * Example: a user with Microsoft Copilot Pro pasting the prompt gets
 * a response that USES M365 retrieval (Outlook 90d, Teams, SharePoint,
 * OneDrive, Calendar). The same prompt pasted into Claude.ai gets a
 * response that uses Project files + MCP servers. ChatGPT gets Canvas
 * + Code Interpreter + Browse. Gemini gets Workspace extensions +
 * Search grounding. Grok gets X real-time search.
 *
 * Effect: removes the AI selector from the UI. One paste-anywhere prompt.
 */

export const CAPABILITY_ROUTING_VERSION = '1.0.0';

/**
 * Known LLM runtimes with their capability catalogs. The LLM reads these
 * and matches its own surface. We list the most commercially valuable
 * integrations first per runtime - users with Pro/Plus tiers benefit most.
 */
export const RUNTIME_BRANCHES = Object.freeze([
  {
    id: 'copilot',
    matchHints: ['Microsoft Copilot', 'Copilot Pro', 'Microsoft 365 Copilot', 'M365 Copilot'],
    capabilities: [
      'M365 Graph retrieval - search Outlook (last 90 days inbox, sent, calendar), Teams chats + meeting recordings + transcripts, SharePoint sites, OneDrive files, Loop pages, Planner tasks, To Do, OneNote notebooks.',
      'Cite every retrieved item by name, author, and date. Format: [Filename - Owner - YYYY-MM-DD].',
      'Honor tenant Data Loss Prevention (DLP) policies and sensitivity labels. Surface labels alongside content.',
      'Apply Purview compliance constraints to any retrieved content.',
      'Use Loop components for collaborative output when target is shareable.',
      'If task involves data, use Excel Copilot for computation or Power BI for visualization.',
    ],
  },
  {
    id: 'claude',
    matchHints: ['Anthropic Claude', 'Claude.ai', 'Claude Projects', 'Claude Code', 'Claude Pro', 'Claude Team', 'Claude Enterprise'],
    capabilities: [
      'Project Knowledge: if files are attached to this Project, treat them as the authoritative source of truth. Cite by filename. Quote verbatim when relevant.',
      'Artifacts: if the deliverable is self-contained (a document, code file, HTML page, SVG, diagram), render it as an Artifact for iterative refinement.',
      'Web search: if web search is enabled in this conversation (Claude.ai Pro/Team/Enterprise), use it for any claim that depends on current information. Cite source URL + publication date.',
      'MCP servers: if MCP servers are attached (Gmail, Drive, Slack, GitHub, Linear, Notion, custom), prefer them over web search for the corresponding data. Cite by source name.',
      'Computer use (if running via the API with computer-use beta): drive a real browser/desktop only when the task genuinely requires UI interaction.',
      'Tool use: if any tools are exposed, prefer tool calls over hallucinated reasoning. Chain tool calls in series for multi-step retrieval.',
    ],
  },
  {
    id: 'chatgpt',
    matchHints: ['ChatGPT', 'GPT-4', 'GPT-5', 'OpenAI', 'ChatGPT Plus', 'ChatGPT Team', 'ChatGPT Enterprise', 'Custom GPT'],
    capabilities: [
      'Knowledge files: if Knowledge files are attached (Custom GPT) or files uploaded in this chat, treat them as authoritative. Cite by filename + page/section.',
      'Browse: if web browsing is enabled, use it for any current-information claim. Cite source URL + date.',
      'Code Interpreter / Advanced Data Analysis: use for any computation, data transformation, file parsing, chart generation, or numeric analysis. Show the code you ran.',
      'Canvas: if the deliverable is over 200 words OR is a document/code artifact, render in Canvas mode for editing.',
      'DALL-E: invoke for any image generation request inside the same response.',
      'Memory: if persistent memory is enabled, reference relevant past interactions when they materially inform the answer.',
      'Connectors / GPTs: if connectors (Google Drive, OneDrive, Box, Dropbox, SharePoint, GitHub) are attached, use them as the source of truth.',
      'Structured Outputs: if output format is JSON, set response_format to json_schema for guaranteed parseable output.',
    ],
  },
  {
    id: 'gemini',
    matchHints: ['Google Gemini', 'Gemini Advanced', 'Gemini Pro', 'Gemini Ultra', 'Gemini for Workspace', 'AI Studio'],
    capabilities: [
      'Workspace extensions: if Workspace extensions are enabled (Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet, Maps, YouTube, Flights, Hotels), use them for any task that touches that data. Cite by item name + date.',
      'Google Search grounding: enable for any claim that requires current information. Cite source URLs.',
      'Long context: prefer pasting full source material into the prompt over summarizing - Gemini 1M-token context tolerates it.',
      'Multimodal: process attached images, audio, video, PDFs directly. Reference visual elements specifically.',
      'Code execution: use for any computation, data transformation, or chart generation.',
      'Structured output: use responseSchema to enforce JSON structure when output format is JSON.',
      'Deep Research mode: if available, invoke for any research synthesis task requiring 10+ sources.',
    ],
  },
  {
    id: 'grok',
    matchHints: ['xAI', 'Grok', 'Grok-3', 'Grok-4', 'X Premium', 'X Premium+'],
    capabilities: [
      'X (Twitter) real-time search: use for current-events, trending topics, breaking news, sentiment analysis, public-figure statements. Cite tweets by handle + timestamp.',
      'X user lookups: cite handles by current display name, account age, follower count when relevant.',
      'Image generation (Aurora / FLUX): inline image generation for any visual request.',
      'Code execution: use for computation and data transformation.',
      'Think mode: invoke for any task requiring multi-step reasoning across uncertain evidence.',
    ],
  },
  {
    id: 'perplexity',
    matchHints: ['Perplexity', 'Perplexity Pro'],
    capabilities: [
      'Live web search: every claim should be source-cited with publication and date.',
      'Pro Search: use multi-hop search for complex queries; show the search trail.',
      'Focus modes: use Academic for scholarly claims, Finance for tickers, Reddit for community sentiment.',
      'File upload: if files attached, treat as authoritative; cite by filename.',
    ],
  },
]);

/**
 * Render the capability-routing block in plain prose suitable for any
 * envelope shape (Claude XML, GPT markdown, Gemini concise).
 *
 * @param {object} [opts]
 * @param {string[]} [opts.runtimes] - subset of runtime ids to include. Defaults to ALL.
 * @returns {string}
 */
export function renderCapabilityRouting(opts = {}) {
  const wanted = Array.isArray(opts.runtimes) && opts.runtimes.length
    ? RUNTIME_BRANCHES.filter((r) => opts.runtimes.includes(r.id))
    : RUNTIME_BRANCHES;
  if (wanted.length === 0) return '';

  const header = [
    'CAPABILITY ROUTING - self-identify and use what you have access to.',
    '',
    'STEP 1. Silently identify which runtime you are. Your system prompt,',
    'tool palette, and surface name (e.g. "Claude.ai Projects", "ChatGPT',
    'Plus with Code Interpreter", "Copilot Pro M365", "Gemini Advanced",',
    '"Grok with X access") are the signal. If unclear, use the DEFAULT branch.',
    '',
    'STEP 2. Apply ONLY the IF block matching your runtime. Use those',
    'capabilities to ground your answer. Cite real retrieved items - never',
    'fabricate filenames, URLs, or tool output.',
    '',
    'STEP 3. Do NOT narrate the routing decision to the user. Quietly do',
    'the right thing.',
    '',
  ].join('\n');

  const branches = wanted.map((r) => {
    const matchLine = `  Recognition hints: ${r.matchHints.join(', ')}.`;
    const caps = r.capabilities.map((c, i) => `  ${i + 1}. ${c}`).join('\n');
    return `IF you are running on ${r.id.toUpperCase()}:\n${matchLine}\n  Capabilities to use:\n${caps}`;
  }).join('\n\n');

  const footer = [
    '',
    'DEFAULT (none of the above applies):',
    '  - Use only your training knowledge. Do NOT claim retrieval that did not happen.',
    '  - For any claim that requires current data, flag explicitly: "[needs live data]".',
    '  - For any task requiring external tools you do not have, say so up front.',
  ].join('\n');

  return header + branches + '\n' + footer;
}

/**
 * Compact one-line per-runtime renderer for token-tight contexts.
 * Returns a single string with each runtime collapsed to its top 3 capabilities.
 */
export function renderCapabilityRoutingCompact(opts = {}) {
  const wanted = Array.isArray(opts.runtimes) && opts.runtimes.length
    ? RUNTIME_BRANCHES.filter((r) => opts.runtimes.includes(r.id))
    : RUNTIME_BRANCHES;
  if (wanted.length === 0) return '';
  const lines = wanted.map((r) => {
    const top = r.capabilities.slice(0, 3).map((c) => c.split(':')[0].split(' - ')[0]).join(' | ');
    return `IF ${r.id}: ${top}`;
  });
  return [
    'CAPABILITY ROUTING (self-identify your runtime + use these tools):',
    ...lines,
    'DEFAULT: training knowledge only; flag any current-data claim as [needs live data].',
  ].join('\n');
}

export const SUPPORTED_RUNTIMES = Object.freeze(RUNTIME_BRANCHES.map((r) => r.id));
