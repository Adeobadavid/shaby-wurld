/** @type {import('next').NextConfig} */

// Security headers. CSP is deliberately not set here — Paystack's inline
// checkout injects its own script/iframe, so a strict policy needs to be
// tuned against a live Paystack session rather than guessed at.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  // Stray package-lock.json files sit above this directory, and without this
  // Next infers the wrong workspace root and traces the wrong files.
  outputFileTracingRoot: __dirname,

  // NOTE: `output: 'export'` was removed deliberately. A static export has no
  // server, so it cannot hold the Paystack secret key, verify a webhook
  // signature, or proxy Shipbubble without exposing that key in the browser.
  // The site now needs a Node host (Vercel, Netlify, Render, a VPS — anything
  // that runs `next start`).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
