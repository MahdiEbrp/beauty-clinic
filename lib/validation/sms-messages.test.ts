import { describe, expect, it } from "vitest";

import { sendSmsSchema } from "./sms-messages";

describe("SMS send validation", () => {
  it("accepts a normalized send request", () => {
    const result = sendSmsSchema.safeParse({
      providerId: "550e8400-e29b-41d4-a716-446655440001",
      recipients: ["09121234567"],
      message: "test",
    });
    expect(result.success).toBe(true);
  });

  it("requires either a message or a template", () => {
    expect(sendSmsSchema.safeParse({ recipients: ["09121234567"] }).success).toBe(false);
  });

  it("rejects invalid recipients", () => {
    expect(sendSmsSchema.safeParse({ recipients: ["02112345678"], message: "test" }).success).toBe(false);
  });
});
