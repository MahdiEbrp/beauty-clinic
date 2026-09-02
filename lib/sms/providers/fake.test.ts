import { afterEach, describe, expect, it, vi } from "vitest";

import { createFakeAdapter } from "./fake";
import { createSmsProviderAdapter } from "./index";
import type { SmsProviderConfig } from "./types";

const CONFIG: SmsProviderConfig = {
  kind: "fake",
  apiUrl: "https://fake.local",
  token: "fake-sms-token",
  credentials: { authScheme: "none" },
  sender: null,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fake SMS adapter", () => {
  it("is selected by the provider factory", () => {
    const adapter = createSmsProviderAdapter(CONFIG);
    expect(adapter.sendVerify).toBeTypeOf("function");
    expect(adapter.getCredit).toBeTypeOf("function");
  });

  it("accepts every recipient without calling the network", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const adapter = createFakeAdapter(CONFIG);

    const result = await adapter.send({
      recipients: ["09120000001", "09120000002"],
      message: "Hello",
      sender: "100020003000",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.rejected).toHaveLength(0);
    expect(result.statusCode).toBe(200);
    expect(result.accepted).toHaveLength(2);
    expect(result.accepted.map((row) => row.recipient)).toEqual([
      "09120000001",
      "09120000002",
    ]);
    for (const row of result.accepted) {
      expect(row.providerMessageId).toMatch(/^fake-/);
      expect(row.providerStatus).toBe("sent");
    }
  });

  it("simulates OTP verify, credit, lines, reports and receive", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const adapter = createFakeAdapter(CONFIG);

    const verify = await adapter.sendVerify({
      recipients: ["09120000001"],
      templateId: 100,
      parameters: [{ name: "code", value: "1234" }],
    });
    expect(verify.accepted).toHaveLength(1);
    expect(verify.accepted[0].providerStatus).toBe("sent");

    await expect(adapter.getCredit()).resolves.toBeGreaterThan(0);
    await expect(adapter.getLines()).resolves.toBeInstanceOf(Array);
    const report = await adapter.getMessage("fake-abc");
    expect(report?.deliveryState).toBe(1);
    await expect(adapter.receiveLatest()).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
