import { after, NextResponse } from "next/server";

import { notifyNewReservation } from "@/lib/notifications/booking-notifier";
import { verifyPaymentTransaction } from "@/lib/payment/transaction-service";
import { localizedHref } from "@/lib/site";

export const runtime = "nodejs";

const PUBLIC_SITE_ORIGIN = "https://nafasbeautyclinic.ir";

// ZarinPal redirects as GET ?Authority=...&Status=OK
// Tabapay redirects as GET ?token=...&status=success&amount=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authority =
    searchParams.get("Authority") ??
    searchParams.get("authority") ??
    searchParams.get("token");
  if (!authority) {
    return NextResponse.redirect(
      new URL("/payment/failed?reason=missing_authority", PUBLIC_SITE_ORIGIN)
    );
  }
  // Query status strings differ across providers and can be stale or oddly cased.
  // Never mark a payment failed from redirect parameters alone: the provider's
  // server-to-server verification response is the authoritative payment result.
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
    return NextResponse.redirect(
      new URL(`${path}?authority=${encodeURIComponent(authority)}`, PUBLIC_SITE_ORIGIN)
    );
  } catch {
    return NextResponse.redirect(
      new URL(`/payment/failed?authority=${encodeURIComponent(authority)}`, PUBLIC_SITE_ORIGIN)
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
