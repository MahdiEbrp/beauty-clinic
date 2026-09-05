import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import { hashPassword } from "@/lib/auth/password";
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
} from "./schema";
import { seedServiceCatalog } from "./seed/service-catalog";
import { seedCareGuides } from "./seed/care-guides";
import { seedLanding } from "./seed/landing";
import { seedFakeProviders } from "./seed/fake-providers";
import { seedGmailProviderFromEnv } from "./seed/gmail-provider";
import { seedRules } from "./seed/rules";
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

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    await upsertSuperAdmin({ email: adminEmail, password: adminPassword, roleByKey });
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
  await seedGmailProviderFromEnv();

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

/**
 * Creates the default superadmin from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 * When a "Super Admin" account already exists under a different address (a
 * previous run's default), it is renamed to the configured email instead of
 * leaving a stale default behind or creating a duplicate.
 */
async function upsertSuperAdmin(options: {
  email: string;
  password: string;
  roleByKey: Map<string, { id: string }>;
}): Promise<void> {
  const { email, password, roleByKey } = options;

  const [active] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);
  if (active) {
    console.log(`Superadmin already exists: ${email}`);
    return;
  }

  const adminRole = roleByKey.get("admin");
  if (!adminRole) {
    console.warn("admin role not seeded — skipping superadmin creation.");
    return;
  }

  const seeded = await findSeededAdminUser(adminRole.id);
  if (seeded) {
    await db
      .update(users)
      .set({ email, updatedAt: new Date() })
      .where(and(eq(users.id, seeded.id), isNull(users.deletedAt)));
    console.log(`Default superadmin email updated to: ${email}`);
    return;
  }

  const adminPhone = process.env.SEED_ADMIN_PHONE;
  if (!adminPhone) {
    console.warn(
      "SEED_ADMIN_PHONE not set — the seeded admin cannot sign in via OTP login.",
    );
  }
  const [admin] = await db
    .insert(users)
    .values({
      email,
      fullName: "Super Admin",
      phone: adminPhone,
      passwordHash: await hashPassword(password),
    })
    .returning({ id: users.id });

  if (admin) {
    await db.insert(userRoles).values({ userId: admin.id, roleId: adminRole.id });
  }
  console.log(`Superadmin created: ${email}`);
}

/** The admin-role user created by an earlier seed run (fullName "Super Admin"). */
async function findSeededAdminUser(adminRoleId: string): Promise<{ id: string } | null> {
  const holders = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(eq(userRoles.roleId, adminRoleId));
  if (holders.length === 0) return null;

  const [candidate] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        inArray(
          users.id,
          holders.map((row) => row.userId),
        ),
        eq(users.fullName, "Super Admin"),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);
  return candidate ?? null;
}