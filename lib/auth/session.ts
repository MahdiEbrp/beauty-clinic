import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { cacheDel } from "@/lib/cache";
import { db } from "@/src/db";
import { sessions } from "@/src/db/schema";
import { decryptSession, encryptSession, sessionExpiresAt, SESSION_COOKIE } from "./jwt";

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Cache key for a getSessionCached entry (see lib/auth/dal.ts). */
export function sessionCacheKey(sessionId: string): string {
  return `session:${sessionId}`;
}

export async function createSession(
  userId: string,
  userAgent?: string,
  ip?: string,
): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256Hex(token);
  const expiresAt = sessionExpiresAt();

  // `sessions.ip` is an `inet` column: only real IP addresses are valid, so a
  // non-IP value (e.g. a placeholder like "unknown") becomes NULL instead of
  // surfacing as a wrapped Postgres error.
  const storedIp = ip && isIP(ip) ? ip : undefined;

  const [inserted] = await db
    .insert(sessions)
    .values({ userId, tokenHash, expiresAt, userAgent, ip: storedIp })
    .returning({ id: sessions.id });

  if (!inserted) {
    throw new Error("Failed to create session");
  }

  const jwt = await encryptSession({
    sessionId: inserted.id,
    userId,
    tokenHash,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const claims = await decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (claims) {
    await db.delete(sessions).where(eq(sessions.id, claims.sessionId));
    await cacheDel(sessionCacheKey(claims.sessionId));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function revokeSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  await cacheDel(sessionCacheKey(sessionId));
}

/** Delete all of a user's sessions and drop their cached session entries. */
export async function revokeUserSessions(userId: string): Promise<void> {
  const rows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.userId, userId));
  if (rows.length === 0) return;
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await Promise.all(rows.map((row) => cacheDel(sessionCacheKey(row.id))));
}
