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

export const CAPABILITY_ROUTING_VERSION = '1.1.0';

/**
 * Known LLM runtimes with their capability catalogs. The LLM reads these
 * and matches its own surface. We list the most commercially valuable
 * integrations first per runtime - users with Pro/Plus tiers benefit most.
 *
 * v1.1.0 expands shared-resource coverage: Copilot (+Whiteboard, Stream,
 * Yammer/Viva Engage, Forms, Power Platform); Gemini (+Keep, Tasks,
 * NotebookLM); Claude (named MCP integrations). New runtimes: notion_ai,
 * slack_ai, zoom_ai, atlassian_rovo, salesforce_einstein, box_ai.
 */
export const RUNTIME_BRANCHES = Object.freeze([
  {
    id: 'copilot',
    matchHints: ['Microsoft Copilot', 'Copilot Pro', 'Microsoft 365 Copilot', 'M365 Copilot', 'Copilot for Business'],
    capabilities: [
      'M365 Graph retrieval - search Outlook (last 90 days inbox, sent, calendar), Teams chats + meeting recordings + transcripts + channel files, SharePoint sites + lists + libraries, OneDrive files, Loop pages + components, Planner tasks, To Do, OneNote notebooks, Whiteboard boards, Stream video library, Yammer / Viva Engage posts + communities, Forms surveys + responses, Lists records.',
      'Cite every retrieved item by name, author, and date. Format: [Filename - Owner - YYYY-MM-DD].',
      'Honor tenant Data Loss Prevention (DLP) policies and sensitivity labels. Surface labels alongside content.',
      'Apply Purview compliance constraints to any retrieved content. Respect retention + records-management policies.',
      'Use Loop components for collaborative output when target is shareable. Use Loop Workspaces when output spans multiple pages.',
      'If task involves data: Excel Copilot for computation, Power BI for visualization, Power Automate for workflow, Power Apps if building a tool, Power Query for transforms.',
      'Viva Insights: pull productivity / collaboration / wellbeing signals when task involves team patterns.',
      'Search across tenant via Microsoft Search API for cross-app retrieval.',
    ],
  },
  {
    id: 'claude',
    matchHints: ['Anthropic Claude', 'Claude.ai', 'Claude Projects', 'Claude Code', 'Claude Pro', 'Claude Team', 'Claude Enterprise'],
    capabilities: [
      'Project Knowledge: if files are attached to this Project, treat them as the authoritative source of truth. Cite by filename. Quote verbatim when relevant.',
      'Artifacts: if the deliverable is self-contained (a document, code file, HTML page, SVG, diagram), render it as an Artifact for iterative refinement.',
      'Web search: if web search is enabled in this conversation (Claude.ai Pro/Team/Enterprise), use it for any claim that depends on current information. Cite source URL + publication date.',
      'MCP servers: if attached, prefer over web search for matching domains. Examples: Gmail (mail+attachments), Google Drive (docs+sheets+slides), Slack (channels+DMs+files), GitHub (repos+PRs+issues), Linear (issues+projects+cycles), Notion (pages+databases), Jira (issues+sprints), Confluence (pages+spaces), Asana (tasks+projects), Salesforce (accounts+opportunities), HubSpot (contacts+deals), Postgres / Supabase / BigQuery (queries), Stripe (customers+invoices), Sentry (issues+events), custom MCP servers. Cite by source name + record id.',
      'Computer use (if running via the API with computer-use beta): drive a real browser/desktop only when the task genuinely requires UI interaction.',
      'Tool use: if any tools are exposed, prefer tool calls over hallucinated reasoning. Chain tool calls in series for multi-step retrieval.',
      'Connectors (Claude.ai connectors panel): if Gmail / Calendar / Drive / Linear / etc connectors are toggled on, retrieve through them rather than asking the user to paste.',
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
      'DALL-E / Sora: invoke for any image/video generation request inside the same response.',
      'Memory: if persistent memory is enabled, reference relevant past interactions when they materially inform the answer.',
      'Connectors (ChatGPT Connectors panel): if Google Drive, OneDrive, Box, Dropbox, SharePoint, GitHub, Outlook, Slack, Notion, Linear, Salesforce, HubSpot, Zendesk, Jira, Confluence, Snowflake, Tableau are attached, use them as the source of truth. Cite by source + record id.',
      'Structured Outputs: if output format is JSON, set response_format to json_schema for guaranteed parseable output.',
      'Web Apps (where available): use ChatGPT app integrations (Booking.com, Expedia, Zillow, Wolfram, etc) when task aligns.',
    ],
  },
  {
    id: 'gemini',
    matchHints: ['Google Gemini', 'Gemini Advanced', 'Gemini Pro', 'Gemini Ultra', 'Gemini for Workspace', 'AI Studio', 'NotebookLM'],
    capabilities: [
      'Workspace extensions: if Workspace extensions are enabled (Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet, Maps, YouTube, Flights, Hotels, Keep notes, Tasks lists, Chat spaces, Sites pages), use them for any task touching that data. Cite by item name + date.',
      'Google Search grounding: enable for any claim that requires current information. Cite source URLs.',
      'Long context: prefer pasting full source material into the prompt over summarizing - Gemini 1M-token context tolerates it.',
      'Multimodal: process attached images, audio, video, PDFs directly. Reference visual elements specifically.',
      'Code execution: use for any computation, data transformation, or chart generation.',
      'Structured output: use responseSchema to enforce JSON structure when output format is JSON.',
      'Deep Research mode: if available, invoke for any research synthesis task requiring 10+ sources.',
      'NotebookLM (if running there): treat sources panel as ONLY authoritative knowledge; cite every claim back to source by document name + page.',
      'Imagen / Veo: invoke for image/video generation inside response.',
    ],
  },
  {
    id: 'grok',
    matchHints: ['xAI', 'Grok', 'Grok-3', 'Grok-4', 'X Premium', 'X Premium+', 'SuperGrok'],
    capabilities: [
      'X (Twitter) real-time search: use for current-events, trending topics, breaking news, sentiment analysis, public-figure statements. Cite tweets by handle + timestamp.',
      'X user lookups: cite handles by current display name, account age, follower count when relevant.',
      'Image generation (Aurora / FLUX): inline image generation for any visual request.',
      'Code execution: use for computation and data transformation.',
      'Think mode: invoke for any task requiring multi-step reasoning across uncertain evidence.',
      'DeepSearch: invoke for multi-hop web + X retrieval; show search trail.',
    ],
  },
  {
    id: 'perplexity',
    matchHints: ['Perplexity', 'Perplexity Pro', 'Perplexity Enterprise', 'Comet'],
    capabilities: [
      'Live web search: every claim should be source-cited with publication and date.',
      'Pro Search: use multi-hop search for complex queries; show the search trail.',
      'Focus modes: use Academic for scholarly claims, Finance for tickers, Reddit for community sentiment, Wolfram for math, YouTube for video transcripts.',
      'File upload: if files attached, treat as authoritative; cite by filename.',
      'Spaces (Pro): if running inside a Perplexity Space, treat space documents + collaborators as authoritative scope.',
    ],
  },
  {
    id: 'notion_ai',
    matchHints: ['Notion AI', 'Notion Q&A', 'Notion'],
    capabilities: [
      'Workspace search: retrieve from all pages, databases, comments accessible to the current user. Cite by page title + last-edited date.',
      'Databases: query database properties + filter views. Use database relations to traverse linked records.',
      'Q&A: when running in Notion Q&A, surface 5-10 relevant pages with snippets + always link back.',
      'Page hierarchy: respect parent/child page structure when summarizing or organizing.',
      'Honor workspace permissions: never surface a page the user does not have access to.',
    ],
  },
  {
    id: 'slack_ai',
    matchHints: ['Slack AI', 'Slack', 'Slackbot'],
    capabilities: [
      'Channel search: retrieve threads, messages, files across channels the user is in. Cite by channel + thread timestamp.',
      'Conversation summaries: condense long threads / channels into action-items + decisions + open questions.',
      'Workflow Builder: if output is repeatable, suggest as a Workflow.',
      'Canvas: render long-form output as a Slack Canvas (persistent doc inside channel) when appropriate.',
      'Huddles transcript: pull from huddle recordings if available.',
      'Honor channel privacy + DM boundaries; never quote a DM in a public channel summary.',
    ],
  },
  {
    id: 'zoom_ai',
    matchHints: ['Zoom AI Companion', 'Zoom AI', 'Zoom IQ'],
    capabilities: [
      'Meeting summaries: pull from Zoom recording + transcript + chat. Cite by meeting title + ISO timestamp.',
      'In-meeting Q&A: surface answers based on prior meeting context.',
      'Smart Recordings: extract highlights + chapters + action items.',
      'Team Chat search: retrieve from Zoom Team Chat channels.',
      'Email + calendar (Zoom Mail/Cal): retrieve if user is on Zoom Workplace.',
      'Whiteboard: pull from Zoom Whiteboard if discussion involved one.',
    ],
  },
  {
    id: 'atlassian_rovo',
    matchHints: ['Atlassian Rovo', 'Rovo', 'Atlassian Intelligence', 'Confluence AI', 'Jira AI'],
    capabilities: [
      'Rovo Search: federated search across Confluence pages, Jira issues, Bitbucket repos, Trello boards, third-party integrations (Google Drive, SharePoint, GitHub, Microsoft Teams, Figma). Cite by source app + record id.',
      'Confluence pages: retrieve by space, label, author, date. Cite by page title + space + version.',
      'Jira issues: query by project, JQL, assignee, sprint, label. Cite by issue key.',
      'Rovo Agents: invoke specialist agents for code-review / release-notes / decision-records when task matches.',
      'Honor Atlassian Cloud permissions: never surface restricted content.',
    ],
  },
  {
    id: 'salesforce_einstein',
    matchHints: ['Salesforce Einstein', 'Einstein', 'Einstein GPT', 'Agentforce', 'Salesforce AI'],
    capabilities: [
      'CRM retrieval: query Accounts, Opportunities, Leads, Contacts, Cases, Tasks, Events. Cite by Salesforce record id.',
      'Knowledge articles: pull from Salesforce Knowledge base; cite by article id + version.',
      'Data Cloud: query unified customer profiles + activation segments.',
      'Flow Builder: if output is repeatable, suggest as a Flow.',
      'Einstein Copilot Actions: invoke pre-built actions for case-routing / lead-scoring / forecast-summary when task matches.',
      'Respect Salesforce sharing rules + field-level security; never surface restricted fields.',
    ],
  },
  {
    id: 'box_ai',
    matchHints: ['Box AI', 'Box Hubs', 'Box'],
    capabilities: [
      'Box content search: query files + folders the user can access. Cite by Box file id + version.',
      'Box Hubs: if running inside a Hub, treat hub contents as authoritative scope.',
      'Multi-file Q&A: synthesize across selected files + cite per claim back to source file + page.',
      'Metadata extraction: pull custom metadata templates when relevant.',
      'Honor Box folder permissions + classifications; never surface a restricted file.',
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
