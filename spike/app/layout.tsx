import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://promptdolphin.com"),
  title: {
    default: "PromptDolphin — The ocean is your AI. Most people wade. We dive.",
    template: "%s — PromptDolphin",
  },
  description:
    "Describe your task. Get a precision-engineered prompt for Claude, ChatGPT, Gemini, Copilot, or Grok — instantly. Goldfish memory: nothing you type is stored or transmitted.",
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
    title: "PromptDolphin — The ocean is your AI. Most people wade. We dive.",
    description:
      "Precision-engineered prompts for any leading AI, instantly. Zero retention, open-source engine, IT-approvable architecture.",
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
    title: "PromptDolphin — The ocean is your AI. Most people wade. We dive.",
    description:
      "Precision-engineered prompts for any leading AI, instantly. Zero retention.",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
