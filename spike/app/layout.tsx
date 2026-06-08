import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.promptdolphin.com"),
  title: {
    default: "PromptDolphin — Your AI is only as good as your prompt",
    template: "%s — PromptDolphin",
  },
  description:
    "Describe your task in one sentence. PromptDolphin engineers it into a paste-ready prompt tuned to Claude, ChatGPT, Gemini, Copilot, or Grok. 60 seconds. Free. Nothing leaves your browser.",
  applicationName: "PromptDolphin",
  authors: [{ name: "Robic Direct Inc." }],
  keywords: [
    "prompt engineering",
    "Claude prompt",
    "ChatGPT prompt",
    "Gemini prompt",
    "Microsoft Copilot prompt",
    "AI prompt generator",
    "enterprise AI",
    "privacy-first AI",
    "business productivity software",
    "document generation tool",
    "workplace software",
    "office productivity",
  ],
  alternates: {
    canonical: "https://www.promptdolphin.com",
  },
  category: "business productivity software",
  openGraph: {
    type: "website",
    url: "https://promptdolphin.com",
    title: "PromptDolphin — Your AI is only as good as your prompt",
    description:
      "One sentence in. Paste-ready prompt out. Tuned per model. Free. Private. IT-approvable.",
    siteName: "PromptDolphin",
    images: [
      {
        url: "/brand/dolphin-hero.jpg",
        width: 1024,
        height: 1024,
        alt: "A dolphin curving through deep ocean water",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptDolphin — Your AI is only as good as your prompt",
    description:
      "One sentence in. Paste-ready prompt out. Tuned per model. Free. Private.",
    images: ["/brand/dolphin-hero.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://promptdolphin.com/#organization",
      name: "Robic Direct Inc.",
      url: "https://www.promptdolphin.com",
      legalName: "Robic Direct Inc.",
      founder: { "@type": "Person", name: "Joel Robic" },
      brand: { "@type": "Brand", name: "PromptDolphin" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@promptdolphin.com",
        availableLanguage: ["English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://promptdolphin.com/#website",
      url: "https://www.promptdolphin.com",
      name: "PromptDolphin",
      publisher: { "@id": "https://promptdolphin.com/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://promptdolphin.com/#app",
      name: "PromptDolphin",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Productivity",
      operatingSystem: "Web browser",
      url: "https://www.promptdolphin.com",
      description:
        "Business productivity tool that turns a one-sentence task description into a paste-ready, model-native prompt for generating workplace documents — reports, spreadsheets, slide decks, and one-pagers. Runs entirely in the browser; nothing typed is stored or transmitted.",
      provider: { "@id": "https://promptdolphin.com/#organization" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      isAccessibleForFree: true,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full antialiased">
      <body className="min-h-full w-full flex flex-col bg-[#F5F9FC] text-[#0E1A2A]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
