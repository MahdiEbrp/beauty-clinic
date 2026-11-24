
import { after, NextResponse } from "next/server";

import { notifyNewReservation } from "@/lib/notifications/booking-notifier";
import { verifyPaymentTransaction } from "@/lib/payment/transaction-service";
import { localizedHref } from "@/lib/site";

export const runtime = "nodejs";

const BASE_URL = "https://nafasbeautyclinic.ir";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const authority =
    searchParams.get("Authority") ??
    searchParams.get("authority") ??
    searchParams.get("token");

  if (!authority) {
    return NextResponse.redirect(
      new URL("/payment/failed?reason=missing_authority", BASE_URL)
    );
  }

  try {
    const res = await verifyPaymentTransaction(authority);

    if (res.verified && res.newlyVerified) {
      after(async () => {
        await notifyNewReservation({
          groupRef: res.bookingGroupRef,
          locale: res.locale,
        });
      });
    }

    const path = localizedHref(
      res.locale,
      res.verified ? "/payment/success" : "/payment/failed"
    );

    return NextResponse.redirect(
      new URL(
        `${path}?authority=${encodeURIComponent(authority)}`,
        BASE_URL
      )
    );
  } catch {
    return NextResponse.redirect(
      new URL(
        `/payment/failed?authority=${encodeURIComponent(authority)}`,
        BASE_URL
      )
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
