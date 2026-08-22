import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import { getSecurityHeaders } from "./src/lib/security-headers";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Security headers + disable nginx buffering so App Router streaming
        // works on the VPS. HSTS is production-only (see getSecurityHeaders).
        source: "/:path*",
        headers: [
          ...getSecurityHeaders(isDev),
          { key: "X-Accel-Buffering", value: "no" },
        ],
      },
    ];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/sentry-tunnel",
});
