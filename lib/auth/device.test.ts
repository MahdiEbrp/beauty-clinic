import { describe, expect, it } from "vitest";
import { describeDevice } from "./device";

describe("describeDevice", () => {
  it("returns unknown kind and empty label for missing agents", () => {
    expect(describeDevice()).toEqual({ kind: "unknown", label: "" });
    expect(describeDevice(null)).toEqual({ kind: "unknown", label: "" });
  });

  it("detects desktop Chrome on Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
    expect(describeDevice(ua).kind).toBe("desktop");
    expect(describeDevice(ua).label).toContain("Chrome");
    expect(describeDevice(ua).label).toContain("Windows");
  });

  it("detects mobile Safari on iOS", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
    const info = describeDevice(ua);
    expect(info.kind).toBe("mobile");
    expect(info.label).toContain("Safari");
    expect(info.label).toContain("iOS");
  });

  it("detects mobile Chrome on Android", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";
    const info = describeDevice(ua);
    expect(info.kind).toBe("mobile");
    expect(info.label).toContain("Chrome");
    expect(info.label).toContain("Android");
  });

  it("detects an iPad as a tablet", () => {
    const ua =
      "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
    expect(describeDevice(ua).kind).toBe("tablet");
  });
});
