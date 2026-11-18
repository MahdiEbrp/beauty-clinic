import { describe, expect, it } from "vitest";

import { isPreviewable, isSafeInlineImage, isTextMime, mimeFromName } from "@/lib/storage/mime";

describe("mimeFromName", () => {
  it("maps known extensions (case-insensitively)", () => {
    expect(mimeFromName("report.pdf")).toBe("application/pdf");
    expect(mimeFromName("photo.JPG")).toBe("image/jpeg");
    expect(mimeFromName("style.css")).toBe("text/css");
    expect(mimeFromName("archive.tar.gz")).toBe("application/gzip");
  });

  it("falls back to octet-stream for unknown or missing extensions", () => {
    expect(mimeFromName("README")).toBe("application/octet-stream");
    expect(mimeFromName("noext.")).toBe("application/octet-stream");
    expect(mimeFromName(".gitignore")).toBe("application/octet-stream");
    expect(mimeFromName("file.unknownfuture")).toBe("application/octet-stream");
  });
});

describe("isTextMime", () => {
  it("accepts text-like types", () => {
    for (const mime of ["text/plain", "text/markdown", "application/json", "application/xml", "application/sql"]) {
      expect(isTextMime(mime)).toBe(true);
    }
  });

  it("rejects binary and image types", () => {
    for (const mime of ["application/pdf", "image/png", "image/svg+xml", "application/zip"]) {
      expect(isTextMime(mime)).toBe(false);
    }
  });
});

describe("isPreviewable", () => {
  it("accepts images and pdfs", () => {
    expect(isPreviewable("image/png")).toBe(true);
    expect(isPreviewable("image/svg+xml")).toBe(true);
    expect(isPreviewable("application/pdf")).toBe(true);
  });

  it("rejects non-previewable types", () => {
    expect(isPreviewable("text/plain")).toBe(false);
    expect(isPreviewable("application/zip")).toBe(false);
    expect(isPreviewable("video/mp4")).toBe(false);
  });
});

describe("isSafeInlineImage", () => {
  it.each(["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif", "image/x-icon"])("allows %s inline", (mime) => {
    expect(isSafeInlineImage(mime)).toBe(true);
  });

  it.each(["image/svg+xml", "image/unknown", "text/html", "text/javascript", "application/pdf", "application/octet-stream"])("keeps %s as an attachment", (mime) => {
    expect(isSafeInlineImage(mime)).toBe(false);
  });
});
