import { and, eq, isNull, ne } from "drizzle-orm";

import { getEmailProviderOption } from "@/data/email-providers";
import { decryptSecret, encryptSecret } from "@/lib/auth/encryption";
import { db } from "../index";
import { emailProviders } from "../schema";

const LIARA = getEmailProviderOption("liara");

/**
 * Env-driven default email provider (Liara transactional mail service). When
 * MAIL_SERVICE_URL, MAIL_SERVER_ID and API_LIARA_TOKEN are set, this ensures a
 * "liara" provider row exists with those credentials and is the single active
 * default sender, replacing whatever the admin previously chose. Skipped when
 * the env vars are absent so fresh installs keep working through the seeded
 * fake sender.
 *
 * The Liara provider repurposes the SMTP-shaped columns: `host` holds the base
 * service URL, `username` holds the mail server id and `password` holds the API
 * token (see lib/email/providers/liara.ts).
 */
export async function seedLiaraProviderFromEnv(): Promise<void> {
  const serviceUrl = process.env.MAIL_SERVICE_URL?.trim();
  const serverId = process.env.MAIL_SERVER_ID?.trim() ?? "";
  const token = process.env.API_LIARA_TOKEN?.trim() ?? "";
  if (!serviceUrl || !serverId || !token) {
    console.log(
      "MAIL_SERVICE_URL / MAIL_SERVER_ID / API_LIARA_TOKEN not set — keeping the current default email provider.",
    );
    return;
  }

  const candidates = await db
    .select()
    .from(emailProviders)
    .where(and(eq(emailProviders.kind, LIARA.kind), isNull(emailProviders.deletedAt)));
  const existing =
    candidates.find((row) => decryptSecret(row.usernameEncrypted) === serverId) ?? null;

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
      hostEncrypted: encryptSecret(serviceUrl),
      portEncrypted: encryptSecret(String(LIARA.defaultPort)),
      usernameEncrypted: encryptSecret(serverId),
      passwordEncrypted: encryptSecret(token),
      passwordLast4: token.slice(-4),
    };

    if (existing) {
      await demoteOtherDefaults(existing.id);
      await tx
        .update(emailProviders)
        .set({
          name: providerName(),
          ...secrets,
          encryption: LIARA.defaultEncryption,
          fromEmail: fromEmailEnv(),
          fromName: fromNameEnv(),
          isActive: true,
          isDefault: true,
          updatedAt: new Date(),
        })
        .where(and(eq(emailProviders.id, existing.id), isNull(emailProviders.deletedAt)));
    } else {
      await demoteOtherDefaults(null);
      await tx.insert(emailProviders).values({
        name: providerName(),
        kind: LIARA.kind,
        ...secrets,
        encryption: LIARA.defaultEncryption,
        fromEmail: fromEmailEnv(),
        fromName: fromNameEnv(),
        isActive: true,
        isDefault: true,
        healthStatus: "unknown",
      });
    }
  });

  console.log(`Liara email provider (${serverId}) seeded as the default email sender.`);
}

function providerName(): string {
  const from = fromEmailEnv();
  return from ? `Liara — ${from}` : "Liara";
}

function fromEmailEnv(): string | null {
  const value = process.env.MAIL_FROM?.trim();
  return value ? value : null;
}

function fromNameEnv(): string | null {
  const value = process.env.MAIL_FROM_NAME?.trim();
  return value ? value : null;
}
