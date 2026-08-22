import { describe, expect, it } from "vitest";
import {
  calcDepositAmount,
  getAppUrl,
  getDepositPercent,
  isStripeConfigured,
  toStripeUnitAmount,
} from "@/lib/stripe";
import { withEnv } from "../helpers/env";

describe("getDepositPercent", () => {
  it("defaults to 30 and rejects out-of-range values", () => {
    withEnv({ STRIPE_DEPOSIT_PERCENT: undefined }, () => {
      expect(getDepositPercent()).toBe(30);
    });
    withEnv({ STRIPE_DEPOSIT_PERCENT: "25" }, () => {
      expect(getDepositPercent()).toBe(25);
    });
    withEnv({ STRIPE_DEPOSIT_PERCENT: "0" }, () => {
      expect(getDepositPercent()).toBe(30);
    });
    withEnv({ STRIPE_DEPOSIT_PERCENT: "150" }, () => {
      expect(getDepositPercent()).toBe(30);
    });
    withEnv({ STRIPE_DEPOSIT_PERCENT: "nope" }, () => {
      expect(getDepositPercent()).toBe(30);
    });
  });
});

describe("calcDepositAmount", () => {
  it("rounds to the nearest euro and never goes below 1", () => {
    expect(calcDepositAmount(1000, 30)).toBe(300);
    expect(calcDepositAmount(999, 30)).toBe(300);
    expect(calcDepositAmount(1, 30)).toBe(1);
    expect(calcDepositAmount(0, 30)).toBe(1);
  });
});

describe("toStripeUnitAmount", () => {
  it("uses cents for EUR and major units for zero-decimal currencies", () => {
    expect(toStripeUnitAmount(12.5, "eur")).toBe(1250);
    expect(toStripeUnitAmount(3500, "huf")).toBe(3500);
  });
});

describe("isStripeConfigured / getAppUrl", () => {
  it("is true only when a secret key is set", () => {
    withEnv({ STRIPE_SECRET_KEY: undefined }, () => {
      expect(isStripeConfigured()).toBe(false);
    });
    withEnv({ STRIPE_SECRET_KEY: "sk_test_x" }, () => {
      expect(isStripeConfigured()).toBe(true);
    });
  });

  it("strips a trailing slash from the public app URL", () => {
    withEnv(
      {
        NEXT_PUBLIC_APP_URL: "https://midtravel.hu/",
        BETTER_AUTH_URL: undefined,
      },
      () => {
        expect(getAppUrl()).toBe("https://midtravel.hu");
      }
    );
  });
});
