import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./user";

const validSignup = {
  fullName: "Jane Doe",
  email: "Jane@Example.COM",
  phone: "+989121234567",
  password: "Correct-Horse-1!",
};

describe("signupSchema", () => {
  it("accepts a valid signup and normalizes email", () => {
    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("jane@example.com");
      expect(result.data.fullName).toBe("Jane Doe");
    }
  });

  it("accepts an empty phone", () => {
    const result = signupSchema.safeParse({ ...validSignup, phone: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBeNull();
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a weak password", () => {
    const result = signupSchema.safeParse({ ...validSignup, password: "weak" });
    expect(result.success).toBe(false);
  });

  it("rejects a password without special characters", () => {
    const result = signupSchema.safeParse({ ...validSignup, password: "CorrectHorse1" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields (mass-assignment protection)", () => {
    const result = signupSchema.safeParse({ ...validSignup, role: "admin" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "Jane@Example.COM", password: "x".repeat(12) });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = loginSchema.safeParse({ email: "jane@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "x".repeat(12),
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });
});
