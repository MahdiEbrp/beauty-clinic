import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MockDb, Row } from "@/lib/test/mock-db";

// `server-only` throws when imported outside a Server Component runtime, so
// the auth service's guard import must be stubbed in the test environment.
vi.mock("server-only", () => ({}));

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

import { db } from "@/src/db";
import {
  hashOtpCode,
  issueLoginOtp,
  LOGIN_LOCKOUT_MS,
  OTP_MAX_VERIFY_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  verifyLoginOtp,
} from "./otp";

const mockDb = db as unknown as MockDb;

const baseUser: Row = {
  id: "u1",
  email: "jane@example.com",
  phone: "+989121234567",
  passwordHash: "hash:secret",
  fullName: "Jane Doe",
  avatarUrl: null,
  isActive: true,
  isBanned: false,
  bannedAt: null,
  banReason: null,
  bannedBy: null,
  deletedAt: null,
  emailVerifiedAt: null,
  phoneVerifiedAt: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  passwordChangedAt: null,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
};

const activeCode = (overrides: Row = {}): Row => ({
  id: "c1",
  userId: "u1",
  purpose: "login",
  channel: "sms",
  codeHash: hashOtpCode("123456"),
  attempts: 0,
  resends: 0,
  expiresAt: new Date(Date.now() + 5 * 60_000),
  lastSentAt: new Date(Date.now() - 2_000),
  consumedAt: null,
  createdAt: new Date(),
  ...overrides,
});

beforeEach(() => {
  mockDb.reset();
});

describe("issueLoginOtp", () => {
  it("consumes previous active codes and issues a fresh one", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [
      activeCode({ id: "old1", createdAt: new Date(Date.now() - 60_000) }),
      activeCode({ id: "old2", createdAt: new Date(Date.now() - 30_000) }),
    ]);

    const issued = await issueLoginOtp("u1", "sms");

    expect(issued.code).toMatch(/^\d{6}$/);
    expect(issued.expiresAt.getTime() - Date.now()).toBeGreaterThan(
      OTP_TTL_MS - 2_000,
    );
    expect(issued.resendAt.getTime() - Date.now()).toBeGreaterThan(
      OTP_RESEND_COOLDOWN_MS - 2_000,
    );

    const codes = mockDb.data.otp_codes;
    expect(codes).toHaveLength(3);
    expect(codes[0].consumedAt).toBeInstanceOf(Date);
    expect(codes[1].consumedAt).toBeInstanceOf(Date);
    expect(codes[2]).toMatchObject({
      channel: "sms",
      consumedAt: null,
      codeHash: hashOtpCode(issued.code),
    });
  });
});

