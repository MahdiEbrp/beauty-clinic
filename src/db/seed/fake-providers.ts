import { and, eq, isNull } from "drizzle-orm";

import { encryptSecret } from "@/lib/auth/encryption";
import { db } from "../index";
import { emailProviders, paymentProviders, paymentTransactions, smsProviders } from "../schema";

/**
 * Ensure built-in "fake" providers exist and are the active/default ("current")
 * sender for both SMS, email and payment whenever no real provider is configured
 * yet. Fake providers never send externally — every send is logged to the
 * console — so this makes the whole pipeline work out-of-the-box for local
 * testing.
 */
export async function seedFakeProviders(): Promise<void> {
  await seedFakeSmsProvider();
  await seedFakeEmailProvider();
  await seedFakePaymentProvider();
}

async function seedFakeSmsProvider(): Promise<void> {
  const [existing] = await db
    .select({ id: smsProviders.id })
    .from(smsProviders)
    .where(
      and(
        eq(smsProviders.kind, "fake"),
        isNull(smsProviders.deletedAt),
      ),
    )
    .limit(1);
  if (existing) return;

  const secrets = {
    apiUrlEncrypted: encryptSecret("https://fake.local"),
    tokenEncrypted: encryptSecret("fake-sms-token"),
    settingsEncrypted: encryptSecret(
      JSON.stringify({ authScheme: "none", payloadMode: "bulk" }),
    ),
    tokenLast4: "oken",
  };

  // Clear any outstanding default so the fake sender becomes the current one.
  await db
    .update(smsProviders)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(smsProviders.isDefault, true), isNull(smsProviders.deletedAt)));

  await db.insert(smsProviders).values({
    name: "Fake SMS Sender",
    kind: "fake",
    ...secrets,
    sender: null,
    isActive: true,
    isDefault: true,
    healthStatus: "healthy",
  });

  console.log("Fake SMS provider seeded as default.");
}

async function seedFakeEmailProvider(): Promise<void> {
  const [existing] = await db
    .select({ id: emailProviders.id })
    .from(emailProviders)
    .where(
      and(
        eq(emailProviders.kind, "fake"),
        isNull(emailProviders.deletedAt),
      ),
    )
    .limit(1);
  if (existing) return;

  const secrets = {
    hostEncrypted: encryptSecret("smtp.fake.local"),
    portEncrypted: encryptSecret("465"),
    usernameEncrypted: encryptSecret("fake-sender@fake.local"),
    passwordEncrypted: encryptSecret("fake-password"),
    passwordLast4: "word",
  };

  await db
    .update(emailProviders)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(emailProviders.isDefault, true), isNull(emailProviders.deletedAt)));

  await db.insert(emailProviders).values({
    name: "Fake Email Sender",
    kind: "fake",
    ...secrets,
    encryption: "none",
    fromEmail: null,
    fromName: null,
    isActive: true,
    isDefault: true,
    healthStatus: "healthy",
  });

  console.log("Fake email provider seeded as default.");
}

export async function seedFakePaymentProvider(): Promise<void> {
  const [existing] = await db
    .select({ id: paymentProviders.id })
    .from(paymentProviders)
    .where(
      and(
        eq(paymentProviders.kind, "fake"),
        isNull(paymentProviders.deletedAt),
      ),
    )
    .limit(1);
  if (existing) return;

  const secrets = {
    merchantIdEncrypted: encryptSecret("fake-payment-merchant"),
    apiUrlEncrypted: encryptSecret("https://fake.local"),
    settingsEncrypted: encryptSecret(JSON.stringify({ sandbox: true })),
    merchantLast4: "hant",
  };

  await db
    .update(paymentProviders)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(paymentProviders.isDefault, true), isNull(paymentProviders.deletedAt)));

  const [provider] = await db
    .insert(paymentProviders)
    .values({
      name: "Fake Payment Provider",
      kind: "fake",
      ...secrets,
      callbackUrl: null,
      isActive: true,
      isDefault: true,
      healthStatus: "healthy",
      lastHealthCheckedAt: new Date(),
    })
    .returning({ id: paymentProviders.id });

  if (!provider) {
    console.warn("Failed to seed fake payment provider.");
    return;
  }

  await seedFakePaymentTransactions(provider.id);
  console.log("Fake payment provider seeded as default.");
}

