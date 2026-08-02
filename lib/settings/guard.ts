import { jsonError } from "@/lib/api/errors";
import { hasPermission } from "@/lib/auth/rbac";
import type { AuthSession } from "@/lib/auth/dal";
import type { NextResponse } from "next/server";

export type GuardResult =
  | { status: "ok"; targetUserId: string; isAdmin: boolean }
  | { status: "error"; response: NextResponse };

export function resolveTarget(
  session: AuthSession,
  requestedUserId?: string,
): GuardResult {
  const isAdmin = hasPermission(session.user.permissions, "settings.manage");

  if (requestedUserId && !isAdmin && requestedUserId !== session.user.id) {
    return {
      status: "error",
      response: jsonError("FORBIDDEN", "Cannot manage another user's settings.", 403),
    };
  }

  const targetUserId = isAdmin && requestedUserId ? requestedUserId : session.user.id;

  return { status: "ok", targetUserId, isAdmin };
}
