# Methodology Reference

> **Ground truth for the engine.** Every adapter that Claude Code produces must follow the worked Claude adapter pattern below. Every prompt the engine generates must conform to the seven-component spine. Do not invent the schema — extend it.

---

## The seven-component methodology spine

The methodology spine is model-agnostic. Every prompt the engine assembles contains some subset of these seven components, transformed into the target LLM's native dialect.

| Component | Purpose | Always required? |
|---|---|---|
| **role** | Two or three specific named personas the LLM should embody. Tone cues. | Yes |
| **context** | Grounding instructions, reference material, framing. | Optional |
| **format** | The shape of the desired output — sections, lengths, structures. | Yes |
| **exclusions** | Failure modes to avoid. What NOT to do. | Yes |
| **reasoning** | How the LLM should think (chain-of-thought, extended thinking, none). | Optional |
| **critique** | The rubric the LLM applies before finalizing the output. | Yes |
| **examples** | Few-shot anchors when the task benefits from them. | Optional |

### Spine JSON schema (canonical)

```json
{
  "$schema": "https://l99prompt.com/schemas/spine.v1.json",
  "spine": {
    "version": "1.0.0",
    "components": ["role", "context", "format", "exclusions", "reasoning", "critique", "examples"],
    "required": ["role", "format", "exclusions", "critique"],
    "optional": ["context", "reasoning", "examples"]
  }
}
```

---

## The worked Claude adapter (ground truth — copy this pattern for every other adapter)

This is the canonical example. When Claude Code produces adapters for GPT-5, Gemini, and Copilot in Phase 2, they must follow this structure exactly. Field names, nesting, capability-branch shape — all preserved.

```json
{
  "$schema": "https://l99prompt.com/schemas/adapter.v1.json",
  "adapter": "claude",
  "version": "1.0.0",
  "model_family": "Anthropic Claude",
  "supported_versions": ["claude-opus-4-*", "claude-sonnet-4-*", "claude-haiku-4-*"],

  "idioms": {
    "delimiters": {
      "section_open": "<{section}>",
      "section_close": "</{section}>",
      "example_open": "<example>",
      "example_close": "</example>"
    },
    "preferred_structure": "xml_tagged",
    "markdown_tolerance": "medium",
    "prefers_explicit_scaffolding": true,
    "reasoning_invocation": "extended_thinking_adaptive",
    "tone_sensitivity": "high"
  },

  "component_expressions": {
    "role": {
      "template": "<role>\n{role_content}\n</role>",
      "guidance": "Two or three specific named personas. Include tone cues. Anchor on real-world references (e.g., 'a senior editorial designer at Pentagram')."
    },
    "context": {
      "template": "<context>\n{context_content}\n</context>",
      "grounding_prefix": "Before generating, "
    },
    "format": {
      "template": "<format>\n{format_content}\n</format>",
      "prefers_explicit_bullet_counts": true,
      "guidance": "State the exact structure. Section names. Length caps. Required elements."
    },
    "exclusions": {
      "template": "<do_not>\n{exclusion_list}\n</do_not>",
      "guidance": "List failure modes as bullet points. Be specific — 'no hedging language' beats 'be confident.'"
    },
    "reasoning": {
      "template": "",
      "note": "Claude uses adaptive extended thinking. Do NOT add 'think step by step' — it does nothing useful and clutters the prompt. Do NOT pass thinking blocks back on subsequent turns."
    },
    "critique": {
      "template": "<critique>\nBefore finalizing, apply this rubric:\n{critique_rubric}\nIf any answer is no, identify the specific failure and revise.\n</critique>",
      "guidance": "One to three concrete, high-stakes questions tied to the audience."
    },
    "examples": {
      "template": "<example>\n{example_content}\n</example>",
      "handoff_marker": "### New Input:",
      "guidance": "When provided, wrap each example in tags. After all examples, mark the actual task with the handoff marker."
    }
  },

  "capability_branches": {
    "profile_A": {
      "label": "Just the AI",
      "grounding_instruction": "Rely on your training knowledge. Where you're uncertain, say so explicitly.",
      "invoke_web_search": false,
      "invoke_tenant_data": false,
      "additional_components": []
    },
    "profile_B": {
      "label": "AI + Web & Memory",
      "grounding_instruction": "Use web search to verify current facts. Cite sources inline. Use any persistent memory you have on the user's preferences.",
      "invoke_web_search": true,
      "invoke_tenant_data": false,
      "additional_components": ["search_directives"]
    },
    "profile_C": {
      "label": "AI Embedded in Your Work",
      "grounding_instruction": "Use admin-granted data connectors. Scan relevant sources (emails, chat history, documents, calendar) for context before generating. Cite which sources you drew on.",
      "invoke_web_search": true,
      "invoke_tenant_data": true,
      "additional_components": ["tenant_grounding"]
    }
  },

  "assembly_order": [
    "role",
    "context",
    "format",
    "exclusions",
    "task",
    "examples",
    "critique"
  ]
}
```

