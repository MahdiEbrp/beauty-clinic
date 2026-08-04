import { and, eq, ne } from "drizzle-orm";

import { withSecurity, jsonOk } from "@/lib/api/security";
import { db } from "@/src/db";
import { sessions } from "@/src/db/schema";
import { revokeSession } from "@/lib/auth/session";

export const runtime = "nodejs";

// Revokes every active session of the current user except the one making the
// request ("sign out of other devices"). Uses the shared revokeSession helper.
export const DELETE = withSecurity({ auth: "required" }, async (_request, ctx) => {
  const userId = ctx.session!.userId;
  const currentSessionId = ctx.session!.sessionId;

  const others = await db.query.sessions.findMany({
    where: and(eq(sessions.userId, userId), ne(sessions.id, currentSessionId)),
    columns: { id: true },
  });

  await Promise.all(others.map((session) => revokeSession(session.id)));

  return jsonOk({ ok: true, revoked: others.length });
});
