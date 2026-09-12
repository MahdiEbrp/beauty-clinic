import { jsonOk, withSecurity } from "@/lib/api/security";
import { expireBookingCheckouts } from "@/lib/payment/booking-checkout";

export const runtime = "nodejs";

export const POST = withSecurity(
  { auth: "public", csrf: false, cron: true, audit: true },
  async () => jsonOk(await expireBookingCheckouts()),
);
