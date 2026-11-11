import { after, NextResponse } from "next/server";

import { notifyNewReservation } from "@/lib/notifications/booking-notifier";
import { markPaymentFailed } from "@/lib/payment/booking-checkout";
import { verifyPaymentTransaction } from "@/lib/payment/transaction-service";
import { localizedHref } from "@/lib/site";

export const runtime = "nodejs";

// ZarinPal redirects as GET ?Authority=...&Status=OK
// Tabapay redirects as GET ?token=...&status=success&amount=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authority =
    searchParams.get("Authority") ??
    searchParams.get("authority") ??
    searchParams.get("token");
  const status = searchParams.get("Status") ?? searchParams.get("status");
  if (!authority) return NextResponse.redirect(new URL("/payment/failed?reason=missing_authority", request.url));
  // Gateway status parameters are inconsistently cased across providers.
  // Normalize before classifying a decline so "SUCCESS"/"Ok" is not mistaken
  // for a failed payment and the verified callback path remains authoritative.
  const normalizedStatus = status?.trim().toLowerCase();
  const successStatuses = new Set(["ok", "success", "1"]);
  if (normalizedStatus && !successStatuses.has(normalizedStatus)) {
    const failed = await markPaymentFailed(authority, "Payment was cancelled or declined by the provider.");
    const path = localizedHref(failed?.locale ?? "fa", "/payment/failed");
    return NextResponse.redirect(new URL(`${path}?authority=${encodeURIComponent(authority)}`, request.url));
  }
  try {
    const res = await verifyPaymentTransaction(authority);
    if (res.verified && res.newlyVerified) {
      // Runs after the redirect response has been sent — serverless-safe
      // background work. The notifier swallows provider errors, so delivery
      // problems never change the payment result the user is redirected to.
      after(async () => {
        await notifyNewReservation({ groupRef: res.bookingGroupRef, locale: res.locale });
      });
    }
    const path = localizedHref(res.locale, res.verified ? "/payment/success" : "/payment/failed");
    return NextResponse.redirect(new URL(`${path}?authority=${encodeURIComponent(authority)}`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`/payment/failed?authority=${encodeURIComponent(authority)}`, request.url));
  }
}

export async function POST(request: Request) {
  return GET(request);
}
