import { jsonOk, withSecurity } from "@/lib/api/security";
import { getEmailOverview } from "@/lib/email/report-service";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "email.read" },
  async () => jsonOk(await getEmailOverview()),
);