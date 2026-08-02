import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { verifyPassword } from "./password";
import { createSession } from "./session";

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