---

## Example output — same archetype, three LLMs, Profile C

For the "Pharma regulatory submission draft" archetype, capability Profile C (AI Embedded in Your Work), task = "Draft a Health Canada NDS cover letter for our new oral antidiabetic":

### Claude output (excerpt)

```
<role>
You are a senior regulatory affairs strategist at a top-tier
pharmaceutical company, with 20 years of Health Canada submission
experience. You write with the precision of a regulatory lawyer
and the clarity of an executive communicator.
</role>

<context>
Before generating, use your access to my organization's data:
- Search SharePoint for prior Health Canada NDS submissions on
  oral antidiabetics or similar products
- Check Teams for recent discussions on this NDS with regulatory,
  clinical, and commercial teams
- Retrieve the company's standard cover letter template if available
- Review my emails for any feedback from Health Canada on related
  submissions
</context>

<format>
A formal NDS cover letter, single page, addressed to the Director
General of the Therapeutic Products Directorate at Health Canada.
Structure:
1. Salutation and submission identification
2. Product description (one paragraph)
3. Regulatory category and pathway
4. Key clinical and CMC data summary (three bullet points max)
5. Special considerations or requests
6. Closing with signatory and contact
</format>

<do_not>
- Use hedging language like "we believe" or "it is hoped that"
- Include any data not in the underlying NDS dossier
- Reference internal company terminology or codenames
- Make claims of superiority without RCT evidence
- Exceed one page
</do_not>

<task>
Draft a Health Canada NDS cover letter for our new oral
antidiabetic.
</task>

<critique>
Before finalizing, apply this rubric:
- Would a Health Canada reviewer reading only this letter know
  exactly what is being submitted and why?
- Is every factual claim sourced in the dossier?
- Does it fit on one page?
If any answer is no, identify the specific failure and revise.
</critique>
```

### GPT-5 output (same task, different idioms — excerpt)

```
### Role
Senior regulatory affairs strategist, 20 years of Health Canada
submission experience. Writes with regulatory-lawyer precision
and executive-communicator clarity.

### Grounding
Use your access to my organization's data:
- SharePoint: prior Health Canada NDS submissions on oral antidiabetics
- Teams: recent NDS discussions with regulatory, clinical, commercial
- Standard cover letter template
- Emails: any Health Canada feedback on related submissions

### Format
One-page formal NDS cover letter to the Director General, Therapeutic
Products Directorate. Structure:
1. Salutation and submission identification
2. Product description (one paragraph)
3. Regulatory category and pathway
4. Key clinical and CMC data summary (max 3 bullets)
5. Special considerations or requests
6. Closing with signatory and contact

### Exclusions
- No hedging ("we believe", "it is hoped")
- No data not in the underlying dossier
- No internal codenames
- No superiority claims without RCT evidence
- Max one page

### Task
Draft a Health Canada NDS cover letter for our new oral antidiabetic.

### Critique
Before finalizing:
- Would a Health Canada reviewer know what is being submitted and why?
- Is every factual claim sourced in the dossier?
- Does it fit on one page?
If no, identify the failure and revise.
```

### Copilot output (same task, tenant-grounded language — excerpt)

```
You are a senior regulatory affairs strategist with 20 years of
Health Canada submission experience. You write with regulatory-lawyer
precision and executive-communicator clarity.

Before generating, use your access to my organization's data:
- Search my SharePoint for prior Health Canada NDS submissions
  on oral antidiabetics or similar products
- Check my Teams for recent discussions on this NDS with the
  regulatory, clinical, and commercial teams
- Retrieve our standard NDS cover letter template
- Review my emails for any Health Canada feedback on related
  submissions

Draft a Health Canada NDS cover letter for our new oral antidiabetic.

Required structure: one-page formal letter to the Director General
of the Therapeutic Products Directorate. Sections: salutation and
submission ID, one-paragraph product description, regulatory category
and pathway, three-bullet clinical and CMC summary, special
considerations, closing with signatory and contact.

Avoid: hedging language, data not in the dossier, internal codenames,
superiority claims without RCT evidence, more than one page.

Before finalizing, verify: a Health Canada reviewer would know what
is being submitted and why; every factual claim is sourced in the
dossier; the letter fits on one page. If any verification fails,
identify the specific issue and revise.
```

---

## Why this matters

Same archetype. Same task. Same capability profile. Three different prompts the user could never produce on their own.

The user pasted four pieces of information into a website and copied the result. Sixty seconds end-to-end. Zero data retained.

This is the product.
