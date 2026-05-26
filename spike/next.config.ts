import type { NextConfig } from "next";

// CSP policy: connect-src 'self' (only first-party prefetch/image-opt, no external destinations)
// script-src 'self' 'unsafe-inline' for Next.js hydration bootstrap (no external scripts loaded)
// Result: zero third-party exfiltration possible. User content never leaves the device.
// img-src adds Unsplash CDN hosts for the random hero rotation.
// These hosts serve CC0-licensed images only. No user content goes outbound.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://source.unsplash.com https://images.unsplash.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  // microphone=(self) allows the Web Speech API mic on this origin only.
  // Voice transcription runs via the browser's built-in speech service —
  // page does not transmit audio itself; engineered prompt never leaves the browser.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
