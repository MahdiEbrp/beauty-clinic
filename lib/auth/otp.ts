import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import { otpCodes, users } from "@/src/db/schema";
import type { OtpChannel } from "@/src/db/schema";

import {
  otpTtlMs,
  otpResendCooldownMs,
  OTP_TTL_MS,
  OTP_RESEND_COOLDOWN_MS,
} from "./otp-limits";

export { OTP_TTL_MS, OTP_RESEND_COOLDOWN_MS, otpTtlMs, otpResendCooldownMs };

export const OTP_CODE_LENGTH = 6;
export const OTP_MAX_VERIFY_ATTEMPTS = 5;
export const OTP_MAX_RESENDS = 3;
/** Cumulative wrong codes per user before the account is locked out. */
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Constant-time comparison of two sha256 hex digests. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/** Random 6-digit code, zero-padded (e.g. "004821"). */
export function generateOtpCode(): string {
  return String(randomInt(0, 10 ** OTP_CODE_LENGTH)).padStart(OTP_CODE_LENGTH, "0");
}

export function hashOtpCode(code: string): string {
  return sha256Hex(code);
}

/** Finds a non-deleted user by phone. */
export async function getLoginUserByPhone(phone: string) {
  return db.query.users.findFirst({
    where: and(eq(users.phone, phone), isNull(users.deletedAt)),
  });
}

/** Finds a non-deleted user by (already normalized) email. */
export async function getLoginUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: and(eq(users.email, email.toLowerCase()), isNull(users.deletedAt)),
  });
}

export type LoginIdentifier = { phone?: string; email?: string };

/** Resolves a non-deleted user by whichever identifier the client supplied. */
export async function getLoginUserByIdentifier(identifier: LoginIdentifier) {
  return identifier.email !== undefined
    ? getLoginUserByEmail(identifier.email)
    : getLoginUserByPhone(identifier.phone ?? "");
}

export type IssuedOtp = {
  code: string;
  expiresAt: Date;
  /** Earliest moment a resend is allowed (now + cooldown). */
  resendAt: Date;
};

/**
 * Invalidates the user's previous active login code and issues a fresh one.
 * Race-safe via the partial unique index `otp_codes_login_active_one_per_user`
 * (concurrent issues consume each other's rows and retry until one wins).
 */
export async function issueLoginOtp(
  userId: string,
  channel: OtpChannel,
): Promise<IssuedOtp> {
  const code = generateOtpCode();
  const now = Date.now();
  const expiresAt = new Date(now + otpTtlMs(channel));

  for (let attempt = 0; attempt < 5; attempt++) {
    await db
      .update(otpCodes)
      .set({ consumedAt: new Date() })
      .where(
        and(eq(otpCodes.userId, userId), eq(otpCodes.purpose, "login"), isNull(otpCodes.consumedAt)),
      );

    const [row] = await db
      .insert(otpCodes)
      .values({
        userId,
        purpose: "login",
        channel,
        codeHash: hashOtpCode(code),
        expiresAt,
        lastSentAt: new Date(now),
      })
      .onConflictDoNothing({
        target: otpCodes.userId,
        where: sql`${otpCodes.purpose} = 'login' AND ${otpCodes.consumedAt} IS NULL`,
      })
      .returning({ id: otpCodes.id });

    if (row) {
      return { code, expiresAt, resendAt: new Date(now + otpResendCooldownMs(channel)) };
    }
  }

  throw new ApiError(503, "OTP_CONTENTION", "Could not issue a login code right now. Please try again.");
}

export type VerifyLoginOtpResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getLoginUserByIdentifier>>> }
  | {
      ok: false;
      reason:
        | "USER_NOT_FOUND"
        | "ACCOUNT_INACTIVE"
        | "ACCOUNT_BANNED"
        | "LOCKED_OUT"
        | "NO_CODE"
        | "INVALID_CODE"
        | "CODE_EXPIRED"
        | "TOO_MANY_ATTEMPTS";
      /** Remaining wrong tries on the current code (INVALID_CODE only). */
      attemptsLeft?: number;
      /** Milliseconds until the block lifts (LOCKED_OUT / user-level only). */
      retryAfterMs?: number;
    };

