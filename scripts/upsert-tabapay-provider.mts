import { and, eq, isNull } from "drizzle-orm";

import { encryptSecret } from "../lib/auth/encryption";
import { db } from "../src/db/index";
import { paymentProviders } from "../src/db/schema/payment";
import { users } from "../src/db/schema/auth";

/**
 * Idempotently creates/updates a Tabapay payment gateway provider in the
 * `payment_providers` table.
 *
 * The merchant code (sent to Tabapay as `Authorization: Bearer <merchant>`) is
 * stored encrypted, exactly like every other provider credential in this codebase.
 *
 * Merchant code: 123 (per request)
 * Environment: sandbox (credentials.sandbox = true)
 * Default: false — the existing fake/default provider is left untouched so
 * current checkout flows keep working.
 */
const MERCHANT_ID = "123";
const API_URL = "https://api.tabapay.ir";
const PROVIDER_NAME = "تاباپی";
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://nafasbeautyclinic.ir"}/api/v1/payments/callback`;

async function findCreatedByUserId(): Promise<string | null> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(isNull(users.deletedAt))
    .limit(1);
  return row?.id ?? null;
}

async function upsert() {
  const createdBy = await findCreatedByUserId();

  const secrets = {
    merchantIdEncrypted: encryptSecret(MERCHANT_ID),
    apiUrlEncrypted: encryptSecret(API_URL),
    settingsEncrypted: encryptSecret(JSON.stringify({ sandbox: true })),
    merchantLast4: MERCHANT_ID.slice(-4),
  };

  const [existing] = await db
    .select({ id: paymentProviders.id })
    .from(paymentProviders)
    .where(
      and(
        eq(paymentProviders.kind, "tabapay"),
        isNull(paymentProviders.deletedAt),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(paymentProviders)
      .set({
        ...secrets,
        name: PROVIDER_NAME,
        callbackUrl: CALLBACK_URL,
        isActive: true,
        isDefault: false,
        updatedAt: new Date(),
      })
      .where(eq(paymentProviders.id, existing.id));
    console.log(`Tabapay provider updated: id=${existing.id} merchantId=${MERCHANT_ID}`);
    return;
  }

  const [row] = await db
    .insert(paymentProviders)
    .values({
      name: PROVIDER_NAME,
      kind: "tabapay",
      ...secrets,
      callbackUrl: CALLBACK_URL,
      isActive: true,
      isDefault: false,
      createdBy,
    })
    .returning({ id: paymentProviders.id });
  if (!row) throw new Error("Tabapay provider insert returned no row");
  console.log(`Tabapay provider created: id=${row.id} merchantId=${MERCHANT_ID}`);
}

upsert()
  .then(async () => {
    await db.$client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Tabapay provider upsert failed:", error);
    await db.$client.end().catch(() => undefined);
    process.exit(1);
  });
