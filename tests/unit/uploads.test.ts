import path from "node:path";
import { describe, expect, it } from "vitest";
import { getUploadDir, UPLOAD_CONTENT_TYPES } from "@/lib/uploads";
import { withEnv } from "../helpers/env";

describe("UPLOAD_CONTENT_TYPES", () => {
  it("serves raster types and never SVG", () => {
    expect(UPLOAD_CONTENT_TYPES[".jpg"]).toBe("image/jpeg");
    expect(UPLOAD_CONTENT_TYPES[".png"]).toBe("image/png");
    expect(UPLOAD_CONTENT_TYPES[".webp"]).toBe("image/webp");
    expect(UPLOAD_CONTENT_TYPES[".svg"]).toBeUndefined();
  });
});

describe("getUploadDir", () => {
  it("defaults to ./uploads under cwd", () => {
    withEnv({ UPLOAD_DIR: undefined }, () => {
      expect(getUploadDir()).toBe(path.join(process.cwd(), "uploads"));
    });
  });

  it("resolves a relative UPLOAD_DIR and keeps an absolute one", () => {
    withEnv({ UPLOAD_DIR: "var/uploads" }, () => {
      expect(getUploadDir()).toBe(path.join(process.cwd(), "var/uploads"));
    });
    withEnv({ UPLOAD_DIR: "/var/midtravel/uploads" }, () => {
      expect(getUploadDir()).toBe("/var/midtravel/uploads");
    });
  });
});
