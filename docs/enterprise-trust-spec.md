# PromptDolphin — Enterprise Trust & Corporate Adoption Spec
## Product Specification v1.0 — L99 Grade

**Author:** Joel Robic, Robic Direct Inc.
**Date:** 2026-05-17
**Status:** Approved for Phase 3-5 implementation
**Scope:** Network compatibility, zero-retention architecture, IT/CISO approval,
employee adoption design

---

## The Problem

Corporate users face three blockers that have nothing to do with product quality:

1. **Network blockers.** Zscaler, Netskope, Cisco Umbrella, and Palo Alto proxy
   firewalls inspect or block sites that transmit user input to external servers.
   DLP (data loss prevention) policies flag any tool where sensitive text could
   leave the corporate perimeter.

2. **Trust deficit.** "AI tool that processes your business information" triggers
   IT and legal review by default. Without verifiable, auditable zero-retention
   architecture, that review takes weeks and often ends in denial.

3. **Corporate culture friction.** Even when a tool is safe and approved, employees
   don't adopt tools their organization hasn't explicitly endorsed. The path to
   mass adoption in regulated industries runs through IT and management
   endorsement, not individual enthusiasm.

PromptDolphin solves all three by architecture, not by policy. The site is
designed so that a CISO can verify our claims independently in under 10 minutes,
so that DLP proxies have nothing to inspect, and so that IT departments are
motivated to proactively recommend the tool.

---

## Part 1 — Network Compatibility

### Why Most Corporate AI Tools Get Blocked

Corporate DLP proxies inspect outbound traffic. When a user types into an AI
tool and clicks submit, the text travels from the browser to the tool's server.
The proxy sees this. If the text matches classification rules (customer names,
financial figures, health information, IP), the request is blocked or logged.

Standard enterprise AI tool architecture:
```
User types → browser → POST /api/chat → tool's server → AI API → response
                ↑
          DLP PROXY INSPECTS HERE — sees sensitive content in request body
```

### PromptDolphin's Architecture

```
User types → browser → [all processing here, in RAM] → clipboard
               ↑
    DLP PROXY SEES: GET /index.html (static file delivery only)
    No POST. No user content transmitted. Nothing to inspect.
```

PromptDolphin is a static HTML/JS file. The prompt engineering engine is
100% client-side JavaScript. The browser downloads the app once (the static
bundle), then all processing happens in the user's browser RAM. No user input
ever leaves the device.

**What the corporate proxy sees:**
- `GET https://promptdolphin.com/` → 200 OK (fetching the app bundle)
- Nothing else.

**What the corporate proxy cannot see:**
- User's task description
- Generated prompt
- Model selection
- Any output

This is structural impossibility, not policy. The code contains no
transmission mechanism for user content. The engine repo is public. Verify it.

### HTTP Security Headers — Verifiable by IT

Every response from promptdolphin.com includes:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'none';
  frame-ancestors 'none';
  form-action 'none';
  base-uri 'self';

Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

The critical line: **`connect-src 'none'`**. This instructs the browser to
refuse all outbound network connections from the page — including to
promptdolphin.com's own servers. IT can verify this header with any HTTP
inspection tool. It is browser-enforced, not a server-side promise.

### Implementation — Next.js Config

```typescript
// next.config.ts (spike + production)
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

Target: **A+ on securityheaders.com**. Must pass before launch.

### Corporate Allowlisting — IT Quick Reference

```
Domains to allowlist:
  promptdolphin.com
  www.promptdolphin.com
  analytics.promptdolphin.com (self-hosted Plausible, aggregate page views only)

Traffic type: HTTPS GET only. No POST requests containing user data.
Data classification: No sensitive data transmitted. Static asset delivery.
Cookies: None beyond functional session. No persistent tracking cookies.
Third-party calls: None. connect-src 'none' enforces this at browser level.
Analytics: Self-hosted Plausible. Collects page views, referrer, device type.
           No user content. No IP storage. GDPR-compliant by design.

