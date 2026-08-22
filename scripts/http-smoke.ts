import "dotenv/config";

/**
 * HTTP smoke against a running Next.js server.
 * Does not write to the database — it only GETs public routes.
 *
 *   SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke:http
 */

const BASE_URL = (
  process.env.SMOKE_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");

const WAIT_MS = Number(process.env.SMOKE_WAIT_MS ?? "90000");

type CheckResult = { name: string; ok: boolean; detail: string };

async function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    redirect: "manual",
    ...init,
  });
}

async function waitForHealth() {
  const deadline = Date.now() + (Number.isFinite(WAIT_MS) ? WAIT_MS : 90_000);
  let lastError = "not attempted";

  while (Date.now() < deadline) {
    try {
      const response = await request("/api/health");
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(
    `Server at ${BASE_URL} did not become healthy within ${WAIT_MS}ms (${lastError})`
  );
}

async function runCheck(
  name: string,
  fn: () => Promise<string>
): Promise<CheckResult> {
  try {
    const detail = await fn();
    return { name, ok: true, detail };
  } catch (error) {
    return {
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

async function expectStatus(
  path: string,
  allowed: number[],
  init?: RequestInit
): Promise<Response> {
  const response = await request(path, init);
  if (!allowed.includes(response.status)) {
    throw new Error(`expected ${allowed.join("|")}, got ${response.status}`);
  }
  return response;
}

async function expectBody(path: string, needles: string[]) {
  const response = await expectStatus(path, [200]);
  const body = await response.text();
  for (const needle of needles) {
    if (!body.includes(needle)) {
      throw new Error(`response body missing ${JSON.stringify(needle)}`);
    }
  }
  return { response, body };
}

function header(response: Response, name: string) {
  return response.headers.get(name);
}

async function main() {
  console.log(`HTTP smoke → ${BASE_URL}`);
  await waitForHealth();

  const checks = await Promise.all([
    runCheck("GET /api/health", async () => {
      const response = await expectStatus("/api/health", [200]);
      const body = (await response.json()) as {
        ok?: boolean;
        checks?: { app?: string; database?: string };
      };
      if (body.ok !== true) throw new Error(`ok=${String(body.ok)}`);
      if (body.checks?.app !== "ok") {
        throw new Error(`checks.app=${String(body.checks?.app)}`);
      }
      if (body.checks?.database !== "ok") {
        throw new Error(`checks.database=${String(body.checks?.database)}`);
      }
      return "200 ok + database ok";
    }),

    runCheck("GET / → /hu", async () => {
      const response = await expectStatus("/", [303, 307, 308, 302]);
      const location = header(response, "location") ?? "";
      if (!location.endsWith("/hu") && !location.includes("/hu?")) {
        throw new Error(`unexpected Location: ${location}`);
      }
      return `redirect ${response.status} → ${location}`;
    }),

    runCheck("GET /hu", async () => {
      const { response } = await expectBody("/hu", [
        "MidTravel",
        "schema.org",
        "TravelAgency",
      ]);
      const nosniff = header(response, "x-content-type-options");
      const frame = header(response, "x-frame-options");
      if (nosniff !== "nosniff") {
        throw new Error(`X-Content-Type-Options=${String(nosniff)}`);
      }
      if (frame !== "SAMEORIGIN") {
        throw new Error(`X-Frame-Options=${String(frame)}`);
      }
      return "200 + JSON-LD + security headers";
    }),

    runCheck("GET /en", async () => {
      await expectBody("/en", ["MidTravel"]);
      return "200";
    }),

    runCheck("GET /hu/trips", async () => {
      await expectStatus("/hu/trips", [200]);
      return "200";
    }),

    runCheck("GET /hu/contact", async () => {
      await expectStatus("/hu/contact", [200]);
      return "200";
    }),

    runCheck("GET /hu/about", async () => {
      await expectStatus("/hu/about", [200]);
      return "200";
    }),

    runCheck("GET /hu/privacy-policy", async () => {
      await expectStatus("/hu/privacy-policy", [200]);
      return "200";
    }),

    runCheck("GET /hu/team", async () => {
      await expectStatus("/hu/team", [200]);
      return "200";
    }),

    runCheck("GET /hu/apply", async () => {
      await expectStatus("/hu/apply", [200]);
      return "200";
    }),

    runCheck("GET /hu/impressum", async () => {
      await expectStatus("/hu/impressum", [200]);
      return "200";
    }),

    runCheck("GET /hu/travel-contract", async () => {
      await expectStatus("/hu/travel-contract", [200]);
      return "200";
    }),

    runCheck("GET /en/trips", async () => {
      await expectStatus("/en/trips", [200]);
      return "200";
    }),

    runCheck("GET /hu/profile (unauthenticated)", async () => {
      const response = await expectStatus("/hu/profile", [303, 307, 308, 302]);
      const location = header(response, "location") ?? "";
      if (!location.includes("/login")) {
        throw new Error(`expected login redirect, got ${location || response.status}`);
      }
      return `redirect → ${location}`;
    }),

    runCheck("GET /robots.txt", async () => {
      const { body } = await expectBody("/robots.txt", [
        "Disallow: /api/",
        "Disallow: /hu/admin",
        "Disallow: /en/admin",
        "Sitemap:",
      ]);
      if (!body.includes("sitemap.xml")) {
        throw new Error("sitemap URL missing");
      }
      return "disallows admin/api";
    }),

    runCheck("GET /sitemap.xml", async () => {
      await expectBody("/sitemap.xml", [
        "/hu",
        "/en",
        "/hu/trips",
        "/en/contact",
      ]);
      return "200 + locale URLs";
    }),

    runCheck("GET /hu/login", async () => {
      await expectStatus("/hu/login", [200]);
      return "200";
    }),

    runCheck("GET /hu/admin (unauthenticated)", async () => {
      const response = await expectStatus("/hu/admin", [303, 307, 308, 302]);
      const location = header(response, "location") ?? "";
      if (!location.includes("/login")) {
        throw new Error(`expected login redirect, got ${location || response.status}`);
      }
      return `redirect → ${location}`;
    }),
  ]);

  const failed = checks.filter((check) => !check.ok);
  for (const check of checks) {
    const mark = check.ok ? "ok" : "FAIL";
    console.log(`  [${mark}] ${check.name} — ${check.detail}`);
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length}/${checks.length} HTTP smoke checks failed`);
    process.exit(1);
  }

  console.log(`\n${checks.length} HTTP smoke checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
