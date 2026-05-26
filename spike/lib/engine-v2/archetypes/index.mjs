// PromptDolphin Engine v2 — archetype registry
// MIT License — Robic Direct Inc.

import executive_email   from './executive_email.json'   with { type: 'json' };
import meeting_prep      from './meeting_prep.json'      with { type: 'json' };
import research_synthesis from './research_synthesis.json' with { type: 'json' };
import presentation_deck from './presentation_deck.json' with { type: 'json' };
import data_analysis     from './data_analysis.json'     with { type: 'json' };
import pharma_regulatory from './pharma_regulatory.json' with { type: 'json' };
import biotech_investor  from './biotech_investor.json'  with { type: 'json' };
import due_diligence     from './due_diligence.json'     with { type: 'json' };
import post_incident     from './post_incident.json'     with { type: 'json' };
import board_brief       from './board_brief.json'       with { type: 'json' };
import strategy_brief    from './strategy_brief.json'    with { type: 'json' };
import meta_prompt       from './meta_prompt.json'       with { type: 'json' };
import trading_system    from './trading_system.json'    with { type: 'json' };
import system_design     from './system_design.json'     with { type: 'json' };
import general           from './general.json'           with { type: 'json' };

export const ARCHETYPES = {
  executive_email,
  meeting_prep,
  research_synthesis,
  presentation_deck,
  data_analysis,
  pharma_regulatory,
  biotech_investor,
  due_diligence,
  post_incident,
  board_brief,
  strategy_brief,
  meta_prompt,
  trading_system,
  system_design,
  general,
};

export const ARCHETYPE_ORDER = [
  'executive_email',
  'meeting_prep',
  'research_synthesis',
  'presentation_deck',
  'data_analysis',
  'strategy_brief',
  'board_brief',
  'post_incident',
  'due_diligence',
  'pharma_regulatory',
  'biotech_investor',
  'trading_system',
  'system_design',
  'meta_prompt',
  'general',
];