Compatible with:
  ✓ Zscaler Internet Access
  ✓ Netskope Cloud Security
  ✓ Cisco Umbrella
  ✓ Palo Alto Prisma Access
  ✓ Microsoft Defender for Endpoint (web content filtering)
  ✓ Symantec Web Security Service
  ✓ Forcepoint Web Security

Security contact: security@promptdolphin.com
Full documentation: promptdolphin.com/trust
```

---

## Part 2 — Zero-Retention Architecture ("Goldfish Memory")

### The Claim

**PromptDolphin remembers nothing. Not your task. Not your prompt.
Not that you were here. Close the tab and it's gone. Like a goldfish.**

This is not a privacy policy. It is a structural fact.

### Technical Proof

**Stored during a session (browser RAM only):**
- `task` — string. React state. Never written to localStorage, sessionStorage,
  IndexedDB, or any cookie.
- `output` — string. Same.
- `activeModel` — string. Same.
- `archetype` — string. Same.

RAM is cleared automatically when the tab is closed or refreshed.

**Stored persistently (localStorage — content-free):**
- `pd_count` — integer. Number of prompts generated this rolling 30 days.
  No content. Used only to enforce the Free tier 10-prompt limit.
- `pd_count_reset` — timestamp. When the 30-day window resets.

**Never stored, anywhere:**
- Task text
- Generated prompt text
- Any model or format selections linked to any identity
- Any output

**Server-side logs (Railway):**
Standard HTTP access logs: timestamp, path, status code, response size.
The path is always `/`. There is no request body on a static site GET.
No user content can appear in server logs because no user content is sent.

**Analytics (self-hosted Plausible):**
- Page view events: URL path, referrer domain, device type, country.
- No user ID. No session ID linked to content.
- No custom events that capture input values.
- Schema is public. Our instance collects Plausible's minimum default set.

### Goldfish Memory — UI Treatment

The goldfish appears in three places. Never intrusive. Always honest.

**1. Below the input box (persistent, small):**
```
🐟 Goldfish memory — nothing you type is stored or transmitted.
```

**2. Output area (on first use):**
```
Copied. Forgotten. [timestamp of session start]
```
The timestamp shows when this session started and reinforces the
session-scoped nature of any data.

**3. Footer (every page):**
```
🐟 Goldfish memory · Open-source engine · connect-src: none
```
With links to /trust and the GitHub engine repo.

### Privacy Policy — Plain Language, One Page

**URL:** `/privacy`

```
PromptDolphin Privacy — Plain Language
Last updated: [date]

What we collect:
We collect almost nothing.

What we do NOT collect (confirmed by our open-source code):
- Anything you type into the prompt box
- Your generated prompts
- Your name, email, or employer
- Your browsing history on or off this site

What we collect:
- Page views: timestamp, page path, country, device type
  (via self-hosted Plausible analytics — no cross-site tracking)
- Usage counter: how many prompts you've generated this month
  (stored only in your browser — we cannot see it)

How your data is processed:
Everything happens in your browser. We never receive your task text or
generated prompts. Enforced by our connect-src: none security header.
Verified by our MIT-licensed open-source engine on GitHub.

Your rights:
EU/UK (GDPR): access, rectification, erasure, portability.
  For analytics: we hold no data linked to your identity.
California (CCPA): we do not sell or share personal information.

Contact: privacy@promptdolphin.com
Data controller: Robic Direct Inc.
DPA available on request for enterprise customers.
```

---

## Part 3 — The /trust Page

A page written specifically for IT administrators, CISOs, and legal/compliance
reviewers. Not for marketing. Written in the language they use.

**URL:** `/trust`

### Page Structure

**Header:**
```
PromptDolphin Security & Privacy
Written for IT administrators, not marketing.
```

**Section 1 — How it works (plain steps)**
```
1. You visit promptdolphin.com. Your browser downloads the app —
   one HTML file plus a JavaScript bundle. This is the only server request.

