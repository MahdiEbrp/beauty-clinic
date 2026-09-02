import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/src/db";
import { otpCodes, users } from "@/src/db/schema";
import type { OtpChannel } from "@/src/db/schema";

export const OTP_CODE_LENGTH = 6;
/** A code stops verifying 2 minutes after it was issued. */
export const OTP_TTL_MS = 2 * 60 * 1000;
/** The client may ask for a new code every 60 seconds. */
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
/** Wrong codes per code row; the row is consumed when exhausted. */
export const OTP_MAX_VERIFY_ATTEMPTS = 5;
/** Resends per code row before a fresh issue is required. */
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
 * The plaintext code is returned once — only its hash is stored.
 */
export async function issueLoginOtp(
  userId: string,
  channel: OtpChannel,
): Promise<IssuedOtp> {
  await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.purpose, "login"),
        isNull(otpCodes.consumedAt),
      ),
    );

  const code = generateOtpCode();
  const now = Date.now();
  const expiresAt = new Date(now + OTP_TTL_MS);

  await db.insert(otpCodes).values({
    userId,
    purpose: "login",
    channel,
    codeHash: hashOtpCode(code),
    expiresAt,
    lastSentAt: new Date(now),
  });

  return { code, expiresAt, resendAt: new Date(now + OTP_RESEND_COOLDOWN_MS) };
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
      and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.purpose, "login"),
        isNull(otpCodes.consumedAt),
      ),
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
    await db
      .update(otpCodes)
      .set({ consumedAt: new Date() })
      .where(eq(otpCodes.id, codeRow.id));
    return { ok: false, reason: "CODE_EXPIRED" };
  }

  const valid = safeEqual(hashOtpCode(code), codeRow.codeHash);
  if (!valid) {
    const codeAttempts = codeRow.attempts + 1;
    const userAttempts = user.failedLoginAttempts + 1;
    const consumedAt =
      codeAttempts >= OTP_MAX_VERIFY_ATTEMPTS ? new Date() : null;
    const lockedUntil =
      userAttempts >= MAX_FAILED_LOGIN_ATTEMPTS
        ? new Date(Date.now() + LOGIN_LOCKOUT_MS)
        : user.lockedUntil;

    await db
      .update(otpCodes)
      .set({ attempts: codeAttempts, ...(consumedAt ? { consumedAt } : {}) })
      .where(eq(otpCodes.id, codeRow.id));
    await db
      .update(users)
      .set({ failedLoginAttempts: userAttempts, lockedUntil })
      .where(eq(users.id, user.id));

    // User-level lockout wins over code exhaustion when both happen together.
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

  await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(eq(otpCodes.id, codeRow.id));
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
  if (codeRow.lastSentAt.getTime() + OTP_RESEND_COOLDOWN_MS > Date.now()) {
    return {
      ok: false,
      reason: "RESEND_COOLDOWN",
      retryAfterMs: codeRow.lastSentAt.getTime() + OTP_RESEND_COOLDOWN_MS - Date.now(),
    };
  }
  if (codeRow.resends >= OTP_MAX_RESENDS) {
    return { ok: false, reason: "RESEND_LIMIT", retryAfterMs: 0 };
  }

  const code = generateOtpCode();
  const now = Date.now();
  const expiresAt = new Date(now + OTP_TTL_MS);

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
    resendAt: new Date(now + OTP_RESEND_COOLDOWN_MS),
    channel: (codeRow.channel) ?? channel,
  };
}

/** Deletes the user's latest active login code (used when delivery failed). */
export async function invalidateLatestLoginOtp(userId: string): Promise<void> {
  const codeRow = await findActiveLoginCode(userId);
  if (!codeRow) return;
  await db.delete(otpCodes).where(eq(otpCodes.id, codeRow.id));
}
