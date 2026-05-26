// PromptDolphin Engine v2 — adapter registry
// MIT License — Robic Direct Inc.

import claude  from './claude.json'  with { type: 'json' };
import chatgpt from './chatgpt.json' with { type: 'json' };
import gemini  from './gemini.json'  with { type: 'json' };
import copilot from './copilot.json' with { type: 'json' };
import grok    from './grok.json'    with { type: 'json' };

export const ADAPTERS = { claude, chatgpt, gemini, copilot, grok };
export const ADAPTER_ORDER = ['claude', 'chatgpt', 'gemini', 'copilot', 'grok'];
