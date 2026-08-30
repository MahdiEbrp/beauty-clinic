import { describe, expect, it } from "vitest";

import { createSmsProviderSchema, testSmsProviderSchema } from "./sms-providers";

const valid = {
  name: "Primary",
  kind: "custom" as const,
  apiUrl: "https://sms.example.test",
  token: "token",
  isActive: true,
  isDefault: false,
};

describe("SMS provider validation", () => {
  it("accepts HTTPS provider credentials", () => {
    expect(createSmsProviderSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects insecure URLs and blank update tokens", () => {
    expect(createSmsProviderSchema.safeParse({ ...valid, apiUrl: "http://sms.example.test" }).success).toBe(false);
    expect(testSmsProviderSchema.safeParse({ recipient: "09121234567", message: "test" }).success).toBe(true);
  });

  it("validates Iranian test recipients", () => {
    expect(testSmsProviderSchema.safeParse({ recipient: "02112345678", message: "test" }).success).toBe(false);
  });
});