2. You type your task. It stays in your browser's RAM.

3. You click "Engineer this prompt." JavaScript assembles the output
   using string templates. No network call is made.

4. You copy the output. It goes to your clipboard. The page forgets it.

5. You close the tab. Everything is gone.

There is no step where your content touches our servers.
Not because of our privacy policy. Because the code has no mechanism to
send it.
```

**Section 2 — Verify our claims**
```
You don't have to take our word for it.

Verify the security headers (1 minute):
→ securityheaders.com → scan promptdolphin.com
   You will see A+ rating and connect-src: none confirmed.

Verify zero network transmission (2 minutes):
→ Open promptdolphin.com in any browser
→ Open DevTools → Network tab
→ Type a task. Click "Engineer this prompt."
→ You will see zero POST requests. Zero requests containing your text.
   The only requests are GET requests for static assets.

Read the engine source code (10 minutes):
→ github.com/joelrobic-gif/prompt-dolphin (engine/ directory)
→ The assemble() function is string concatenation only.
   No fetch(), no XMLHttpRequest, no WebSocket, no navigator.sendBeacon().

Run it offline (proof):
→ Clone the repo. Run npm install && npm run build.
→ Serve the output locally with no internet connection.
→ It works identically. That is the proof.
```

**Section 3 — Network compatibility**
```
PromptDolphin is compatible with enterprise web proxies and DLP tools
because it generates no outbound requests containing user data.

Verified compatible with:
✓ Zscaler Internet Access / CASB
✓ Netskope Cloud Security Platform
✓ Cisco Umbrella / OpenDNS
✓ Palo Alto Prisma Access / Cortex
✓ Microsoft Defender for Endpoint (web protection)
✓ Symantec Web Security Service
✓ Forcepoint Web Security

The connect-src: none CSP header provides browser-level enforcement
as a second layer, independent of network-level controls.
```

**Section 4 — Risk assessment data**
```
Data classification:      No sensitive data leaves the user's device.
Authentication:           Not required. No corporate credential integration.
Data residency:           Not applicable. No data is stored.
Cookies:                  None for tracking. pd_count (integer) in localStorage
                          for Free tier limit enforcement. Content-free.
Third-party scripts:      None loaded. Verified by CSP default-src 'self'.
Third-party data processors: Self-hosted Plausible for aggregate analytics.
                          No other third parties receive any data.
Penetration testing:      [link to report when available]
SOC 2 Type I:             Roadmap — audit scheduled Q[X] 20[XX].
Bug bounty:               security@promptdolphin.com
DPA:                      Available on request for enterprise customers.
Open-source engine:       MIT license. Auditable by your security team.
```

**Section 5 — Deploy company-wide**
```
Recommended steps for IT administrators:
1. Run the verification checks above.
2. Add promptdolphin.com to your approved sites list.
3. Download the corporate onboarding kit (PDF) below and share with
   your team lead or department head.
4. Optional: contact us for an enterprise agreement with centralized
   aggregate usage reporting.

