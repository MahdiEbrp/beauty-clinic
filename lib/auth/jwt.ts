import { jwtVerify, SignJWT } from "jose";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "session";

const ALG = "HS256";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const encodedKey = new TextEncoder().encode(env.AUTH_SECRET);

export type SessionClaims = {
  sessionId: string;
  userId: string;
  tokenHash: string;
};

export async function encryptSession(claims: SessionClaims): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptSession(
  token: string | undefined,
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: [ALG] });
    if (
      typeof payload.sessionId !== "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.tokenHash !== "string"
    ) {
      return null;
    }
    return {
      sessionId: payload.sessionId,
      userId: payload.userId,
      tokenHash: payload.tokenHash,
    };
  } catch {
    return null;
  }
}

export function sessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_TTL_MS);
}
