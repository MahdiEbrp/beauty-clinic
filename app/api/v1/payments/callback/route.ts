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
  if (status && status !== "OK" && status !== "success") {
    const failed = await markPaymentFailed(authority, "Payment was cancelled or declined by the provider.");
    const path = localizedHref(failed?.locale ?? "fa", "/payment/failed");
    return NextResponse.redirect(new URL(`${path}?authority=${encodeURIComponent(authority)}`, request.url));
  }
  try {
    const res = await verifyPaymentTransaction(authority);
    if (res.verified && !res.late && res.newlyVerified) {
      // Runs after the redirect response has been sent — serverless-safe
      // background work. The notifier swallows provider errors, so delivery
      // problems never change the payment result the user is redirected to.
      after(async () => {
        await notifyNewReservation({ groupRef: res.bookingGroupRef, locale: res.locale });
      });
    }
    const path = localizedHref(res.locale, res.verified && !res.late ? "/payment/success" : "/payment/failed");
    return NextResponse.redirect(new URL(`${path}?authority=${encodeURIComponent(authority)}`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`/payment/failed?authority=${encodeURIComponent(authority)}`, request.url));
  }
}

export async function POST(request: Request) {
  return GET(request);
}
