import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/src/db";
import { roles, userRoles, users } from "@/src/db/schema";
import { verifyPassword, hashPassword } from "./password";
import { createSession } from "./session";
import type { SignupInput } from "@/lib/validation/user";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

export type LoginMeta = {
  userAgent?: string;
  ip?: string;
};

/**
 * Verifies credentials and, on success, creates a session and sets the cookie.
 * Returns `true` only on success. All failure paths return `false` so callers
 * never leak whether the account exists, is disabled, banned, or locked out.
 */
export async function loginUser(
  email: string,
  password: string,
  meta?: LoginMeta,
): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.deletedAt)),
  });

  if (!user || !user.isActive || user.isBanned) return false;
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) return false;

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= MAX_FAILED_LOGIN_ATTEMPTS
        ? new Date(Date.now() + LOGIN_LOCKOUT_MS)
        : user.lockedUntil;
    await db
      .update(users)
      .set({ failedLoginAttempts: attempts, lockedUntil })
      .where(eq(users.id, user.id));
    return false;
  }

  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  await createSession(user.id, meta?.userAgent, meta?.ip);
  return true;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export type RegisterResult =
  | { ok: true }
  | { ok: false; reason: "EMAIL_TAKEN" };

/**
 * Creates a customer account and signs the new user in (sets the session
 * cookie). Returns `EMAIL_TAKEN` when the email is already in use; any other
 * failure propagates to the caller.
 */
export async function registerUser(
  input: SignupInput,
  meta?: LoginMeta,
): Promise<RegisterResult> {
  const passwordHash = await hashPassword(input.password);

  try {
    const userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          phone: input.phone,
          fullName: input.fullName,
          passwordHash,
        })
        .returning({ id: users.id });

      if (!user) throw new Error("Failed to create user");

      const role = await tx.query.roles.findFirst({
        where: eq(roles.key, "customer"),
        columns: { id: true },
      });

      if (role) {
        await tx.insert(userRoles).values({ userId: user.id, roleId: role.id });
      }

      return user.id;
    });

    await createSession(userId, meta?.userAgent, meta?.ip);
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, reason: "EMAIL_TAKEN" };
    }
    throw error;
  }
}
