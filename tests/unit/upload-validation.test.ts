import { describe, expect, it } from "vitest";
import {
  hasBlockedUploadExtension,
  looksLikeMarkup,
  matchesRasterMagic,
  MAX_UPLOAD_BYTES,
  validateImageMeta,
  validateImageUpload,
} from "@/lib/upload-validation";

function jpegBuffer() {
  const buffer = Buffer.alloc(16, 0);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  return buffer;
}

function pngBuffer() {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
  ]);
}

describe("validateImageMeta", () => {
  it("accepts jpeg/png metadata", () => {
    expect(
      validateImageMeta({ type: "image/jpeg", name: "hero.jpg", size: 1200 })
    ).toEqual({ ok: true, ext: ".jpg" });
    expect(
      validateImageMeta({ type: "image/png", name: "hero.png", size: 1200 })
    ).toEqual({ ok: true, ext: ".png" });
  });

  it("rejects SVG, HTML, JS and unknown MIME even if the name looks like a jpg", () => {
    expect(
      validateImageMeta({ type: "image/svg+xml", name: "x.svg", size: 100 })
    ).toEqual({ ok: false, code: "INVALID_TYPE" });
    expect(
      validateImageMeta({ type: "image/jpeg", name: "xss.svg", size: 100 })
    ).toEqual({ ok: false, code: "INVALID_TYPE" });
    expect(
      validateImageMeta({ type: "image/jpeg", name: "page.html", size: 100 })
    ).toEqual({ ok: false, code: "INVALID_TYPE" });
    expect(
      validateImageMeta({ type: "application/javascript", name: "x.js", size: 100 })
    ).toEqual({ ok: false, code: "INVALID_TYPE" });
    expect(hasBlockedUploadExtension("payload.SVG")).toBe(true);
  });

  it("rejects empty and oversized files", () => {
    expect(
      validateImageMeta({ type: "image/jpeg", name: "a.jpg", size: 0 })
    ).toEqual({ ok: false, code: "TOO_LARGE" });
    expect(
      validateImageMeta({
        type: "image/jpeg",
        name: "a.jpg",
        size: MAX_UPLOAD_BYTES + 1,
      })
    ).toEqual({ ok: false, code: "TOO_LARGE" });
  });
});

describe("validateImageUpload / magic bytes", () => {
  it("accepts a real JPEG header", () => {
    const buffer = jpegBuffer();
    expect(matchesRasterMagic(buffer, "image/jpeg")).toBe(true);
    expect(
      validateImageUpload({
        type: "image/jpeg",
        name: "hero.jpg",
        size: buffer.length,
        buffer,
      })
    ).toEqual({ ok: true, ext: ".jpg" });
  });

  it("rejects a JPEG MIME with PNG bytes or markup payload", () => {
    const png = pngBuffer();
    expect(
      validateImageUpload({
        type: "image/jpeg",
        name: "hero.jpg",
        size: png.length,
        buffer: png,
      })
    ).toEqual({ ok: false, code: "INVALID_TYPE" });

    const svg = Buffer.from(
      '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>'
    );
    expect(looksLikeMarkup(svg)).toBe(true);
    expect(
      validateImageUpload({
        type: "image/jpeg",
        name: "hero.jpg",
        size: svg.length,
        buffer: svg,
      })
    ).toEqual({ ok: false, code: "INVALID_TYPE" });
  });
});