Contact: security@promptdolphin.com
Enterprise enquiries: enterprise@promptdolphin.com
```

---

## Part 4 — Site Design for Corporate Adoption

### Design Principle

Every design decision on promptdolphin.com either eliminates a compliance
concern or creates an institutional endorsement signal.

### What NOT to Build (additions to design exclusion charter)

- **No cookie consent banner.** We use no tracking cookies. A banner implies
  we do. The absence of a banner is itself a trust signal.
- **No session recording.** Hotjar, FullStory, Microsoft Clarity — any tool
  that records user sessions could capture prompt text. Banned permanently.
- **No A/B testing scripts** that log user behavior.
- **No social sharing buttons** that could signal user activity to third parties.
- **No third-party chat widgets** that capture conversation.
- **No "powered by [AI company]"** attribution that implies data sharing.
- **No testimonials with company logos** without explicit written permission
  from the company's legal or marketing team.
- **No performance trackers** (New Relic, Datadog RUM) that could log
  request payloads.
- **No Sentry or error tracking** — error messages can contain user input.
  Use Railway's built-in structured logging (errors only, no content).

### What Belongs

- **`connect-src: none` security header badge** on /trust — verifiable link.
- **Open-source engine badge** on every page (links to GitHub).
- **Goldfish memory indicator** below input (persistent, quiet, honest).
- **/trust link in footer** — visible on every page without being intrusive.
- **No-tracking-cookies footer note** — one line, no banner.
- **DPA availability notice** on /trust and /privacy.

---

## Part 5 — Corporate Onboarding Kit

A downloadable one-page PDF (front/back) for employees to share with their
manager or IT before using PromptDolphin at work.

**Design:** EB Garamond / Robic Direct brand. Deep navy and copper.
No stock imagery. No emoji. Professional enough to forward to a CISO.

**Front — For the employee:**
```
PromptDolphin at Work
Is it approved? Here's what IT needs to know.

What it does:
Converts your task description into a precision-engineered prompt for
Claude, ChatGPT, Gemini, Copilot, or Grok. Free. Instant. Private.

What it doesn't do:
✗ Store what you type
✗ Send your content to any server
✗ Require a corporate login
✗ Use tracking cookies or third-party scripts
✗ Learn from your inputs

Verified by:
· Open-source engine (MIT license, readable by your security team)
· connect-src: none security header (browser-enforced, not policy-enforced)
· Self-hosted analytics only (no third-party tracking)

promptdolphin.com/trust — full IT documentation
```

**Back — For IT:**
```
For IT Administrators — Technical Summary

Architecture:
Static Next.js application on Railway CDN. All prompt engineering
executes client-side in browser RAM. Zero server-side processing
of user content.

Verification (10 minutes):
1. securityheaders.com → scan promptdolphin.com → confirm A+ / connect-src: none
2. Browser DevTools → Network → type task → click Engineer → confirm zero POST
3. github.com/[engine-repo] → read assemble() → confirm no fetch() calls
4. Build and serve locally → confirm works offline after initial download

Key security headers:
Content-Security-Policy: connect-src 'none' [full policy at /trust]
HSTS: max-age=31536000; preload
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer

Network traffic:
HTTPS GET for static assets only. No outbound POST with user data.
No WebSocket. No navigator.sendBeacon().

DLP compatibility:
✓ Zscaler ✓ Netskope ✓ Umbrella ✓ Palo Alto Prisma ✓ Defender

