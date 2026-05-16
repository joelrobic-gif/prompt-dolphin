# Interview Script — Phase 0.5 Validation

> **20 minutes. Remote, screen share. Manual notes only — no recording.**

This script tests four things:
1. Do users recognize their LLM setup in the three capability profiles within 10 seconds?
2. Are the ten archetypes the tasks users actually do?
3. Can users complete the four-step flow in under 90 seconds end-to-end?
4. Does the generated prompt produce better output than what they normally write themselves?

Each task has explicit decision rules that determine whether the product moves forward as designed or gets reworked before Phase 1.

---

## Opening (2 minutes)

**Read verbatim:**

> "Thanks for the time. Before we start: nothing you say or type is recorded or saved anywhere. I'm taking notes for myself in a notebook. This is a private conversation."
>
> "I'm going to show you a rough prototype of a tool I'm building. I want to know what does and doesn't make sense to you. There's no wrong answer. The product fails if it doesn't work for people like you, so honest reactions are the most useful thing you can give me."

**Capture in notes:**
- Interview number: ____
- Date: ____
- Interviewee initials only: ____
- Industry / role: ____
- Primary LLM at work: ____

**Then ask:**

> "In one sentence, what do you use AI for at work right now?"

Capture the answer verbatim. This grounds the conversation in their reality.

---

## Task A — Profile recognition (3 minutes)

**Show the three capability profile cards** (printed sheet or shared screen):

- **Profile A — Just the AI.** Standalone assistant. No access to your work data. Looks like: claude.ai personal, ChatGPT Free/Plus, Gemini personal, Perplexity.
- **Profile B — AI + Web & Memory.** Web search active. Persistent memory. Can read files you upload. Looks like: ChatGPT Pro/Team, Claude Projects, Claude Pro with memory, Gemini Advanced.
- **Profile C — AI Embedded in Your Work.** Reads your emails, chats, files, calendar. Looks like: Microsoft 365 Copilot, Gemini in Workspace, ChatGPT Enterprise with connectors, Claude Enterprise.

**Say:**

> "Look at these three cards. Pick the one that most matches your setup at work. Don't overthink it — first reaction."

**Time and capture:**
- Time to decision: _____ seconds (start timer when they begin reading)
- Profile chosen: A / B / C
- Confidence (ask explicitly): "On a scale of 1 to 5, how confident are you in that choice?" _____

**If confidence is <4:**
> "What made it hard? What was unclear?"

Capture answer verbatim.

**If they picked a profile but it's clearly wrong** (e.g., they have Copilot but picked Profile A):
> "Just curious — does your setup at work include access to your emails and SharePoint through the AI?"

Capture whether they realize they have Profile C and didn't recognize it.

### Decision rule (applied across all 10 interviews)

- If **<7 of 10** users pick their profile within **10 seconds** with **confidence ≥4**, the profiles get redesigned before Phase 4.
- Common reasons for redesign: card descriptions too long, technical jargon, profile names misleading.

---

## Task B — Archetype selection (3 minutes)

**Show the ten archetypes** (printed list):

Generic:
1. Executive email / communication
2. Meeting preparation brief
3. Research synthesis
4. Presentation deck outline
5. Data analysis request

Domain-specific:
6. Pharma regulatory submission draft
7. Biotech investor update
8. Due-diligence quick look (M&A, investment)
9. Post-incident review (compliance, quality)
10. Board-ready strategic brief

**Say:**

> "Which of these do you actually do at work in a typical week or month? Circle all that apply."

**Capture:**
- Archetypes circled: _____
- Archetypes NOT circled: _____

**Then ask:**

> "Is there a task you do regularly that isn't on this list?"

Capture verbatim, every task they mention.

### Decision rule

- Archetype circled by **<3 of 10** users → drop from V1.
- Task mentioned by **≥3 of 10** users that isn't on the list → add to V1 (or V1.5 if effort is high).

---

## Task C — End-to-end flow (8 minutes)

**Send the prototype URL** (the Railway preview URL from Phase 0.5 spike).

