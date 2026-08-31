import { jsonOk, withSecurity } from "@/lib/api/security";
import { markNotificationsRead } from "@/lib/notifications/service";

export const runtime = "nodejs";

export const PATCH = withSecurity(
  {
    auth: "required",
  },
  async () => {
    await markNotificationsRead();
    return jsonOk({ ok: true });
  },
);
