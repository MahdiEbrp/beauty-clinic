import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockDb } from "@/lib/test/mock-db";
import { db } from "@/src/db";
import { createSmsProviderAdapter } from "./providers";
import { testSmsProvider } from "./provider-check-service";

vi.mock("server-only", () => ({}));
vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});
vi.mock("./crypto", () => ({
  decryptProviderSecret: (row: { kind: string }) => ({
    kind: row.kind, credentials: { lineNumber: "1000" }, sender: null,
  }),
}));
vi.mock("./providers", async () => {
  const { SmsProviderError } = await import("./providers/types");
  return { SmsProviderError, createSmsProviderAdapter: vi.fn() };
});

const mockDb = db as unknown as MockDb;
const accepted = { accepted: [{ recipient: "+989120000001" }], rejected: [], statusCode: 200 };
const send = vi.fn().mockResolvedValue(accepted);
const sendVerify = vi.fn().mockResolvedValue(accepted);

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.reset();
});

describe("provider health-check capability narrowing", () => {
  it.each([
    { kind: "sms_ir", supportsVerify: true, variables: ["code"], expectedVerify: true },
    { kind: "sms_ir", supportsVerify: false, variables: ["code"], expectedVerify: false },
    { kind: "sms_ir", supportsVerify: true, variables: [], expectedVerify: false },
    { kind: "fake", supportsVerify: true, variables: ["code"], expectedVerify: false },
  ])("uses the correct delivery path for $kind (capability: $supportsVerify, variables: $variables)", async ({ kind, supportsVerify, variables, expectedVerify }) => {
    mockDb.seed("sms_providers", [{ id: "provider", kind, isActive: true, deletedAt: null }]);
    mockDb.seed("sms_templates", [{ key: "login-otp", isActive: true, deletedAt: null, externalTemplateId: "100", variables }]);
    vi.mocked(createSmsProviderAdapter).mockReturnValue({
      send, ...(supportsVerify ? { sendVerify } : {}),
    });
    const result = await testSmsProvider("provider", { recipient: "09120000001", message: "123456" }, "editor");
    expect(result.successful).toBe(true);
    if (expectedVerify) {
      expect(sendVerify).toHaveBeenCalledWith({
        recipients: ["+989120000001"], templateId: 100,
        parameters: [{ name: "code", value: "123456" }],
      });
      expect(send).not.toHaveBeenCalled();
    } else {
      expect(send).toHaveBeenCalledWith({ recipients: ["+989120000001"], message: "123456", sender: "1000" });
      expect(sendVerify).not.toHaveBeenCalled();
    }
    expect(mockDb.data.sms_provider_checks).toHaveLength(1);
    expect(mockDb.data.sms_provider_checks[0].isSuccessful).toBe(true);
  });
});
