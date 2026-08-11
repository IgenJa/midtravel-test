import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const MAX_KEYS = 5_000;

export type RateLimitOptions = {
  /** Max requests allowed in the window. */
  limit: number;
  /** Sliding fixed window length in ms. */
  windowMs: number;
};

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

export function getClientIpFromHeaders(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    h.get("x-real-ip")?.trim() ||
    h.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function pruneExpired(now: number) {
  if (store.size < MAX_KEYS) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
  if (store.size < MAX_KEYS) return;
  // Drop oldest-ish entries if still over cap (Map insertion order).
  const overflow = store.size - Math.floor(MAX_KEYS / 2);
  let removed = 0;
  for (const key of store.keys()) {
    store.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }
}

export function rateLimitKey(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const bucket = store.get(key);
  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1 };
  }

  if (bucket.count >= options.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: options.limit - bucket.count };
}

/** Rate-limit using the request IP from incoming headers (Server Actions). */
export async function rateLimit(
  namespace: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  return rateLimitKey(`${namespace}:${ip}`, options);
}

/** Rate-limit an API Route Handler request. */
export function rateLimitRequest(
  request: Request,
  namespace: string,
  options: RateLimitOptions
): RateLimitResult {
  const ip = getClientIpFromHeaders(request.headers);
  return rateLimitKey(`${namespace}:${ip}`, options);
}

export const RATE_LIMITS = {
  contact: { limit: 5, windowMs: 60_000 },
  apply: { limit: 5, windowMs: 60_000 },
  booking: { limit: 5, windowMs: 60_000 },
  auth: { limit: 30, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitOptions>;
