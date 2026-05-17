import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptDolphin — paste-ready prompts in 60 seconds",
  description: "Turn any workplace task into a paste-ready prompt for your AI. Nothing is saved.",
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
