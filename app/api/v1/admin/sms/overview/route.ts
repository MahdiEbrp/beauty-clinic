import { jsonOk, withSecurity } from "@/lib/api/security";
import { getSmsOverview } from "@/lib/sms/report-service";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "sms.read" },
  async () => jsonOk(await getSmsOverview()),
);
