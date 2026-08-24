import { afterEach, describe, expect, it } from "vitest";
import {
  canonicalHostRedirectUrl,
  getAuthBaseUrl,
  getTrustedOrigins,
  wwwApexHosts,
} from "@/lib/auth-origins";
import { withEnv } from "../helpers/env";

const ORIGIN_KEYS = [
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "BETTER_AUTH_TRUSTED_ORIGINS",
] as const;

function clearOriginEnv() {
  for (const key of ORIGIN_KEYS) {
    delete process.env[key];
  }
}

afterEach(() => {
  clearOriginEnv();
});

describe("wwwApexHosts", () => {
  it("returns both apex and www for a public host", () => {
    expect(wwwApexHosts("midtravel.hu").sort()).toEqual([
      "midtravel.hu",
      "www.midtravel.hu",
    ]);
    expect(wwwApexHosts("www.midtravel.hu").sort()).toEqual([
      "midtravel.hu",
      "www.midtravel.hu",
    ]);
  });

  it("leaves localhost and loopback unchanged", () => {
    expect(wwwApexHosts("localhost")).toEqual(["localhost"]);
    expect(wwwApexHosts("127.0.0.1")).toEqual(["127.0.0.1"]);
  });
});

describe("getAuthBaseUrl / getTrustedOrigins", () => {
  it("strips a trailing slash from the canonical URL", () => {
    withEnv({ BETTER_AUTH_URL: "https://midtravel.hu/" }, () => {
      expect(getAuthBaseUrl()).toBe("https://midtravel.hu");
    });
  });

  it("always trusts the www and apex sibling", () => {
    withEnv(
      {
        BETTER_AUTH_URL: "https://midtravel.hu",
        BETTER_AUTH_TRUSTED_ORIGINS: undefined,
      },
      () => {
        expect(getTrustedOrigins().sort()).toEqual([
          "https://midtravel.hu",
          "https://www.midtravel.hu",
        ]);
      }
    );
  });

  it("adds extra comma-separated origins", () => {
    withEnv(
      {
        BETTER_AUTH_URL: "https://midtravel.hu",
        BETTER_AUTH_TRUSTED_ORIGINS: "https://staging.midtravel.hu, not-a-url",
      },
      () => {
        expect(getTrustedOrigins()).toContain("https://staging.midtravel.hu");
        expect(getTrustedOrigins()).not.toContain("not-a-url");
      }
    );
  });

  it("defaults to localhost when no URL env is set", () => {
    withEnv(
      { BETTER_AUTH_URL: undefined, NEXT_PUBLIC_APP_URL: undefined },
      () => {
        expect(getAuthBaseUrl()).toBe("http://localhost:3000");
        expect(getTrustedOrigins()).toEqual(
          expect.arrayContaining([
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
          ])
        );
      }
    );
  });

  it("trusts local alternate ports in development", () => {
    withEnv({ BETTER_AUTH_URL: "http://localhost:3000" }, () => {
      expect(getTrustedOrigins()).toEqual(
        expect.arrayContaining([
          "http://localhost:3000",
          "http://localhost:3001",
          "http://127.0.0.1:3001",
        ])
      );
    });
  });

  it("does not add extra local ports in production", () => {
    withEnv(
      {
        BETTER_AUTH_URL: "http://localhost:3000",
        NODE_ENV: "production",
      },
      () => {
        expect(getTrustedOrigins()).toEqual(["http://localhost:3000"]);
      }
    );
  });
});

describe("canonicalHostRedirectUrl", () => {
  it("redirects www onto the canonical apex host, keeping path and query", () => {
    withEnv({ BETTER_AUTH_URL: "https://midtravel.hu" }, () => {
      const redirected = canonicalHostRedirectUrl(
        new URL("https://www.midtravel.hu/hu/login?next=/hu/admin")
      );
      expect(redirected?.href).toBe(
        "https://midtravel.hu/hu/login?next=/hu/admin"
      );
    });
  });

  it("does not redirect the canonical host or localhost", () => {
    withEnv({ BETTER_AUTH_URL: "https://midtravel.hu" }, () => {
      expect(
        canonicalHostRedirectUrl(new URL("https://midtravel.hu/hu"))
      ).toBeNull();
      expect(
        canonicalHostRedirectUrl(new URL("http://localhost:3000/hu"))
      ).toBeNull();
    });
  });

  it("does not redirect an unrelated host", () => {
    withEnv({ BETTER_AUTH_URL: "https://midtravel.hu" }, () => {
      expect(
        canonicalHostRedirectUrl(new URL("https://evil.example/hu"))
      ).toBeNull();
    });
  });
});
