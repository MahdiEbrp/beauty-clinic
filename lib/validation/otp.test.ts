import { describe, expect, it } from "vitest";

import { requestOtpSchema, resendOtpSchema, verifyOtpSchema } from "./otp";

const validRequest = { phone: "+989121234567", channel: "sms" as const };

describe("requestOtpSchema / resendOtpSchema", () => {
  it("accepts a valid phone and channel", () => {
    expect(requestOtpSchema.safeParse(validRequest).success).toBe(true);
    expect(requestOtpSchema.safeParse({ ...validRequest, channel: "email" }).success).toBe(true);
    expect(resendOtpSchema.safeParse(validRequest).success).toBe(true);
  });

  it("trims the phone", () => {
    const result = requestOtpSchema.safeParse({ ...validRequest, phone: "  09121234567  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("09121234567");
  });

  it("rejects a missing or malformed phone", () => {
    expect(requestOtpSchema.safeParse({ phone: "", channel: "sms" }).success).toBe(false);
    expect(requestOtpSchema.safeParse({ phone: "not-a-phone", channel: "sms" }).success).toBe(false);
    expect(requestOtpSchema.safeParse({ channel: "sms" }).success).toBe(false);
  });

  it("rejects an unknown channel", () => {
    expect(requestOtpSchema.safeParse({ ...validRequest, channel: "push" }).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(requestOtpSchema.safeParse({ ...validRequest, code: "123456" }).success).toBe(false);
  });
});

describe("verifyOtpSchema", () => {
  // verifyOtpSchema is strict and takes no channel — build payloads without it.
  const parse = (code: string) =>
    verifyOtpSchema.safeParse({ phone: validRequest.phone, code });

  it("accepts a 6-digit code", () => {
    expect(parse("004821").success).toBe(true);
  });

  it("trims the code before validating", () => {
    expect(parse(" 123456 ").success).toBe(true);
  });

  it("rejects short, long and non-digit codes", () => {
    expect(parse("12345").success).toBe(false);
    expect(parse("1234567").success).toBe(false);
    expect(parse("abcdef").success).toBe(false);
    expect(parse("").success).toBe(false);
  });

  it("rejects a missing phone or unknown fields", () => {
    expect(verifyOtpSchema.safeParse({ code: "123456" }).success).toBe(false);
    expect(parse("123456").success).toBe(true);
    expect(
      verifyOtpSchema.safeParse({
        phone: validRequest.phone,
        code: "123456",
        channel: "sms",
      }).success,
    ).toBe(false);
  });
});
