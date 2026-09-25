import type { NextConfig } from "next";

// Security headers applied to every response. CSP is intentionally strict;
// if you add a third-party script or style, widen it deliberately here.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// Demoing from a phone or a tunnel link during `next dev`. Next blocks its dev
// assets and Server Actions (sign-in, transfers…) from unknown origins, which
// shows up as dead buttons and failed sign-ins. Allow private networks and
// common tunnel domains — in development only; production keeps the strict
// same-origin check. In these patterns `*` is exactly one domain label and
// `**` is any number of them, which tunnel hosts need.
const isDev = process.env.NODE_ENV !== "production";
const demoOrigins = [
  "192.168.*.*", // home / office Wi-Fi
  "10.*.*.*",
  "172.*.*.*", // incl. phone hotspots (172.20.10.x)
  "**.devtunnels.ms", // VS Code "Forward a Port" (abc-3000.uks1.devtunnels.ms)
  // VS Code tunnels rewrite the browser's Origin to the local address (and
  // put the tunnel host in x-forwarded-host), so the origin Next checks is
  // localhost itself.
  `localhost:${process.env.PORT ?? 3000}`,
  "localhost",
  "**.ngrok-free.app",
  "**.ngrok.app",
  "**.trycloudflare.com",
  "**.loca.lt",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isDev && {
    allowedDevOrigins: demoOrigins,
    experimental: { serverActions: { allowedOrigins: demoOrigins } },
  }),
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Never let the browser cache authenticated app pages.
        source: "/(dashboard|transfer|activity|settings)(.*)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
