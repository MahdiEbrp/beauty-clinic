import { withSecurity, jsonOk } from "@/lib/api/security";
import { getCatalogSummary } from "@/lib/services/service";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  async () => {
    const summary = await getCatalogSummary();
    return jsonOk(summary);
  },
);
