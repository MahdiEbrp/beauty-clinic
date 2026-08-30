import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import {
  decryptMessageContent,
  decryptProviderSecret,
  encryptMessageContent,
  encryptProviderSecret,
} from "./crypto";

describe("SMS secret storage", () => {
  it("encrypts provider URL, token, and credentials", () => {
    const encrypted = encryptProviderSecret({
      apiUrl: "https://sms.example.test",
      token: "secret-token",
      credentials: { authScheme: "bearer", lineNumber: "1000" },
    });
    expect(encrypted.tokenLast4).toBe("oken");
    const provider = decryptProviderSecret({
      id: "provider",
      name: "Test",
      kind: "custom",
      ...encrypted,
      sender: null,
      isActive: true,
      isDefault: false,
      healthStatus: "unknown",
      lastHealthCheckedAt: null,
      lastHealthError: null,
    });
    expect(provider.apiUrl).toBe("https://sms.example.test");
    expect(provider.token).toBe("secret-token");
    expect(provider.credentials.lineNumber).toBe("1000");
  });

  it("encrypts recipient and message while exposing only a masked recipient", () => {
    const encrypted = encryptMessageContent("09121234567", "سلام");
    expect(encrypted.recipientMasked).toContain("••••");
    expect(decryptMessageContent(encrypted)).toEqual({
      recipient: "+989121234567",
      body: "سلام",
    });
  });
});