async function seedFakePaymentTransactions(providerId: string): Promise<void> {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const rows = [
    {
      providerId,
      bookingGroupRef: "BK-10412",
      amount: "100000",
      currency: "تومان",
      description: "بيعانه نوبت - بوتاكس پيشاني",
      authority: "FAKE-TX-00A1",
      refId: "FAKE-REF-00A1",
      cardPan: "603799******1234",
      status: "verified",
      verifiedAt: new Date(now - 3 * day),
      createdAt: new Date(now - 3 * day),
      completedAt: new Date(now - 3 * day),
    },
    {
      providerId,
      bookingGroupRef: "BK-10405",
      amount: "100000",
      currency: "تومان",
      description: "بيعانه نوبت - فیلر لب",
      authority: "FAKE-TX-00A2",
      refId: null,
      cardPan: null,
      status: "refunded",
      verifiedAt: new Date(now - 6 * day),
      createdAt: new Date(now - 6 * day),
      completedAt: new Date(now - 5 * day),
    },
    {
      providerId,
      bookingGroupRef: "BK-10430",
      amount: "250000",
      currency: "تومان",
      description: "پرداخت قسطی - پکیج پاکسازی پوست",
      authority: "FAKE-TX-00A3",
      refId: "FAKE-REF-00A3",
      cardPan: "621986******5678",
      status: "verified",
      verifiedAt: new Date(now - 1 * day),
      createdAt: new Date(now - 1 * day),
      completedAt: new Date(now - 1 * day),
    },
    {
      providerId,
      bookingGroupRef: "BK-10441",
      amount: "50000",
      currency: "تومان",
      description: "بيعانه نوبت - مزوتراپی",
      authority: "FAKE-TX-00A4",
      refId: null,
      cardPan: null,
      status: "failed",
      errorCode: "PAYMENT_FAILED",
      errorMessage: "کاربر از پرداخت انصراف داد (شبیه‌سازی)",
      createdAt: new Date(now - 4 * day),
      completedAt: new Date(now - 4 * day),
      verifiedAt: null,
    },
    {
      providerId,
      bookingGroupRef: "BK-10452",
      amount: "100000",
      currency: "تومان",
      description: "بيعانه نوبت - لیزر موهای زائد",
      authority: "FAKE-TX-00A5",
      refId: null,
      cardPan: null,
      status: "requested",
      createdAt: new Date(now - 2 * day),
      verifiedAt: null,
      completedAt: null,
    },
    {
      providerId,
      bookingGroupRef: "BK-10458",
      amount: "100000",
      currency: "تومان",
      description: "بيعانه نوبت - میکرونیدلینگ",
      authority: "FAKE-TX-00A6",
      refId: null,
      cardPan: null,
      status: "pending",
      createdAt: new Date(now - 6 * 60 * 60 * 1000),
      verifiedAt: null,
      completedAt: null,
    },
    {
      providerId,
      bookingGroupRef: "BK-10462",
      amount: "320000",
      currency: "تومان",
      description: "تسویه فاکتور - نانوفولیکولر ابرو",
      authority: "FAKE-TX-00A7",
      refId: "FAKE-REF-00A7",
      cardPan: "502229******9012",
      status: "verified",
      verifiedAt: new Date(now - 8 * day),
      createdAt: new Date(now - 8 * day),
      completedAt: new Date(now - 8 * day),
    },
    {
      providerId,
      bookingGroupRef: "BK-10470",
      amount: "150000",
      currency: "تومان",
      description: "بيعانه نوبت - هیدرودرمی",
      authority: "FAKE-TX-00A8",
      refId: null,
      cardPan: null,
      status: "cancelled",
      errorCode: "CANCELED_BY_USER",
      createdAt: new Date(now - 9 * day),
      verifiedAt: null,
      completedAt: new Date(now - 9 * day),
    },
  ] as const;

  await db.insert(paymentTransactions).values(
    rows.map((row) => ({
      ...row,
      createdAt: row.createdAt,
      updatedAt: new Date(),
    })),
  );
  console.log(`Seeded ${rows.length} fake payment transactions.`);
}