**Say:**

> "Open this URL. Without my help, try to generate a prompt for a real task you have coming up this week. Think out loud while you do it — tell me what you're seeing, what you're clicking, what you expect to happen. I won't help unless you're completely stuck for more than 60 seconds."

**Start a timer** when they click the URL. **Stop it** when they say "I think I have a prompt I'd use" or copy the output.

**Capture during the task:**
- Time from URL click to copy: _____ seconds
- Specific moments of confusion (verbatim what they said, what they were doing):
- Did they hit the wrong step at any point? Y/N: _____
- Did they ask for help? Y/N. If yes, when: _____

**After they finish, ask:**

> "On a scale of 1 to 5, how usable is the prompt you generated?" _____

> "What made it good or bad?"

Capture verbatim.

### Decision rule

- If median time-to-copy across all 10 interviews is **>90 seconds**, the flow is too long. Simplify before Phase 4.
- If **<7 of 10** rate the prompt **≥4 of 5**, the adapter logic needs rework before Phase 4.

---

## Task D — Paste test (3 minutes)

**Say:**

> "Now open the LLM you actually use at work and paste in the prompt. Let's see what comes out. I'm curious whether it's better, worse, or the same as what you usually get."

**Watch the output. Don't comment. Capture:**
- LLM used: _____
- Output quality reaction (their verbatim words): _____
- Better / Worse / Same than usual: _____

**Then ask:**

> "Would you use this for real work?"

Capture Y / N and any qualifier.

> "What would stop you from using it?"

Capture verbatim. This is the most useful single question in the script.

### Decision rule

- If **<7 of 10** say "yes I'd use this," there's a fundamental fit problem. Re-plan the product before Phase 1.

---

## Closing (1 minute)

> "Last question: hypothetically, this thing as you saw it today, would you pay for it?"

> "If yes — what's a reasonable monthly price for unlimited use? And what's the highest you'd consider before walking away?"

Capture both numbers.

> "Thank you. Anything else you want to tell me about how AI at work is or isn't working for you?"

Capture any closing comment.

> "I'll send you a thank-you note within a day. If you want to see the final product when it launches, just reply to that note and I'll add you to the list."

---

## After the interview

**Within 1 hour:**

1. Write up notes immediately while fresh, in `validation/interview-N-notes.md`. Use the template below.
2. Send thank-you email within 24 hours.
3. If they wanted updates, capture their email separately (not in notes file) and add to a launch list.

**Template for `interview-N-notes.md`:**

```markdown
# Interview N — [YYYY-MM-DD]

## Demographics
- Industry / role: ...
- Primary LLM: ...
- Interview length: __ min

## Task A — Profile recognition
- Time: __ sec
- Profile picked: __
- Confidence: __ / 5
- Confusion: ...
- Was their choice correct for their actual setup? Y / N

## Task B — Archetype selection
- Circled: 1, 3, 5, 6, 10
- Not circled: 2, 4, 7, 8, 9
- Other tasks mentioned: ...

## Task C — End-to-end flow
- Time to copy: __ sec
- Confusion moments: ...
- Prompt usability rating: __ / 5
- Why: ...

## Task D — Paste test
- LLM used: ...
- Quality reaction: ...
- Better / Worse / Same: ...
- Would use for real work: Y / N
- Blocker: ...

## Closing
- Would pay: Y / N
- Reasonable price: $__/mo
- Walk-away price: $__/mo
- Other comments: ...

## My observations (not theirs)
- ...

## Implications
- ...
```

---

## Synthesis after all 10

Produce `validation/synthesis.md` with:
- All five decision rules applied with explicit outcomes
- Aggregate metrics (median time, modal profile choice, archetype circle counts, willingness-to-pay distribution)
- Surprising findings (things heard ≥3 times that weren't on our radar)
- Explicit go / no-go / revise on each of the five rules
- Recommended changes for Phase 1 onwards, prioritized

Then update `docs/readiness.md` with Phase 0.5 complete and self-score.
