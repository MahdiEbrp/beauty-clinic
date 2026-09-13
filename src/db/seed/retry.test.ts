import { describe, expect, it, vi } from "vitest";

import { withRetry } from "./retry";

describe("withRetry", () => {
  it("returns the result on the first attempt", async () => {
    await expect(withRetry(() => Promise.resolve("ok"), { log: false })).resolves.toBe(
      "ok",
    );
  });

  it("retries transient connection errors and succeeds", async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" }))
      .mockResolvedValueOnce("ok");

    await expect(withRetry(fn, { attempts: 3, baseDelayMs: 1, log: false })).resolves.toBe(
      "ok",
    );
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries DrizzleQueryError whose cause is a connection failure", async () => {
    const transient = new Error("read ECONNRESET at TLSWrap.onStreamRead");
    Object.assign(transient, { code: "ECONNRESET", syscall: "read" });
    const drizzle = new Error("DrizzleQueryError: Failed query: ...");
    drizzle.cause = transient;

    const fn = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(drizzle)
      .mockResolvedValueOnce(undefined);

    await expect(withRetry(fn, { attempts: 3, baseDelayMs: 1, log: false })).resolves.toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("rethrows non-transient errors immediately", async () => {
    const fn = vi
      .fn<() => Promise<never>>()
      .mockRejectedValueOnce(new Error("relation \"users\" does not exist"));

    await expect(withRetry(fn, { attempts: 3, baseDelayMs: 1, log: false })).rejects.toThrow(
      "relation \"users\" does not exist",
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("gives up after the configured attempts", async () => {
    const fn = vi
      .fn<() => Promise<never>>()
      .mockRejectedValue(Object.assign(new Error("write CONNECT_TIMEOUT"), { code: "CONNECT_TIMEOUT" }));

    await expect(withRetry(fn, { attempts: 2, baseDelayMs: 1, log: false })).rejects.toThrow(
      "CONNECT_TIMEOUT",
    );
    expect(fn).toHaveBeenCalledTimes(2);
  });
});