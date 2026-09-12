import { eq } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { PAYMENT_ERROR_CODES, PAYMENT_ERROR_MESSAGES } from "@/lib/payment/constants";
import { createPaymentProviderAdapter } from "@/lib/payment/providers";
import { db } from "@/src/db";
import { paymentProviderChecks, paymentProviders } from "@/src/db/schema";

import { getPaymentProviderRow } from "./provider-service";

export async function testPaymentProvider(providerId: string, checkedBy: string | null): Promise<{ isSuccessful: boolean; responseTimeMs: number; error?: string }> {
  const row = await getPaymentProviderRow(providerId);
  if (!row) throw new ApiError(404, PAYMENT_ERROR_CODES.providerNotFound, PAYMENT_ERROR_MESSAGES.providerNotFound);
  const { decryptPaymentProviderSecret } = await import("@/lib/payment/crypto");
  const config = decryptPaymentProviderSecret(row);
  const adapter = createPaymentProviderAdapter({ kind: config.kind, merchantId: config.merchantId, apiUrl: config.apiUrl, callbackUrl: config.callbackUrl, credentials: config.credentials });
  const started = Date.now();
  try {
    // fake verify will succeed instantly; real zarinpal request with 1000 Rial
    await adapter.request({ amount: 1000, description: "Health check", callbackUrl: config.callbackUrl ?? "https://example.com/callback", orderId: `HEALTH-${Date.now()}` });
    const ms = Date.now() - started;
    await recordCheck(providerId, checkedBy, true, ms, 200, null);
    return { isSuccessful: true, responseTimeMs: ms };
  } catch (error) {
    const ms = Date.now() - started;
    const msg = error instanceof Error ? error.message : String(error);
    await recordCheck(providerId, checkedBy, false, ms, 500, msg);
    return { isSuccessful: false, responseTimeMs: ms, error: msg };
  }
}

async function recordCheck(providerId: string, checkedBy: string | null, isSuccessful: boolean, responseTimeMs: number, statusCode: number, errorMessage: string | null) {
  await db.transaction(async (tx) => {
    await tx.insert(paymentProviderChecks).values({ providerId, checkedBy, isSuccessful, responseTimeMs, statusCode, errorCode: isSuccessful ? null : "CHECK_FAILED", errorMessage });
    await tx.update(paymentProviders).set({ healthStatus: isSuccessful ? "healthy" : "unhealthy", lastHealthCheckedAt: new Date(), lastHealthError: isSuccessful ? null : errorMessage, updatedAt: new Date() }).where(eq(paymentProviders.id, providerId));
  });
}