describe("verifyLoginOtp", () => {
  it("signs in with a valid code, consuming it and resetting counters", async () => {
    mockDb.seed("users", [
      { ...baseUser, failedLoginAttempts: 3, lockedUntil: new Date() },
    ]);
    mockDb.seed("otp_codes", [activeCode()]);

    const result = await verifyLoginOtp({ phone: "+989121234567" }, "123456");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.id).toBe("u1");
    }
    const user = mockDb.data.users[0];
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockedUntil).toBeNull();
    expect(user.lastLoginAt).toBeInstanceOf(Date);
    expect(user.phoneVerifiedAt).toBeInstanceOf(Date);
    expect(mockDb.data.otp_codes[0].consumedAt).toBeInstanceOf(Date);
  });

  it("keeps an existing phoneVerifiedAt on success", async () => {
    const verifiedAt = new Date();
    mockDb.seed("users", [{ ...baseUser, phoneVerifiedAt: verifiedAt }]);
    mockDb.seed("otp_codes", [activeCode()]);

    await verifyLoginOtp({ phone: "+989121234567" }, "123456");

    expect(mockDb.data.users[0].phoneVerifiedAt).toBe(verifiedAt);
  });

  it("returns USER_NOT_FOUND for an unknown phone (no code probing)", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [activeCode()]);

    const result = await verifyLoginOtp({ phone: "+989100000000" }, "123456");

    expect(result).toEqual({ ok: false, reason: "USER_NOT_FOUND" });
    expect(mockDb.data.otp_codes[0].consumedAt).toBeNull();
    expect(mockDb.data.otp_codes[0].attempts).toBe(0);
  });

  it("returns ACCOUNT_INACTIVE for an inactive account", async () => {
    mockDb.seed("users", [{ ...baseUser, isActive: false }]);
    mockDb.seed("otp_codes", [activeCode()]);

    expect(await verifyLoginOtp({ phone: "+989121234567" }, "123456")).toMatchObject({
      ok: false,
      reason: "ACCOUNT_INACTIVE",
    });
  });

  it("returns ACCOUNT_BANNED for a banned account", async () => {
    mockDb.seed("users", [{ ...baseUser, isBanned: true }]);
    mockDb.seed("otp_codes", [activeCode()]);

    expect(await verifyLoginOtp({ phone: "+989121234567" }, "123456")).toMatchObject({
      ok: false,
      reason: "ACCOUNT_BANNED",
    });
  });

  it("returns LOCKED_OUT while the account is locked", async () => {
    mockDb.seed("users", [
      { ...baseUser, lockedUntil: new Date(Date.now() + 60_000) },
    ]);
    mockDb.seed("otp_codes", [activeCode()]);

    const result = await verifyLoginOtp({ phone: "+989121234567" }, "123456");

    expect(result).toMatchObject({ ok: false, reason: "LOCKED_OUT" });
    if (!result.ok && result.reason === "LOCKED_OUT") {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
    }
  });

  it("returns NO_CODE when no active code exists", async () => {
    mockDb.seed("users", [baseUser]);

    expect(await verifyLoginOtp({ phone: "+989121234567" }, "123456")).toMatchObject({
      ok: false,
      reason: "NO_CODE",
    });
  });

  it("returns CODE_EXPIRED and consumes the row when the code is stale", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [
      activeCode({ expiresAt: new Date(Date.now() - 1_000) }),
    ]);

    const result = await verifyLoginOtp({ phone: "+989121234567" }, "123456");

    expect(result).toMatchObject({ ok: false, reason: "CODE_EXPIRED" });
    expect(mockDb.data.otp_codes[0].consumedAt).toBeInstanceOf(Date);
  });

  it("counts a wrong code against the row and the user", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [activeCode()]);

    const result = await verifyLoginOtp({ phone: "+989121234567" }, "000000");

    expect(result).toEqual({
      ok: false,
      reason: "INVALID_CODE",
      attemptsLeft: OTP_MAX_VERIFY_ATTEMPTS - 1,
    });
    expect(mockDb.data.otp_codes[0].attempts).toBe(1);
    expect(mockDb.data.users[0].failedLoginAttempts).toBe(1);
  });

  it("consumes the code when its attempts are exhausted", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [
      activeCode({ attempts: OTP_MAX_VERIFY_ATTEMPTS - 1 }),
    ]);

    const result = await verifyLoginOtp({ phone: "+989121234567" }, "000000");

    expect(result).toEqual({
      ok: false,
      reason: "TOO_MANY_ATTEMPTS",
      attemptsLeft: 0,
    });
    expect(mockDb.data.otp_codes[0].attempts).toBe(OTP_MAX_VERIFY_ATTEMPTS);
    expect(mockDb.data.otp_codes[0].consumedAt).toBeInstanceOf(Date);
  });

  it("locks the account after five cumulative user failures", async () => {
    mockDb.seed("users", [{ ...baseUser, failedLoginAttempts: 4 }]);
    mockDb.seed("otp_codes", [activeCode()]);

    const result = await verifyLoginOtp({ phone: "+989121234567" }, "000000");

    expect(result).toEqual({
      ok: false,
      reason: "LOCKED_OUT",
      retryAfterMs: LOGIN_LOCKOUT_MS,
    });
    const user = mockDb.data.users[0];
    expect(user.failedLoginAttempts).toBe(5);
    expect(user.lockedUntil).toBeInstanceOf(Date);
  });

  it("signs in by email, marking the email verified and leaving the phone alone", async () => {
    mockDb.seed("users", [{ ...baseUser, phone: null }]);
    mockDb.seed("otp_codes", [activeCode({ channel: "email" })]);

    const result = await verifyLoginOtp(
      { email: "Jane@Example.COM" },
      "123456",
    );

    expect(result.ok).toBe(true);
    const user = mockDb.data.users[0];
    expect(user.emailVerifiedAt).toBeInstanceOf(Date);
    expect(user.phoneVerifiedAt).toBeNull();
    expect(mockDb.data.otp_codes[0].consumedAt).toBeInstanceOf(Date);
  });

  it("returns USER_NOT_FOUND for an unknown email (no code probing)", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [activeCode()]);

    const result = await verifyLoginOtp(
      { email: "nobody@example.com" },
      "123456",
    );

    expect(result).toEqual({ ok: false, reason: "USER_NOT_FOUND" });
    expect(mockDb.data.otp_codes[0].consumedAt).toBeNull();
    expect(mockDb.data.otp_codes[0].attempts).toBe(0);
  });

  it("keeps an existing emailVerifiedAt when signing in by email", async () => {
    const verifiedAt = new Date();
    mockDb.seed("users", [{ ...baseUser, phone: null, emailVerifiedAt: verifiedAt }]);
    mockDb.seed("otp_codes", [activeCode({ channel: "email" })]);

    await verifyLoginOtp({ email: "jane@example.com" }, "123456");

    expect(mockDb.data.users[0].emailVerifiedAt).toBe(verifiedAt);
    expect(mockDb.data.users[0].phoneVerifiedAt).toBeNull();
  });
});

