import { describe, expect, it } from "vitest";
import {
  getSzamlazzEurHufRate,
  getSzamlazzVatKey,
  isSzamlazzConfigured,
  splitGrossByVat,
} from "@/lib/szamlazz";
import { withEnv } from "../helpers/env";

describe("szamlazz env helpers", () => {
  it("is configured only when the agent key is non-empty", () => {
    withEnv({ SZAMLAZZ_AGENT_KEY: undefined }, () => {
      expect(isSzamlazzConfigured()).toBe(false);
    });
    withEnv({ SZAMLAZZ_AGENT_KEY: "  " }, () => {
      expect(isSzamlazzConfigured()).toBe(false);
    });
    withEnv({ SZAMLAZZ_AGENT_KEY: "agent-key" }, () => {
      expect(isSzamlazzConfigured()).toBe(true);
    });
  });

  it("defaults ÁFA to 27 and parses a positive EUR/HUF rate", () => {
    withEnv({ SZAMLAZZ_VAT_PERCENT: undefined }, () => {
      expect(getSzamlazzVatKey()).toBe("27");
    });
    withEnv({ SZAMLAZZ_VAT_PERCENT: "TAM" }, () => {
      expect(getSzamlazzVatKey()).toBe("TAM");
    });
    withEnv({ SZAMLAZZ_EUR_HUF_RATE: "400.5" }, () => {
      expect(getSzamlazzEurHufRate()).toBe(400.5);
    });
    withEnv({ SZAMLAZZ_EUR_HUF_RATE: "0" }, () => {
      expect(getSzamlazzEurHufRate()).toBeNull();
    });
    withEnv({ SZAMLAZZ_EUR_HUF_RATE: undefined }, () => {
      expect(getSzamlazzEurHufRate()).toBeNull();
    });
  });
});

describe("splitGrossByVat", () => {
  it("splits 27% VAT from a gross EUR amount", () => {
    const split = splitGrossByVat(127, "27");
    expect(split.gross).toBe(127);
    expect(split.net + split.vat).toBeCloseTo(127, 2);
    expect(split.net).toBeCloseTo(100, 2);
    expect(split.vat).toBeCloseTo(27, 2);
    expect(split.vatKey).toBe("27");
  });

  it("treats TAM / 0 / AAM as net=gross and zero VAT", () => {
    expect(splitGrossByVat(100, "TAM")).toEqual({
      net: 100,
      vat: 0,
      gross: 100,
      vatKey: "TAM",
    });
    expect(splitGrossByVat(50, "0")).toMatchObject({ net: 50, vat: 0 });
  });
});
