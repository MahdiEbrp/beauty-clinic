import { NextResponse } from "next/server";

import { verifyPaymentTransaction } from "@/lib/payment/transaction-service";

export const runtime = "nodejs";

// ZarinPal redirects as GET ?Authority=...&Status=OK
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authority = searchParams.get("Authority") ?? searchParams.get("authority");
  const status = searchParams.get("Status") ?? searchParams.get("status");
  if (!authority) return NextResponse.redirect(new URL("/payment/failed?reason=missing_authority", request.url));
  if (status && status !== "OK") {
    return NextResponse.redirect(new URL(`/payment/failed?authority=${encodeURIComponent(authority)}&status=${encodeURIComponent(status)}`, request.url));
  }
  try {
    const res = await verifyPaymentTransaction(authority);
    if (res.verified) return NextResponse.redirect(new URL(`/payment/success?authority=${encodeURIComponent(authority)}&refId=${encodeURIComponent(res.refId ?? "")}`, request.url));
    return NextResponse.redirect(new URL(`/payment/failed?authority=${encodeURIComponent(authority)}`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`/payment/failed?authority=${encodeURIComponent(authority)}`, request.url));
  }
}

export async function POST(request: Request) {
  return GET(request);
}
