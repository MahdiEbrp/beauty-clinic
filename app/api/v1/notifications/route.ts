import { jsonOk, withSecurity } from "@/lib/api/security";
import { listRecentNotifications } from "@/lib/notifications/service";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
  },
  async () => {
    const result = await listRecentNotifications(5);
    return jsonOk(result);
  },
);
