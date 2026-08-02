import { jsonError, jsonOk, withApiHandler } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/dal";

export const runtime = "nodejs";

export const GET = withApiHandler(async () => {
  const session = await getSession();

  if (!session) {
    return jsonError("UNAUTHORIZED", "Not authenticated.", 401);
  }

  return jsonOk({ user: session.user });
});
