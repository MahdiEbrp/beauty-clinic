import { eq, sql } from "drizzle-orm";

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
  rules,
  rulesI18n,
} from "./schema";
import { seedServiceCatalog } from "./seed/service-catalog";
import { seedLanding } from "./seed/landing";
import { RULES_SEED } from "./seed/rules";
import {
  ROLE_DEFS,
  PERMISSION_DEFS,
  ALL_PERMISSIONS,
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
    const [row] = await db
      .insert(socialLinks)
      .values({
        url: def.url,
        imageUrl: def.imageUrl,
        displayOrder: def.displayOrder,
      })
      .onConflictDoNothing({ target: socialLinks.url })
      .returning({ id: socialLinks.id });

    if (row) {
      await db.insert(socialLinksI18n).values([
        { socialLinkId: row.id, locale: "fa", label: def.labelFa },
        { socialLinkId: row.id, locale: "en", label: def.labelEn },
      ]);
    }
  }

  console.log("Social links seeded.");

  await seedServiceCatalog();
  await seedRules();
  await seedLanding();

  console.log("Seed complete.");
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