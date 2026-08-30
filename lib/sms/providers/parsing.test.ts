import { describe, expect, it } from "vitest";

import { asRecord, readBoolean, readNumber, readString } from "./parsing";

describe("provider response parsing", () => {
  it("safely reads typed values from unknown responses", () => {
    const record = asRecord({ id: 42, ok: "true", message: " accepted " });
    expect(readNumber(record, "id")).toBe(42);
    expect(readBoolean(record, "ok")).toBe(true);
    expect(readString(record, "message")).toBe("accepted");
  });

  it("does not treat arrays or empty values as records", () => {
    expect(asRecord([])).toBeNull();
    expect(readString(asRecord({ message: "" }), "message")).toBeUndefined();
  });
});
