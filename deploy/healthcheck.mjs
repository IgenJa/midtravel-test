#!/usr/bin/env node
const url = process.env.HEALTHCHECK_URL ?? "http://127.0.0.1:3000/api/health";

try {
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  process.exit(response.ok ? 0 : 1);
} catch {
  process.exit(1);
}
