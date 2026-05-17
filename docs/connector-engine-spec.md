# PromptDolphin — Connector-Aware Prompt Engine
## Product Specification v1.0 — L99 Grade

**Author:** Joel Robic, Robic Direct Inc.
**Date:** 2026-05-17
**Status:** Approved for Phase 4 implementation
**Replaces:** Simple 2-axis engine (archetype + model adapter)

---

## The Problem This Solves

Most users do not know that their AI assistant is radically more capable when
it knows what it has access to. A Copilot user who describes their task without
mentioning that Copilot can read their Outlook history, Teams recordings, and
SharePoint library is leaving 80% of the model's grounding capability on the
table. The same is true of a Gemini user who doesn't know to invoke Drive
context, or a ChatGPT user who forgets their memory contains prior project work.

Additionally, most users do not know that the output format instruction
transforms what comes back. "Write me a strategy brief" and "Write me a
strategy brief formatted as a PowerPoint outline with speaker notes" are not
the same prompt. The second is five times more useful.

PromptDolphin solves both problems without the user needing to understand
either. They answer five optional questions. The engine handles the rest.

---

## The Five Dimensions of an Optimal Prompt

Every engineered prompt is the intersection of five dimensions:

```
prompt = f(archetype, model_adapter, connector, output_format, review_mode)
         × depth_modifier
         × rich_media_modifier
```

The current engine covers archetype + model_adapter. This spec adds the rest.

---

## Dimension 1 — Connector Profile

The connector profile tells the model what data it has access to and how to
use it. It changes the grounding instruction section of the prompt.

### Connector Registry

**`none`** — No connectors. Model operates on training data only.
```
[grounding_instruction]:
Rely on your training knowledge. Where you are uncertain, say so explicitly
and flag it rather than speculating.
```

**`copilot_m365_standard`** — Microsoft 365 (Copilot in Teams/Word/Outlook).
```
[grounding_instruction]:
You have access to this user's Microsoft 365 environment. Before generating,
search for relevant context across:
- Outlook: emails, calendar entries, meeting requests
- Microsoft Teams: chat history, channel posts, meeting recordings and transcripts
- SharePoint: documents, site pages, lists
- OneDrive: personal files and shared documents

Reference specific documents, emails, or recordings by name where relevant.
If you surface a Teams meeting recording, note the meeting name and date.
Do not fabricate references. If nothing relevant is found, say so and proceed
on general knowledge.
```

**`copilot_m365_deep`** — M365 with explicit agent-mode instruction.
```
[grounding_instruction]:
You are operating as a Copilot agent with access to this user's complete
Microsoft 365 footprint. Conduct a thorough search before responding:

1. Scan Outlook for emails related to this task from the last 90 days.
2. Check Teams for meeting recordings or chats on this topic.
3. Search SharePoint and OneDrive for relevant documents, presentations,
   or spreadsheets.
4. Check the user's calendar for upcoming or recent meetings relevant
   to this task.

Synthesize what you find. Cite each source by name and date. If you find
conflicting information across sources, flag the conflict explicitly.
```

**`gemini_workspace`** — Google Workspace (Gemini for Google Workspace).
```
[grounding_instruction]:
You have access to this user's Google Workspace. Before generating, search for
relevant context across:
- Gmail: emails and threads related to this task
- Google Drive: documents, spreadsheets, presentations, and shared files
- Google Meet: meeting recordings and transcripts (if available)
- Google Calendar: upcoming and recent meetings

Reference specific documents and emails by name. Prioritize documents created
or edited in the last 60 days unless the task requires historical context.
```

**`chatgpt_memory_files`** — ChatGPT with memory + file uploads.
```
[grounding_instruction]:
Before generating, check: (1) your memory of this user's prior conversations,
preferences, and ongoing projects; (2) any files uploaded to this conversation.
Synthesize relevant context from memory and uploaded materials into your
response. Reference specific memory items or file names where relevant.
If memory contains conflicting information, note the conflict and ask
for clarification before proceeding.
```

**`claude_project`** — Claude Project with uploaded documents.
```
[grounding_instruction]:
Before generating, scan all documents in this Project for relevant context.
Reference specific documents by name. If a document contains data that
directly addresses the task, quote or paraphrase it with a citation.
Do not fabricate document references.
```

**`claude_web`** — Claude with web search enabled.
```
[grounding_instruction]:
Before generating, use web search to verify current facts, find recent data,
and check for information that may have changed since your training cutoff.
Cite all web sources inline with the claim they support. If a search returns
no useful results, proceed on training knowledge and flag the limitation.
```

