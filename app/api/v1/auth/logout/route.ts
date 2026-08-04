import { withSecurity, jsonOk } from "@/lib/api/security";
import { destroySession } from "@/lib/auth/session";

export const runtime = "nodejs";

export const POST = withSecurity({ auth: "public" }, async () => {
  await destroySession();
  return jsonOk({ ok: true });
});
