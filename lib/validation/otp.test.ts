import { describe, expect, it } from "vitest";

import { requestOtpSchema, resendOtpSchema, verifyOtpSchema } from "./otp";

const validSmsRequest = { phone: "+989121234567", channel: "sms" as const };
const validEmailRequest = {
  email: "jane@example.com",
  channel: "email" as const,
};

describe("requestOtpSchema / resendOtpSchema", () => {
  it("accepts a phone on the sms channel", () => {
    expect(requestOtpSchema.safeParse(validSmsRequest).success).toBe(true);
    expect(resendOtpSchema.safeParse(validSmsRequest).success).toBe(true);
  });

  it("accepts an email on the email channel and normalizes it", () => {
    const result = requestOtpSchema.safeParse({
      ...validEmailRequest,
      email: "Jane@Example.COM",
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.channel === "email") {
      expect(result.data.email).toBe("jane@example.com");
    }
    expect(resendOtpSchema.safeParse(validEmailRequest).success).toBe(true);
  });

  it("trims the phone", () => {
    const result = requestOtpSchema.safeParse({
      ...validSmsRequest,
      phone: "  09121234567  ",
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.channel === "sms") {
      expect(result.data.phone).toBe("09121234567");
    }
  });

  it("rejects an email on the sms channel and vice versa", () => {
    expect(
      requestOtpSchema.safeParse({ ...validSmsRequest, email: "a@b.com" }).success,
    ).toBe(false);
    expect(
      requestOtpSchema.safeParse({ ...validEmailRequest, phone: "+989121234567" }).success,
    ).toBe(false);
  });

  it("rejects a missing or malformed phone on sms", () => {
    expect(requestOtpSchema.safeParse({ phone: "", channel: "sms" }).success).toBe(false);
    expect(requestOtpSchema.safeParse({ phone: "not-a-phone", channel: "sms" }).success).toBe(false);
    expect(requestOtpSchema.safeParse({ channel: "sms" }).success).toBe(false);
  });

  it("rejects a missing or malformed email on email", () => {
    expect(requestOtpSchema.safeParse({ email: "", channel: "email" }).success).toBe(false);
    expect(requestOtpSchema.safeParse({ email: "not-an-email", channel: "email" }).success).toBe(false);
    expect(requestOtpSchema.safeParse({ channel: "email" }).success).toBe(false);
  });

  it("rejects an unknown channel", () => {
    expect(requestOtpSchema.safeParse({ ...validSmsRequest, channel: "push" }).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(requestOtpSchema.safeParse({ ...validSmsRequest, code: "123456" }).success).toBe(false);
  });
});

describe("verifyOtpSchema", () => {
  // verifyOtpSchema is strict and takes no channel — build payloads without it.
  const parse = (code: string) =>
    verifyOtpSchema.safeParse({ phone: validSmsRequest.phone, code });

  it("accepts a 6-digit code with a phone identifier", () => {
    expect(parse("004821").success).toBe(true);
  });

  it("accepts a 6-digit code with an email identifier", () => {
    expect(
      verifyOtpSchema.safeParse({
        email: validEmailRequest.email,
        code: "004821",
      }).success,
    ).toBe(true);
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

  it("rejects missing, both or unknown identifiers and unknown fields", () => {
    expect(verifyOtpSchema.safeParse({ code: "123456" }).success).toBe(false);
    expect(
      verifyOtpSchema.safeParse({
        phone: validSmsRequest.phone,
        email: validEmailRequest.email,
        code: "123456",
      }).success,
    ).toBe(false);
    expect(
      verifyOtpSchema.safeParse({
        phone: validSmsRequest.phone,
        code: "123456",
        channel: "sms",
      }).success,
    ).toBe(false);
  });
});