**`perplexity_deep`** — Perplexity AI (real-time web synthesis).
```
[grounding_instruction]:
This task requires current, verified information. For every factual claim:
1. Conduct a targeted web search.
2. Cite the source inline (publication name + date).
3. Flag any claim you could not verify with current sources.
Do not rely on training data for time-sensitive facts. Prefer primary sources
over secondary summaries.
```

---

## Dimension 2 — Output Format

The output format instruction restructures the entire prompt output to match
the medium the user will actually use.

### Format Registry

**`prose`** — Default flowing text. No special instruction.

**`word_doc`**
```
[format_instruction]:
Structure your output for direct paste into Microsoft Word:
- Use clear heading levels: # for H1, ## for H2, ### for H3
- Plain bullet points only
- Format data as plain-text tables with | column separators
- No markdown code fences. No emoji.
- Paragraphs of 3-5 sentences for readability at 12pt.
```

**`powerpoint_outline`**
```
[format_instruction]:
Structure your output as a slide-by-slide PowerPoint outline.

For each slide:
[SLIDE N — Title]
• Bullet point (max 8 words)
• Bullet point (max 8 words)
• Bullet point (max 5 bullets per slide)
[SPEAKER NOTES: 2-3 sentences expanding the slide for the presenter]

Rules:
- Every slide title states the insight, not the topic
- No slide has more than 35 words of body copy
- Maximum 12 slides unless task explicitly requires more
- Open with an AGENDA slide and close with a NEXT STEPS slide
```

**`excel_table`**
```
[format_instruction]:
Structure your output as one or more tables for direct paste into Excel:
- Row 1: column headers (capitalized)
- Subsequent rows: data
- Use | to separate columns, newlines to separate rows
- Label multiple tables with a bold heading before each
- Include a SUMMARY row or column where analytically appropriate
- No prose paragraphs — all findings in table cells
```

**`exec_email`**
```
[format_instruction]:
Format your output as a ready-to-send executive email:
Subject: [insert subject line]

[Paragraph 1: context in 2 sentences]
[Paragraph 2: the main point or ask]
[Paragraph 3: next step or timeline]

[Sign-off]
Maximum 200 words.
```

**`html_report`**
```
[format_instruction]:
Format your output as clean semantic HTML:
- <h1>, <h2>, <h3> for hierarchy
- <p> for prose, <ul>/<li> for bullets, <table> for data
- Include a <summary> section at the top (2-3 sentences)
- No inline styles. No JavaScript. No external references.
- Close with a <footer> noting the date.
```

**`pdf_1pager`**
```
[format_instruction]:
Format as an executive one-pager (maximum 500 words):
Structure: Situation (2 sentences) | Key Finding (1 bold sentence) |
Evidence (3 bullets) | Recommendation (1-2 sentences) | Next Step (1 sentence)

Every sentence must earn its place. If the task cannot fit in 500 words,
prioritize the recommendation and flag what was omitted.
```

**`research_report`**
```
[format_instruction]:
Format as a comprehensive research report (target 3,000-6,000 words):

1. Executive Summary (300 words max)
2. Background and Context
3. Methodology
4. Findings (with subsections per major theme)
5. Analysis and Implications
6. Recommendations (numbered, prioritized)
7. Limitations and Caveats
8. Appendix (sources, supporting data)

Cite all factual claims. Flag uncertainty. Do not pad.
```

---

## Dimension 3 — Review Mode

Review mode adds a second pass by a named adversarial or editorial persona,
producing stronger output without requiring a second prompt from the user.

### Review Mode Registry

**`standard`** — Single-pass output. No additional instruction.

**`red_team`**
```
[review_instruction]:
After completing your primary response, switch roles. You are now a
rigorous skeptic with deep domain expertise who disagrees with your analysis.

Identify the three strongest objections to your own conclusions:
1. Where is the evidence weakest?
2. What assumption, if wrong, would invalidate the recommendation?
3. What did you not consider that a domain expert would immediately flag?

Format:
[RED TEAM ANALYSIS]
Objection 1: [state] / Counter: [strongest response]
Objection 2: [state] / Counter: [strongest response]
Objection 3: [state] / Counter: [strongest response]
Net assessment: [is the recommendation strengthened or weakened?]
```

