import { afterEach, describe, expect, it, vi } from "vitest";

import { createFakeAdapter } from "./fake";
import { createEmailProviderAdapter } from "./index";
import type { EmailProviderConfig } from "./types";

const CONFIG: EmailProviderConfig = {
  kind: "fake",
  host: "smtp.fake.local",
  port: 465,
  username: "fake-sender@fake.local",
  password: "fake-password",
  encryption: "none",
  fromEmail: "noreply@fake.local",
  fromName: "Fake Sender",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fake email adapter", () => {
  it("is selected by the provider factory", () => {
    const adapter = createEmailProviderAdapter(CONFIG);
    expect(adapter.send).toBeTypeOf("function");
  });

  it("accepts every recipient without opening an SMTP connection", async () => {
    const connectMock = vi.spyOn(globalThis, "fetch");
    const netConnect = vi.spyOn(require("node:net"), "connect");
    const adapter = createFakeAdapter(CONFIG);

    const result = await adapter.send({
      recipients: ["one@example.com", "two@example.com"],
      subject: "Test subject",
      message: "Hello there",
      templateType: "plain",
      fromEmail: "noreply@fake.local",
    });

    expect(connectMock).not.toHaveBeenCalled();
    expect(netConnect).not.toHaveBeenCalled();
    expect(result.rejected).toHaveLength(0);
    expect(result.statusCode).toBe(200);
    expect(result.accepted).toHaveLength(2);
    for (const row of result.accepted) {
      expect(row.providerMessageId).toMatch(/^fake-/);
      expect(row.providerStatus).toBe("sent");
    }
  });
});
