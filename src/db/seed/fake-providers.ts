import { and, eq, isNull } from "drizzle-orm";

import { encryptSecret } from "@/lib/auth/encryption";
import { db } from "../index";
import { emailProviders, smsProviders } from "../schema";

/**
 * Ensure built-in "fake" providers exist and are the active/default ("current")
 * sender for both SMS and email whenever no real provider is configured yet.
 * Fake providers never send externally — every send is logged to the console — so
 * this makes the whole send pipeline work out-of-the-box for local testing.
 */
export async function seedFakeProviders(): Promise<void> {
  await seedFakeSmsProvider();
  await seedFakeEmailProvider();
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