**`peer_review`**
```
[review_instruction]:
After completing your primary response, take on the role of a senior editor
at The Economist reviewing this work before publication.

Review criteria: accuracy, clarity, logic, tone.
Provide exactly three specific improvement recommendations, then apply them.

Format:
[EDITOR'S NOTES]
1. [finding + specific change]
2. [finding + specific change]
3. [finding + specific change]
[REVISED OUTPUT]
[full revised response with all three changes applied]
```

**`steelman`**
```
[review_instruction]:
After completing your primary response, steelman the strongest possible
counterargument to your recommendation. Present it as its most articulate
advocate would. Then respond to it directly.

Format:
[STEELMAN]
[the strongest case against your recommendation]
[RESPONSE TO STEELMAN]
[why the recommendation stands, or how it should be modified]
```

---

## Dimension 4 — Output Depth

Controls length and completeness independent of format.

**`exec_summary`** — 300 words maximum. Lead with recommendation. No padding.

**`standard`** — No constraint. Appropriate length for the task.

**`detailed_brief`** — 800-1,200 words. Thorough but focused.

**`full_report`** — No limit. Comprehensive. A professional should be able to
act on it without reading anything else.

---

## Dimension 5 — Rich Media

Adds specialized output blocks beyond the main text.

**`slide_visuals`**
```
[rich_media_instruction]:
After your main response, add a [VISUAL DIRECTION] section. For each major
section, specify: chart/diagram type, what it should show, the data or
relationships it encodes. Specific enough for a designer to execute without
further briefing.
```

**`video_script`**
```
[rich_media_instruction]:
After your main response, add a [VIDEO SCRIPT] section — a 2-3 minute
talking-head script presenting the key findings.
Format:
[HOOK — 15 seconds]: opening that frames the problem
[BODY — 90 seconds]: 3 key points, each with one supporting fact
[CALL TO ACTION — 30 seconds]: what the viewer should do next
Include [PAUSE] markers and [B-ROLL SUGGESTION: ...] where relevant.
Write for speaking, not reading.
```

**`image_prompts`**
```
[rich_media_instruction]:
After your main response, add [IMAGE GENERATION PROMPTS] — 3 specific prompts
for DALL-E, Midjourney, or Stable Diffusion.

Each prompt specifies: Subject | Style | Composition | Mood | What to exclude
Format: [IMAGE N: full prompt text]
```

**`presentation_package`**
```
[rich_media_instruction]:
After your main response, provide a complete package:
[SLIDE OUTLINE]: full slide-by-slide outline
[VISUAL DIRECTION]: one specific visual per slide
[SPEAKER NOTES]: 3-5 sentences per slide
[HANDOUT SUMMARY]: 1-page prose summary for the audience
```

---

## Engine Architecture — Updated

### Updated `assemble()` Signature

```typescript
interface PromptConfig {
  task: string;
  archetype: Archetype;              // auto-detected
  model: Model;                      // user-selected
  connector?: ConnectorProfile;      // default: none
  outputFormat?: OutputFormat;       // default: prose
  reviewMode?: ReviewMode;           // default: standard
  richMedia?: RichMedia;             // default: none
  depth?: OutputDepth;               // default: standard
}
```

### Assembly Order (invariant across all model adapters)

```
1. ROLE          — who the model is
2. CONNECTOR     — what it has access to (set before task so model knows scope)
3. TASK          — what to do
4. FORMAT        — how to structure output
5. DEPTH         — how long/detailed
6. CONSTRAINTS   — what not to do
7. CRITIQUE      — self-review before finalizing
8. REVIEW_MODE   — adversarial or editorial pass (last — applies to full output)
9. RICH_MEDIA    — additional output blocks
```

---

## UX — Progressive Disclosure

**Tier 1 — Instant (current, unchanged):**
Task box → Engineer → 5 model buttons → Copy. 90% of new users stop here.

**Tier 2 — Power Up (optional, expands below output):**
```
▼ Power up this prompt

What does your AI have access to?
○ Nothing extra (training data only)
○ Microsoft 365 (email, Teams, SharePoint)
○ Microsoft 365 — deep search (agent mode)
○ Google Workspace (Gmail, Drive, Meet)
○ ChatGPT memory + my files
○ Claude Project documents
○ Claude with web search
○ Perplexity (real-time web)

What format do you need?
○ Written response        ○ PowerPoint with speaker notes
○ Word document           ○ Excel table
○ Executive email         ○ HTML for web
○ Executive one-pager     ○ Full research report

How detailed?
○ Executive summary (fits on one page)
○ Standard
○ Detailed brief
○ Full report
```

