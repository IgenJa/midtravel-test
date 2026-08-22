export type SecurityHeader = { key: string; value: string };

/**
 * Production CSP. Next.js still emits inline scripts for hydration, and
 * Framer Motion / Tailwind use inline styles, so 'unsafe-inline' is required
 * without a nonce pipeline. Maps iframe + Unsplash/Blob images are allowlisted.
 */
export function buildContentSecurityPolicy(isDev: boolean): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";
  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: https://*.ingest.sentry.io https://*.sentry.io"
    : "connect-src 'self' https://*.ingest.sentry.io https://*.sentry.io";

  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.public.blob.vercel-storage.com https://public.blob.vercel-storage.com",
    "font-src 'self' data:",
    connectSrc,
    "frame-src 'self' https://maps.google.com https://www.google.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function getSecurityHeaders(isDev: boolean): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    // SAMEORIGIN (not DENY): legal pages embed same-origin PDFs in an iframe.
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(isDev),
    },
  ];

  if (!isDev) {
    headers.unshift({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