/** The user's latest active login code row, if any. */
async function findActiveLoginCode(userId: string) {
  const rows = await db
    .select()
    .from(otpCodes)
    .where(
      and(eq(otpCodes.userId, userId), eq(otpCodes.purpose, "login"), isNull(otpCodes.consumedAt)),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Verifies a login code and, on success, resets the user's lockout state and
 * marks the verified identifier (phone or email) confirmed. Session creation
 * is left to the caller.
 */
export async function verifyLoginOtp(
  identifier: LoginIdentifier,
  code: string,
): Promise<VerifyLoginOtpResult> {
  const user = await getLoginUserByIdentifier(identifier);
  if (!user) return { ok: false, reason: "USER_NOT_FOUND" };
  if (!user.isActive) return { ok: false, reason: "ACCOUNT_INACTIVE" };
  if (user.isBanned) return { ok: false, reason: "ACCOUNT_BANNED" };
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    return {
      ok: false,
      reason: "LOCKED_OUT",
      retryAfterMs: user.lockedUntil.getTime() - Date.now(),
    };
  }

  const codeRow = await findActiveLoginCode(user.id);
  if (!codeRow) return { ok: false, reason: "NO_CODE" };
  if (codeRow.expiresAt.getTime() <= Date.now()) {
    await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, codeRow.id));
    return { ok: false, reason: "CODE_EXPIRED" };
  }

  const valid = safeEqual(hashOtpCode(code), codeRow.codeHash);
  if (!valid) {
    // Atomic increments: concurrent wrong guesses must not lose updates.
    const [codeOut] = await db
      .update(otpCodes)
      .set({ attempts: sql`${otpCodes.attempts} + 1` })
      .where(eq(otpCodes.id, codeRow.id))
      .returning({ attempts: otpCodes.attempts });

    const [userOut] = await db
      .update(users)
      .set({ failedLoginAttempts: sql`${users.failedLoginAttempts} + 1` })
      .where(eq(users.id, user.id))
      .returning({ failedLoginAttempts: users.failedLoginAttempts });

    const codeAttempts = codeOut?.attempts ?? codeRow.attempts + 1;
    const userAttempts = userOut?.failedLoginAttempts ?? user.failedLoginAttempts + 1;
    const consumedAt = codeAttempts >= OTP_MAX_VERIFY_ATTEMPTS ? new Date() : null;
    const lockedUntil =
      userAttempts >= MAX_FAILED_LOGIN_ATTEMPTS
        ? new Date(Date.now() + LOGIN_LOCKOUT_MS)
        : user.lockedUntil;

    await db
      .update(otpCodes)
      .set({ ...(consumedAt ? { consumedAt } : {}) })
      .where(eq(otpCodes.id, codeRow.id));
    await db.update(users).set({ lockedUntil }).where(eq(users.id, user.id));

    if (userAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      return { ok: false, reason: "LOCKED_OUT", retryAfterMs: LOGIN_LOCKOUT_MS };
    }
    if (codeAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      return { ok: false, reason: "TOO_MANY_ATTEMPTS", attemptsLeft: 0 };
    }
    return {
      ok: false,
      reason: "INVALID_CODE",
      attemptsLeft: OTP_MAX_VERIFY_ATTEMPTS - codeAttempts,
    };
  }

  await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, codeRow.id));
  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      phoneVerifiedAt:
        identifier.phone !== undefined
          ? user.phoneVerifiedAt ?? new Date()
          : user.phoneVerifiedAt,
      emailVerifiedAt:
        identifier.email !== undefined
          ? user.emailVerifiedAt ?? new Date()
          : user.emailVerifiedAt,
    })
    .where(eq(users.id, user.id));

  return { ok: true, user };
}

export type ResendLoginOtpResult =
  | { ok: true; channel: OtpChannel } & IssuedOtp
  | { ok: false; reason: "RESEND_COOLDOWN" | "RESEND_LIMIT"; retryAfterMs?: number };

/**
 * Re-issues the code on the user's existing code row (a resend invalidates the
 * previous code by replacing its hash). When no active row exists the caller
 * falls back to a fresh issue.
 */
export async function resendLoginOtp(
  userId: string,
  channel: OtpChannel,
): Promise<ResendLoginOtpResult> {
  const codeRow = await findActiveLoginCode(userId);
  if (!codeRow) return { ok: false, reason: "RESEND_LIMIT", retryAfterMs: 0 };
  if (codeRow.lastSentAt.getTime() + otpResendCooldownMs(channel) > Date.now()) {
    return {
      ok: false,
      reason: "RESEND_COOLDOWN",
      retryAfterMs: codeRow.lastSentAt.getTime() + otpResendCooldownMs(channel) - Date.now(),
    };
  }
  if (codeRow.resends >= OTP_MAX_RESENDS) {
    return { ok: false, reason: "RESEND_LIMIT", retryAfterMs: 0 };
  }

  const code = generateOtpCode();
  const now = Date.now();
  const expiresAt = new Date(now + otpTtlMs(channel));

  await db
    .update(otpCodes)
    .set({
      codeHash: hashOtpCode(code),
      attempts: 0,
      resends: codeRow.resends + 1,
      expiresAt,
      lastSentAt: new Date(now),
    })
    .where(eq(otpCodes.id, codeRow.id));

  return {
    ok: true,
    code,
    expiresAt,
    resendAt: new Date(now + otpResendCooldownMs(channel)),
    channel: (codeRow.channel) ?? channel,
  };
}

/** Deletes the user's latest active login code (used when delivery failed). */
export async function invalidateLatestLoginOtp(userId: string): Promise<void> {
  const codeRow = await findActiveLoginCode(userId);
  if (!codeRow) return;
  await db.delete(otpCodes).where(eq(otpCodes.id, codeRow.id));
}