**Tier 3 — Advanced (nested collapse within Tier 2):**
```
▼ Advanced

Review mode:
○ Standard (single-pass)
○ Red team (adversarial self-critique)
○ Peer review (editor revision before I send)
○ Steelman (strongest counterargument)

Add to output:
☐ Visual direction (chart/diagram specs for each section)
☐ Video script (2-3 min talking head)
☐ Image prompts (DALL-E / Midjourney / Stable Diffusion)
☐ Full presentation package (slides + visuals + speaker notes + handout)
```

On any selection change: re-run `assemble()` with updated config. Output
refreshes in <1ms. No server call.

---

## Plain-Language Copy Map

| Technical | User sees |
|-----------|-----------|
| connector: copilot_m365_deep | "Microsoft 365 — deep search (agent mode)" |
| connector: gemini_workspace | "Google Workspace (Gmail, Drive, Meet)" |
| outputFormat: powerpoint_outline | "PowerPoint with speaker notes" |
| outputFormat: pdf_1pager | "Executive one-pager" |
| outputFormat: research_report | "Full research report" |
| reviewMode: red_team | "Red team (adversarial self-critique)" |
| reviewMode: peer_review | "Peer review (editor revision before I send)" |
| richMedia: video_script | "Video script (2-3 min talking head)" |
| depth: exec_summary | "Executive summary (fits on one page)" |
| depth: full_report | "Full report (no limit)" |

---

## Implementation Build Order (Phase 4)

**4.0.1** — `engine/src/connectors.ts`: ConnectorProfile type + 8-profile registry + `buildContext()`

**4.0.2** — `engine/src/formats.ts`: OutputFormat type + 8-format registry + `buildFormat()`

**4.0.3** — `engine/src/review.ts`: ReviewMode type + 4-mode registry

**4.0.4** — `engine/src/depth.ts` + `engine/src/rich-media.ts`: types + registries

**4.0.5** — `engine/src/index.ts`: updated `assemble()`, assembly order enforced, integration tests

**4.1** — `app/components/PowerUp.tsx`: Tier 2 UI, collapsible, all selectors, instant re-assembly

**4.2** — `app/components/Advanced.tsx`: Tier 3 UI, nested collapse

**4.3** — Onboarding tooltip system (first-visit, dismiss + localStorage)

---

## Phase 4 Self-Score Rubric (≥85 required)

| Criterion | Max | Pass condition |
|-----------|-----|----------------|
| All 8 connectors produce valid grounding instructions | 20 | No empty/malformed output |
| All 8 output formats structurally correct | 20 | PowerPoint has [SLIDE N] markers; Excel has pipe tables |
| All review modes append correct suffix | 15 | Red team has [RED TEAM ANALYSIS]; peer review has [EDITOR'S NOTES] |
| Assembly order correct across all model adapters | 20 | Connector always before task; review always last |
| Zero regressions on 8×5 archetype×model matrix | 15 | All existing prompts still valid |
| Progressive disclosure — new user never sees Tier 2 on first load | 10 | Tier 2 collapsed by default, no auto-expand |

---

## The Compound Effect

A Copilot user selecting:
- Archetype: `meeting` (auto-detected from "prep me for my QBR")
- Connector: `copilot_m365_deep`
- Format: `powerpoint_outline`
- Depth: `detailed_brief`
- Review: `red_team`
- Rich media: `presentation_package`

Gets a prompt that instructs Copilot to search Teams recordings and Outlook,
synthesize that context, produce a full slide deck with speaker notes and
visual direction, cover the topic at 800-1,200 word depth, then adversarially
stress-test its own output and produce an audience handout.

That prompt takes an expert 20-30 minutes to write from scratch.
PromptDolphin produces it in under 15 seconds from one sentence.

No other tool does this. That is the moat.

---

## Non-Negotiables Check

| Non-negotiable | This spec | Status |
|----------------|-----------|--------|
| Zero retention of prompt content | All assembly client-side. No content transmitted. | ✅ |
| Deterministic engine | No LLM call in assembly. Pure string functions. | ✅ |
| Open-source engine | All new modules (connectors, formats, review, depth, rich-media) in public engine repo. | ✅ |
| Four clicks from arrival to paste | Tier 1 path unchanged. Power Up is opt-in. | ✅ |
| No prompt engineering jargon | All user-facing copy in plain language (see copy map). | ✅ |

---

*Robic Direct Inc. — Joel Robic, Founder*
*Spec version: 1.0 — 2026-05-17*
