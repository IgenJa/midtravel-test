const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function getAuthBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function originOf(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname);
}

function originForHost(parsed: URL, hostname: string): string {
  const port = parsed.port ? `:${parsed.port}` : "";
  return `${parsed.protocol}//${hostname}${port}`;
}

/** Apex + www counterpart of a hostname (localhost / loopback unchanged). */
export function wwwApexHosts(hostname: string): string[] {
  if (isLocalHostname(hostname)) return [hostname];
  const apex = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  if (!apex) return [hostname];
  return [...new Set([apex, `www.${apex}`])];
}

const LOCAL_DEV_PORTS = ["3000", "3001", "3002"];

function localDevOrigins(url: string): string[] {
  const origin = originOf(url);
  if (!origin) return [];
  const parsed = new URL(origin);
  if (!isLocalHostname(parsed.hostname)) return [];
  if (process.env.NODE_ENV === "production") return [origin];

  const configuredPort = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
  const ports = [...new Set([configuredPort, ...LOCAL_DEV_PORTS])];
  const origins: string[] = [];
  for (const host of ["localhost", "127.0.0.1"]) {
    for (const port of ports) {
      const portPart = port && port !== "80" && port !== "443" ? `:${port}` : "";
      origins.push(`${parsed.protocol}//${host}${portPart}`);
    }
  }
  return origins;
}

function wwwApexOrigins(url: string): string[] {
  const origin = originOf(url);
  if (!origin) return [];
  const parsed = new URL(origin);
  if (isLocalHostname(parsed.hostname)) return localDevOrigins(url);
  return wwwApexHosts(parsed.hostname).map((host) => originForHost(parsed, host));
}

function extraTrustedOrigins(): string[] {
  return (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((part) => originOf(part.trim()))
    .filter((origin): origin is string => Boolean(origin));
}

/**
 * Origins Better Auth should accept for CSRF / callback checks.
 * Always includes the canonical URL and its www/apex sibling so a session
 * posted from either host is not rejected.
 */
export function getTrustedOrigins(): string[] {
  const baseOrigin = originOf(getAuthBaseUrl()) ?? getAuthBaseUrl();
  return [
    ...new Set([
      baseOrigin,
      ...wwwApexOrigins(baseOrigin),
      ...extraTrustedOrigins(),
    ]),
  ];
}

/**
 * Redirect www ↔ apex onto the canonical BETTER_AUTH_URL host so the
 * host-only session cookie stays on one origin. Localhost is never redirected.
 */
export function canonicalHostRedirectUrl(requestUrl: URL): URL | null {
  const base = originOf(getAuthBaseUrl());
  if (!base) return null;

  const canonical = new URL(base);
  if (isLocalHostname(requestUrl.hostname)) return null;
  if (requestUrl.hostname === canonical.hostname) return null;
  if (!wwwApexHosts(canonical.hostname).includes(requestUrl.hostname)) {
    return null;
  }

  return new URL(requestUrl.pathname + requestUrl.search, canonical.origin);
}
