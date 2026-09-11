import { jsonOk, withSecurity } from "@/lib/api/security";
import { getPaymentOverview } from "@/lib/payment/report-service";

export const runtime = "nodejs";

export const GET = withSecurity({ auth: "required", permissions: "payment.read" }, async () => {
  return jsonOk(await getPaymentOverview());
});
