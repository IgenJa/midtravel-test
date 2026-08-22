import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  getSecurityHeaders,
} from "@/lib/security-headers";

function headerMap(isDev: boolean) {
  return Object.fromEntries(
    getSecurityHeaders(isDev).map((header) => [header.key, header.value])
  );
}

describe("buildContentSecurityPolicy", () => {
  it("allows eval and ws in development only", () => {
    const dev = buildContentSecurityPolicy(true);
    const prod = buildContentSecurityPolicy(false);

    expect(dev).toContain("'unsafe-eval'");
    expect(dev).toContain("ws:");
    expect(prod).not.toContain("'unsafe-eval'");
    expect(prod).not.toContain("ws:");
    expect(prod).toContain("upgrade-insecure-requests");
    expect(dev).not.toContain("upgrade-insecure-requests");
  });

  it("allowlists Maps iframes and Unsplash / Blob images", () => {
    const csp = buildContentSecurityPolicy(false);
    expect(csp).toContain("https://maps.google.com");
    expect(csp).toContain("https://images.unsplash.com");
    expect(csp).toContain("frame-ancestors 'self'");
  });
});

describe("getSecurityHeaders", () => {
  it("sets baseline headers in every environment", () => {
    const headers = headerMap(true);
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Content-Security-Policy"]).toBeTruthy();
    expect(headers["Strict-Transport-Security"]).toBeUndefined();
  });

  it("adds HSTS only in production", () => {
    const headers = headerMap(false);
    expect(headers["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );
  });
});
