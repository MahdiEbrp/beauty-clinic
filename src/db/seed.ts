import { and, eq, isNull, sql } from "drizzle-orm";

import { hashPassword } from "@/lib/auth/password";
import { encryptSecret } from "@/lib/auth/encryption";
import { db } from "./index";
import {
  permissions,
  roles,
  rolePermissions,
  settings,
  settingsI18n,
  socialLinks,
  socialLinksI18n,
  userRoles,
  users,
  rules,
  rulesI18n,
  smsProviders,
  emailProviders,
} from "./schema";
import { seedServiceCatalog } from "./seed/service-catalog";
import { seedCareGuides } from "./seed/care-guides";
import { seedLanding } from "./seed/landing";
import { RULES_SEED } from "./seed/rules";
import {
  ROLE_DEFS,
  PERMISSION_DEFS,
  ROLE_PERMISSIONS,
  SYSTEM_SETTINGS,
  SOCIAL_LINKS,
} from "./seed/definitions";

async function seed(): Promise<void> {
  for (const def of ROLE_DEFS) {
    await db.insert(roles).values(def).onConflictDoNothing({ target: roles.key });
  }

  for (const def of PERMISSION_DEFS) {
    await db.insert(permissions).values(def).onConflictDoNothing({ target: permissions.key });
  }

  const roleRows = await db.select().from(roles);
  const permissionRows = await db.select().from(permissions);
  const roleByKey = new Map(roleRows.map((r) => [r.key, r]));
  const permissionByKey = new Map(permissionRows.map((p) => [p.key, p]));

  for (const [roleKey, permissionKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleByKey.get(roleKey);
    if (!role) continue;
    for (const permissionKey of permissionKeys) {
      const permission = permissionByKey.get(permissionKey);
      if (!permission) continue;
      await db
        .insert(rolePermissions)
        .values({ roleId: role.id, permissionId: permission.id })
        .onConflictDoNothing();
    }
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
      columns: { id: true },
    });

    if (!existing) {
      const [admin] = await db
        .insert(users)
        .values({
          email: adminEmail,
          fullName: "Super Admin",
          passwordHash: await hashPassword(adminPassword),
        })
        .returning({ id: users.id });

      const adminRole = roleByKey.get("admin");
      if (admin && adminRole) {
        await db.insert(userRoles).values({ userId: admin.id, roleId: adminRole.id });
      }
      console.log(`Superadmin created: ${adminEmail}`);
    } else {
      console.log(`Superadmin already exists: ${adminEmail}`);
    }
  } else {
    console.warn("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping superadmin creation.");
  }

  for (const def of SYSTEM_SETTINGS) {
    const [row] = await db
      .insert(settings)
      .values({ scope: "system", key: def.key, value: def.value, type: def.type })
      .onConflictDoNothing({
        target: settings.key,
        where: sql`${settings.scope} = 'system'`,
      })
      .returning({ id: settings.id });

    const translations = "translations" in def ? def.translations : undefined;
    if (row && translations) {
      const entries = (
        [
          { locale: "fa", value: translations.fa },
          { locale: "en", value: translations.en },
        ] as const
      )
        .filter((entry) => entry.value !== undefined)
        .map((entry) => ({ settingId: row.id, locale: entry.locale, value: entry.value }));
      if (entries.length > 0) {
        await db
          .insert(settingsI18n)
          .values(entries)
          .onConflictDoNothing({ target: [settingsI18n.settingId, settingsI18n.locale] });
      }
    }
  }

  console.log("System settings seeded.");

  for (const def of SOCIAL_LINKS) {
    // Insert the link (no-op if the url already exists), then resolve its id by
    // url so labels are backfilled even for rows seeded in an earlier run.
    await db
      .insert(socialLinks)
      .values({
        url: def.url,
        imageUrl: def.imageUrl,
        displayOrder: def.displayOrder,
      })
      .onConflictDoNothing({ target: socialLinks.url });

    const [existing] = await db
      .select({ id: socialLinks.id })
      .from(socialLinks)
      .where(eq(socialLinks.url, def.url));

    if (existing) {
      await db
        .insert(socialLinksI18n)
        .values([
          { socialLinkId: existing.id, locale: "fa", label: def.labelFa },
          { socialLinkId: existing.id, locale: "en", label: def.labelEn },
        ])
        .onConflictDoNothing({
          target: [socialLinksI18n.socialLinkId, socialLinksI18n.locale],
        });
    }
  }

  console.log("Social links seeded.");

  await seedServiceCatalog();
  await seedCareGuides();
  await seedRules();
  await seedLanding();
  await seedFakeProviders();

  console.log("Seed complete.");
}

/**
 * Ensure a built-in "fake" provider exists and is the active/default ("current")
 * sender for both SMS and email whenever no real provider is configured yet.
 * Fake providers never send externally — every send is logged to the console — so
 * this makes the whole send pipeline work out-of-the-box for local testing.
 */
async function seedFakeProviders(): Promise<void> {
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

async function seedRules(): Promise<void> {
  for (const def of RULES_SEED) {
    const [row] = await db
      .insert(rules)
      .values({
        slug: def.slug,
        icon: def.icon,
        image: def.image,
        color: def.color,
        highlighted: def.highlighted,
        displayOrder: def.displayOrder,
        isActive: def.isActive,
      })
      .onConflictDoUpdate({
        target: rules.slug,
        set: {
          icon: def.icon,
          image: def.image,
          color: def.color,
          highlighted: def.highlighted,
          displayOrder: def.displayOrder,
          isActive: def.isActive,
        },
      })
      .returning({ id: rules.id });
    for (const entry of def.i18n) {
      await db
        .insert(rulesI18n)
        .values({
          ruleId: row.id,
          locale: entry.locale,
          name: entry.name,
          description: entry.description,
        })
        .onConflictDoUpdate({
          target: [rulesI18n.ruleId, rulesI18n.locale],
          set: {
            name: entry.name,
            description: entry.description,
          },
        });
    }
  }
  console.log("Rules seeded.");
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });