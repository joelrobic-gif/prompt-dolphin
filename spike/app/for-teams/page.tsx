import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "For Teams — PromptDolphin",
  description:
    "PromptDolphin for teams: free for every employee, zero IT overhead, verifiable privacy. The AI productivity tool your IT department will encourage.",
};

export default function ForTeamsPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FC]">

      <section className="relative w-full h-[40vh] min-h-[280px] sm:min-h-[320px] md:min-h-[360px] max-h-[480px] overflow-hidden">
        <Image
          src="/brand/dolphin-pod.jpg"
          alt="A pod of dolphins swimming together through deep ocean water"
          fill priority sizes="100vw"
          className="object-cover"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F35]/92 via-[#0A1F35]/65 to-[#0A1F35]/25" />
        <div className="absolute inset-0 flex items-end pb-6 sm:pb-8 md:pb-10">
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 md:px-10 lg:px-16">
            <p className="text-xs uppercase tracking-widest text-[#A67C3D] font-semibold mb-2">For teams</p>
            <h1
              className="text-[#F5F9FC] font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight max-w-[26ch]"
              style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}
            >
              The AI productivity tool your{" "}
              <span className="text-[#A67C3D]">IT department</span>{" "}
              will encourage.
            </h1>
          </div>
        </div>
      </section>

      <nav className="px-4 sm:px-6 md:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-xs text-[#4A5A6E] hover:text-[#143352] transition-colors">
            ← PromptDolphin home
          </Link>
        </div>
      </nav>

      <section className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-[#0E1A2A] leading-relaxed">
            Every knowledge worker on your team writes worse prompts than they should.
            That costs you hours of bad AI output, weekly. PromptDolphin fixes that —
            and your IT team will sign off on it in under ten minutes.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 py-8 md:py-12 bg-white border-y border-[#C4D2E0]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif text-[#143352] mb-6" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            Why companies encourage their teams to use PromptDolphin
          </h2>
          <ol className="space-y-5 text-sm md:text-base text-[#0E1A2A] leading-relaxed">
            <li><strong className="text-[#143352]">1. Productivity without procurement risk.</strong> Employees get better AI outputs without training, without IT building custom tooling, and without any data leaving the corporate perimeter. The marginal risk is negative — it reduces risky behavior.</li>
            <li><strong className="text-[#143352]">2. Reduces shadow AI risk.</strong> Employees who can't write good prompts paste sensitive content into AI tools with unknown privacy policies. PromptDolphin gives them better outputs through a verified-safe tool — reducing the incentive to use riskier workarounds.</li>
            <li><strong className="text-[#143352]">3. Zero IT overhead.</strong> No SSO integration. No user provisioning. No license management. No SAML. No helpdesk tickets. IT approves one domain. Done.</li>
            <li><strong className="text-[#143352]">4. Auditable open source.</strong> The engine is MIT-licensed and public. A security team can read every line of code that runs in their employees' browsers.</li>
            <li><strong className="text-[#143352]">5. Makes existing Copilot investment go further.</strong> The output is optimized for Copilot. Position PromptDolphin as a Copilot enhancer — justifying existing spend rather than adding new.</li>
            <li><strong className="text-[#143352]">6. Free for individual employees.</strong> No budget approval. No procurement. IT approves the domain. Employees use it. Managers see productivity improvements.</li>
          </ol>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif text-[#143352] mb-4" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            What your IT team will see
          </h2>
          <p className="text-sm md:text-base text-[#0E1A2A] leading-relaxed mb-4">
            Three checks they will run. Each takes under five minutes. All pass.
          </p>
          <div className="space-y-4 text-sm md:text-base text-[#0E1A2A]">
            <div className="bg-white border border-[#C4D2E0] rounded-md p-5">
              <p className="font-semibold text-[#143352] mb-1">1. Security header scan</p>
              <p className="text-[#4A5A6E] leading-relaxed">
                <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">securityheaders.com</code> scan returns A+ with{" "}
                <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">connect-src 'self'</code>. No third-party servers can receive content. Browser-enforced.
              </p>
            </div>
            <div className="bg-white border border-[#C4D2E0] rounded-md p-5">
              <p className="font-semibold text-[#143352] mb-1">2. DevTools network inspection</p>
              <p className="text-[#4A5A6E] leading-relaxed">
                Chrome DevTools → Network tab. Type a task. Click Engineer. Zero outbound POST requests with user content. Only static asset GETs.
              </p>
            </div>
            <div className="bg-white border border-[#C4D2E0] rounded-md p-5">
              <p className="font-semibold text-[#143352] mb-1">3. Open-source engine review</p>
              <p className="text-[#4A5A6E] leading-relaxed">
                The <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">assemble()</code> function is pure string concatenation. No fetch, no XHR, no WebSocket, no beacon.{" "}
                <a href="https://github.com/joelrobic-gif/prompt-dolphin" target="_blank" rel="noopener noreferrer" className="text-[#143352] underline">Read the code →</a>
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm md:text-base text-[#4A5A6E]">
            Full IT documentation: <Link href="/trust" className="text-[#143352] underline">/trust</Link>.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 py-8 md:py-12 bg-[#0A1F35] text-[#F5F9FC]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif text-[#F5F9FC] mb-4" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            Cost to your company
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-6">
            <div>
              <p className="text-4xl font-serif text-[#A67C3D]" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>$0</p>
              <p className="text-sm font-semibold text-[#F5F9FC] mt-1 mb-1">Per employee</p>
              <p className="text-xs text-[#C4D2E0] leading-relaxed">Free for individual use. No seat licenses to manage.</p>
            </div>
            <div>
              <p className="text-4xl font-serif text-[#A67C3D]" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>$0</p>
              <p className="text-sm font-semibold text-[#F5F9FC] mt-1 mb-1">Per prompt</p>
              <p className="text-xs text-[#C4D2E0] leading-relaxed">Client-side assembly. No API call. No usage caps.</p>
            </div>
            <div>
              <p className="text-4xl font-serif text-[#A67C3D]" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>$0</p>
              <p className="text-sm font-semibold text-[#F5F9FC] mt-1 mb-1">IT overhead</p>
              <p className="text-xs text-[#C4D2E0] leading-relaxed">Approve one domain. No SSO. No procurement.</p>
            </div>
          </div>
          <p className="mt-8 text-sm text-[#C4D2E0]">
            Enterprise agreements with aggregate usage reporting (no content visibility) available on request.
            Contact <a href="mailto:enterprise@promptdolphin.com" className="text-[#A67C3D] underline">enterprise@promptdolphin.com</a>.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif text-[#143352] mb-4" style={{ fontFamily: 'ui-serif, Georgia, "EB Garamond", serif' }}>
            How to deploy company-wide
          </h2>
          <ol className="space-y-3 text-sm md:text-base text-[#0E1A2A] leading-relaxed">
            <li><strong className="text-[#143352]">1.</strong> Forward <Link href="/trust" className="text-[#143352] underline">/trust</Link> to your IT or security team.</li>
            <li><strong className="text-[#143352]">2.</strong> IT runs three verification checks (under 15 minutes total).</li>
            <li><strong className="text-[#143352]">3.</strong> IT adds <code className="bg-[#E8EFF5] text-[#143352] px-1.5 py-0.5 rounded font-mono text-xs">promptdolphin.com</code> to your approved sites list.</li>
            <li><strong className="text-[#143352]">4.</strong> Share with your team. No accounts. No login. They start using it.</li>
            <li><strong className="text-[#143352]">5.</strong> (Optional) Contact us for enterprise reporting and DPA.</li>
          </ol>
        </div>
      </section>

      <footer className="bg-[#0A1F35] py-10 px-4 sm:px-6 text-center">
        <p className="text-[11px] text-[#8FA6BC] space-x-3">
          <Link href="/trust" className="hover:text-[#F5F9FC] transition-colors">Trust & Security</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-[#F5F9FC] transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/" className="hover:text-[#F5F9FC] transition-colors">Home</Link>
        </p>
        <p className="text-[10px] text-[#4A5A6E] mt-3">Robic Direct Inc.</p>
      </footer>

    </main>
  );
}
