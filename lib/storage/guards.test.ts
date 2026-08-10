import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { ensureAllowed, HIDDEN_PREFIX, notFound } from "@/lib/storage/guards";

describe("guards", () => {
  describe("notFound", () => {
    it("throws a 404 NOT_FOUND ApiError", () => {
      try {
        void notFound("a.txt", "file");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
          status: 404,
          code: "NOT_FOUND",
        });
      }
    });

    it("includes the requested kind in the message", () => {
      expect(() => notFound("x", "trash entry")).toThrow(/trash entry/);
    });
  });

  describe("ensureAllowed", () => {
    it("accepts the root and normal paths", () => {
      expect(() => ensureAllowed("")).not.toThrow();
      expect(() => ensureAllowed("docs/images")).not.toThrow();
    });

    it("rejects any segment starting with the hidden prefix", () => {
      for (const rel of [".hidden", "docs/.env", ".trash/x", ".meta/.trash/y"]) {
        expect(() => ensureAllowed(rel)).toThrow(ApiError);
      }
    });
  });

  it("exposes the hidden prefix used by the rest of the module", () => {
    expect(HIDDEN_PREFIX).toBe(".");
  });
});