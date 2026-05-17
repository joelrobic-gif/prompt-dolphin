import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://promptdolphin.com"),
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
  ],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full antialiased">
      <body className="min-h-full w-full flex flex-col bg-[#F5F9FC] text-[#0E1A2A]">{children}</body>
    </html>
  );
}
