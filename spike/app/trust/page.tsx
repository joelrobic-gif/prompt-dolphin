import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust & Security",
  description: "Written for IT administrators, not marketing. How PromptDolphin's zero-retention architecture works and how to verify it.",
};

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FC] py-16 px-4">
      <div className="max-w-3xl mx-auto">

        <nav className="mb-8 text-xs">
          <Link href="/" className="text-[#4A5A6E] hover:text-[#143352] transition-colors">
            ← Back to PromptDolphin
          </Link>
        </nav>

        <header className="mb-12">
          <p className="text-xs uppercase tracking-widest text-[#A67C3D] font-semibold mb-2">
            Security & Privacy
          </p>
          <h1 className="text-4xl font-serif text-[#0E1A2A] mb-3" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            Written for IT administrators, not marketing.
          </h1>
          <p className="text-[#4A5A6E] text-base leading-relaxed">
            Most AI tools claim zero-retention. We built ours so you can verify it
            in ten minutes using browser DevTools and the open-source engine repo.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-serif text-[#143352] mb-4" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            How it works
          </h2>
          <ol className="space-y-3 text-sm text-[#0E1A2A] leading-relaxed">
            <li><strong className="text-[#143352]">1.</strong> You visit promptdolphin.com. Your browser downloads the app — one HTML file plus a JavaScript bundle. This is the only server request.</li>
            <li><strong className="text-[#143352]">2.</strong> You type your task. It stays in your browser's RAM.</li>
            <li><strong className="text-[#143352]">3.</strong> You click "Engineer this prompt." JavaScript assembles the output using string templates. No network call is made.</li>
            <li><strong className="text-[#143352]">4.</strong> You copy the output. It goes to your clipboard. The page forgets it.</li>
            <li><strong className="text-[#143352]">5.</strong> You close the tab. Everything is gone.</li>
          </ol>
          <p className="mt-4 text-sm text-[#4A5A6E] italic">
            There is no step where your content touches our servers. Not because of our privacy policy. Because the code has no mechanism to send it.
          </p>
        </section>

        <section className="mb-12 bg-white border border-[#C4D2E0] rounded-md p-6">
          <h2 className="text-2xl font-serif text-[#143352] mb-4" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            Verify our claims yourself
          </h2>

          <div className="space-y-5 text-sm text-[#0E1A2A]">
            <div>
              <p className="font-semibold text-[#143352] mb-1">1. Check the security headers (1 minute)</p>
              <p className="text-[#4A5A6E] leading-relaxed">
                Run a scan at{" "}
                <a href="https://securityheaders.com/?q=promptdolphin.com" target="_blank" rel="noopener noreferrer" className="text-[#143352] underline">
                  securityheaders.com
                </a>
                . Our CSP directive <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">connect-src 'self'</code> restricts all outbound connections to first-party only — no third-party servers can receive your data. Browser-enforced, not a server-side promise.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#143352] mb-1">2. Confirm zero network transmission (2 minutes)</p>
              <p className="text-[#4A5A6E] leading-relaxed">
                Open this site. Press F12 → Network tab. Type a task. Click "Engineer this prompt." You will see zero POST requests containing your text. Only GET requests for static assets.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#143352] mb-1">3. Read the engine source code (10 minutes)</p>
              <p className="text-[#4A5A6E] leading-relaxed">
                The full engine is at{" "}
                <a href="https://github.com/joelrobic-gif/prompt-dolphin" target="_blank" rel="noopener noreferrer" className="text-[#143352] underline">
                  github.com/joelrobic-gif/prompt-dolphin
                </a>
                . The <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">assemble()</code> function is string concatenation only — no <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">fetch()</code>, no <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">XMLHttpRequest</code>, no WebSocket, no beacon.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#143352] mb-1">4. Run it offline (the proof)</p>
              <p className="text-[#4A5A6E] leading-relaxed">
                Clone the repo. Run <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">npm install && npm run build</code>. Serve the output locally with no internet connection after the initial download. It works identically. That is the proof.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-serif text-[#143352] mb-4" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            Network compatibility
          </h2>
          <p className="text-sm text-[#0E1A2A] leading-relaxed mb-3">
            PromptDolphin generates zero outbound requests containing user data, making it compatible with all major enterprise DLP and web proxy tools:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#0E1A2A]">
            <li>✓ Zscaler Internet Access / CASB</li>
            <li>✓ Netskope Cloud Security Platform</li>
            <li>✓ Cisco Umbrella / OpenDNS</li>
            <li>✓ Palo Alto Prisma Access / Cortex</li>
            <li>✓ Microsoft Defender for Endpoint</li>
            <li>✓ Symantec Web Security Service</li>
            <li>✓ Forcepoint Web Security</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-serif text-[#143352] mb-4" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            For your risk assessment
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2 border-b border-[#C4D2E0]">
              <dt className="font-semibold text-[#143352]">Data classification</dt>
              <dd className="text-[#4A5A6E]">No sensitive data leaves the user's device.</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2 border-b border-[#C4D2E0]">
              <dt className="font-semibold text-[#143352]">Authentication</dt>
              <dd className="text-[#4A5A6E]">Not required. No corporate credential integration.</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2 border-b border-[#C4D2E0]">
              <dt className="font-semibold text-[#143352]">Data residency</dt>
              <dd className="text-[#4A5A6E]">Not applicable. No data is stored.</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2 border-b border-[#C4D2E0]">
              <dt className="font-semibold text-[#143352]">Cookies</dt>
              <dd className="text-[#4A5A6E]">None for tracking. No third-party cookies. No persistent storage of content.</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2 border-b border-[#C4D2E0]">
              <dt className="font-semibold text-[#143352]">Third-party scripts</dt>
              <dd className="text-[#4A5A6E]">None loaded. Verified by CSP default-src 'self'.</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2 border-b border-[#C4D2E0]">
              <dt className="font-semibold text-[#143352]">Open-source engine</dt>
              <dd className="text-[#4A5A6E]">MIT license. Auditable by your security team.</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2 border-b border-[#C4D2E0]">
              <dt className="font-semibold text-[#143352]">SOC 2 Type I</dt>
              <dd className="text-[#4A5A6E]">Roadmap — audit planned for Q4 2026.</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2 border-b border-[#C4D2E0]">
              <dt className="font-semibold text-[#143352]">DPA</dt>
              <dd className="text-[#4A5A6E]">Available on request for enterprise customers.</dd>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2">
              <dt className="font-semibold text-[#143352]">Security contact</dt>
              <dd className="text-[#4A5A6E]">security@promptdolphin.com</dd>
            </div>
          </dl>
        </section>

        <section className="mb-12 bg-[#0A1F35] text-[#F5F9FC] rounded-md p-6">
          <h2 className="text-2xl font-serif text-[#F5F9FC] mb-4" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            Recommended deployment
          </h2>
          <ol className="space-y-2 text-sm text-[#C4D2E0]">
            <li><strong className="text-[#A67C3D]">1.</strong> Run the verification checks above.</li>
            <li><strong className="text-[#A67C3D]">2.</strong> Add <code className="bg-[#143352] text-[#F5F9FC] px-1.5 py-0.5 rounded font-mono text-xs">promptdolphin.com</code> to your approved sites list.</li>
            <li><strong className="text-[#A67C3D]">3.</strong> Share with your team lead or department head.</li>
            <li><strong className="text-[#A67C3D]">4.</strong> Contact us for enterprise agreements with aggregate usage reporting (no content visibility).</li>
          </ol>
          <p className="mt-4 text-xs text-[#8FA6BC]">
            Contact: <a href="mailto:enterprise@promptdolphin.com" className="text-[#A67C3D] underline">enterprise@promptdolphin.com</a>
          </p>
        </section>

        <footer className="text-center text-xs text-[#8FA6BC] py-8 border-t border-[#C4D2E0]">
          <p>Robic Direct Inc. · <Link href="/privacy" className="underline hover:text-[#143352]">Privacy</Link> · <Link href="/" className="underline hover:text-[#143352]">Home</Link></p>
        </footer>

      </div>
    </main>
  );
}
