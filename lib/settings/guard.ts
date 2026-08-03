import { jsonError } from "@/lib/api/errors";
import { hasPermission } from "@/lib/auth/rbac";
import type { AuthSession } from "@/lib/auth/dal";
import type { NextResponse } from "next/server";

export type Scope = "user" | "system";

export type GuardResult =
  | { status: "ok"; targetUserId: string | null; scope: Scope; isAdmin: boolean }
  | { status: "error"; response: NextResponse };

export function resolveTarget(
  session: AuthSession,
  scope?: string,
  requestedUserId?: string,
): GuardResult {
  const isAdmin = hasPermission(session.user.permissions, "settings.manage");
  const resolvedScope = (scope ?? "user") as Scope;

  if (resolvedScope === "system") {
    if (!isAdmin) {
      return {
        status: "error",
        response: jsonError("FORBIDDEN", "Only admins can manage system settings.", 403),
      };
    }
    return { status: "ok", targetUserId: null, scope: "system", isAdmin: true };
  }

  if (requestedUserId && !isAdmin && requestedUserId !== session.user.id) {
    return {
      status: "error",
      response: jsonError("FORBIDDEN", "Cannot manage another user's settings.", 403),
    };
  }

  const targetUserId = isAdmin && requestedUserId ? requestedUserId : session.user.id;

  return { status: "ok", targetUserId, scope: "user", isAdmin };
}
