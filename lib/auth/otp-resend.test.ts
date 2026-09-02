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
  invalidateLatestLoginOtp,
  OTP_MAX_RESENDS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  resendLoginOtp,
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

describe("resendLoginOtp", () => {
  it("respects the resend cooldown", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [activeCode({ lastSentAt: new Date() })]);

    const result = await resendLoginOtp("u1", "sms");

    expect(result).toMatchObject({ ok: false, reason: "RESEND_COOLDOWN" });
    if (!result.ok && result.reason === "RESEND_COOLDOWN") {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(OTP_RESEND_COOLDOWN_MS);
    }
  });

  it("re-issues a fresh code on the same row after the cooldown", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [
      activeCode({ lastSentAt: new Date(Date.now() - (OTP_RESEND_COOLDOWN_MS + 1_000)) }),
    ]);

    const result = await resendLoginOtp("u1", "email");

    expect(result).toMatchObject({ ok: true, channel: "sms" });
    if (result.ok) {
      expect(result.code).toMatch(/^\d{6}$/);
      expect(mockDb.data.otp_codes[0]).toMatchObject({
        codeHash: hashOtpCode(result.code),
        attempts: 0,
        resends: 1,
      });
      expect(result.expiresAt.getTime() - Date.now()).toBeGreaterThan(
        OTP_TTL_MS - 2_000,
      );
    }
  });

  it("rejects a resend past the per-row limit", async () => {
    mockDb.seed("users", [baseUser]);
    mockDb.seed("otp_codes", [
      activeCode({
        lastSentAt: new Date(Date.now() - (OTP_RESEND_COOLDOWN_MS + 1_000)),
        resends: OTP_MAX_RESENDS,
      }),
    ]);

    const result = await resendLoginOtp("u1", "sms");

    expect(result).toEqual({ ok: false, reason: "RESEND_LIMIT", retryAfterMs: 0 });
  });

  it("returns RESEND_LIMIT when no active row exists", async () => {
    mockDb.seed("users", [baseUser]);

    expect(await resendLoginOtp("u1", "sms")).toEqual({
      ok: false,
      reason: "RESEND_LIMIT",
      retryAfterMs: 0,
    });
  });
});

describe("invalidateLatestLoginOtp", () => {
  it("deletes only the latest active code row", async () => {
    mockDb.seed("otp_codes", [
      activeCode({ id: "c-old", createdAt: new Date(Date.now() - 60_000) }),
      activeCode({ id: "c-new", createdAt: new Date(Date.now() - 30_000) }),
    ]);

    await invalidateLatestLoginOtp("u1");

    expect(mockDb.data.otp_codes.map((r) => r.id)).toEqual(["c-old"]);
  });

  it("is a no-op when no active code exists", async () => {
    await expect(invalidateLatestLoginOtp("u1")).resolves.toBeUndefined();
  });
});
