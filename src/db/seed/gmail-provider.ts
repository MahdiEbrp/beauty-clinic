import { and, eq, isNull, ne } from "drizzle-orm";

import { getEmailProviderOption } from "@/data/email-providers";
import { decryptSecret, encryptSecret } from "@/lib/auth/encryption";
import { db } from "../index";
import { emailProviders } from "../schema";

const GMAIL = getEmailProviderOption("gmail");

/**
 * Env-driven default email provider (Gmail SMTP). When SEED_GMAIL_USERNAME and
 * SEED_GMAIL_PASSWORD are set, this ensures a "gmail" provider row exists with
 * those credentials and is the single active default sender, replacing whatever
 * the admin previously chose. Skipped when the env vars are absent so fresh
 * installs keep working offline through the seeded fake sender.
 */
export async function seedGmailProviderFromEnv(): Promise<void> {
  const username = process.env.SEED_GMAIL_USERNAME?.trim().toLowerCase() ?? "";
  const password = process.env.SEED_GMAIL_PASSWORD?.trim() ?? "";
  if (!username || !password) {
    console.log(
      "SEED_GMAIL_USERNAME / SEED_GMAIL_PASSWORD not set — keeping the current default email provider.",
    );
    return;
  }

  const candidates = await db
    .select()
    .from(emailProviders)
    .where(and(eq(emailProviders.kind, GMAIL.kind), isNull(emailProviders.deletedAt)));
  const existing = candidates.find((row) => decryptSecret(row.usernameEncrypted) === username);

  await db.transaction(async (tx) => {
    const demoteOtherDefaults = (keepId: string | null): Promise<void> => {
      const conditions = [
        eq(emailProviders.isDefault, true),
        isNull(emailProviders.deletedAt),
      ];
      if (keepId) conditions.push(ne(emailProviders.id, keepId));
      return tx
        .update(emailProviders)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(...conditions))
        .then(() => undefined);
    };

    const secrets = {
      hostEncrypted: encryptSecret(GMAIL.defaultHost),
      portEncrypted: encryptSecret(String(GMAIL.defaultPort)),
      usernameEncrypted: encryptSecret(username),
      passwordEncrypted: encryptSecret(password),
      passwordLast4: password.slice(-4),
    };

    if (existing) {
      await demoteOtherDefaults(existing.id);
      await tx
        .update(emailProviders)
        .set({
          name: providerName(username),
          ...secrets,
          encryption: GMAIL.defaultEncryption,
          fromEmail: username,
          fromName: fromNameEnv(),
          isActive: true,
          isDefault: true,
          updatedAt: new Date(),
        })
        .where(and(eq(emailProviders.id, existing.id), isNull(emailProviders.deletedAt)));
    } else {
      await demoteOtherDefaults(null);
      await tx.insert(emailProviders).values({
        name: providerName(username),
        kind: GMAIL.kind,
        ...secrets,
        encryption: GMAIL.defaultEncryption,
        fromEmail: username,
        fromName: fromNameEnv(),
        isActive: true,
        isDefault: true,
        healthStatus: "unknown",
      });
    }
  });

  console.log(`Gmail provider (${username}) seeded as the default email sender.`);
}

function providerName(username: string): string {
  return `Gmail — ${username}`;
}

function fromNameEnv(): string | null {
  const value = process.env.SEED_GMAIL_FROM_NAME?.trim();
  return value ? value : null;
}