Allowlist: promptdolphin.com, www.promptdolphin.com
Contact: security@promptdolphin.com
Full documentation: promptdolphin.com/trust
DPA: Available on request
```

---

## Part 6 — Why Companies Would Encourage This

The strategic argument for IT/management endorsement:

**1. Productivity without procurement risk.**
Employees get better AI outputs without training, without IT building custom
tooling, without any data leaving the corporate perimeter. The marginal risk
is negative — it reduces risky behavior.

**2. Reduces shadow AI risk.**
Employees who can't write good prompts are pasting sensitive content into AI
tools with unknown privacy policies. PromptDolphin gives them better outputs
through a verified-safe tool — reducing the incentive to use riskier
workarounds.

**3. Zero IT overhead.**
No SSO integration. No user provisioning. No license management. No SAML.
No helpdesk tickets. IT approves one domain. Done.

**4. Auditable open source.**
The engine is MIT-licensed and public. A security team can read every line
of code that runs in their employees' browsers. No black box.

**5. Makes existing M365/Copilot investment go further.**
The output is optimized for Copilot ($30/user/month enterprise license).
IT can position PromptDolphin as a Copilot enhancer — justifying existing
spend rather than adding new spend.

**6. Free for individual employees.**
No budget approval. No procurement. IT approves the domain.
Employees use it. Managers see productivity improvements.
Enterprise tier (unlimited, aggregate reporting) is a later upsell —
not a prerequisite.

---

## Part 7 — The Goldfish Brand Strategy

The goldfish is a symbol of a specific, verifiable technical claim:
**session-scoped memory with zero persistence**. Goldfish are famously
(if mythically) forgetful. The association is immediate, non-threatening,
and professionally memorable — the opposite of a corporate AI anxiety trigger.

**Approved language:**
- "Goldfish memory — forgets everything when you close the tab."
- "Client-side only. Open source. Auditable."
- "connect-src: none — enforced by your browser, not our promise."
- "Nothing leaves your browser. Not because we say so. Because the code has
  nowhere to send it."

**Banned language:**
- "Privacy-first" — overused, unverifiable claim.
- "Secure" — too vague. Replace with specific technical claims.
- "Enterprise-grade" — consultant-speak. Means nothing.
- "Zero-knowledge" — technically incorrect in the cryptographic sense.
- "GDPR-compliant" without the /trust page evidence to back it.
- "AI-powered" — banned by design exclusion charter.
- "We take your privacy seriously" — every company says this.

---

## Implementation Build Order

**Phase 3 (alongside design system):**

**3.1 — Security headers** (1 hr)
- Add to next.config.ts
- Deploy
- Verify: securityheaders.com must return A+

**3.2 — /trust page** (6 hrs)
- Architecture diagram (inline SVG, no external resources)
- All verify links live and tested
- Network compatibility checklist
- Risk assessment table
- DPA request link (mailto: only)
- Download link for onboarding kit PDF

**3.3 — /privacy page** (2 hrs)
- Plain language, one page
- Joel sign-off required before shipping

**3.4 — Goldfish UI** (2 hrs)
- Persistent trust badge below input
- Footer: "🐟 Goldfish memory · Open-source engine · connect-src: none"
- Links from footer: /trust, GitHub engine repo

**3.5 — Corporate onboarding kit PDF** (3 hrs)
- Brand-consistent, EB Garamond
- Front: employee version
- Back: IT version
- Downloadable from /trust

**Phase 5 (QA):**
- securityheaders.com scan → A+ required
- DevTools Network tab verification → zero POST with user content
- Lighthouse privacy audit
- Legal review of /privacy
- IT simulation: have a non-technical person complete verification steps
  in under 10 minutes

---

## Self-Score Rubric — Enterprise Trust (≥85 required before launch)

| Criterion | Max | Pass condition |
|-----------|-----|----------------|
| A+ on securityheaders.com with connect-src: none | 25 | Verified post-deploy |
| Zero POST requests with user content (DevTools) | 25 | Manually verified |
| /trust page live, all verify links working | 20 | All links resolve, diagram accurate |
| /privacy live, plain language, legally reviewed | 15 | Joel + legal sign-off |
| Goldfish badge on main page | 10 | Visible below input on first load |
| Corporate onboarding kit PDF downloadable | 5 | From /trust, correct format |

---

## The Strategic Case

Every enterprise AI tool fights the same procurement battle. IT says no by
default. Legal adds friction. Managers won't champion anything that could
create a data incident.

PromptDolphin inverts this. The architecture makes data incidents structurally
impossible. IT can verify this in 10 minutes using standard tools. Legal has
a one-page plain-language privacy policy. Managers get a productivity tool
their team can use today with zero procurement overhead.

The goldfish is the symbol of that inversion: not "trust us," but "there is
nothing to trust because there is nothing to hide." The open-source engine is
the proof. The CSP header is the enforcement. The /trust page is the briefing.

That is the corporate adoption strategy. The same architecture that makes the
tool free to run at any scale also makes it the most defensible corporate AI
tool on the market. That is not a coincidence. That is the design.

---

*Robic Direct Inc. — Joel Robic, Founder*
*Spec version: 1.0 — 2026-05-17*
