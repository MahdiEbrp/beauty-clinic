import { eq, sql } from "drizzle-orm";

import { hashPassword } from "@/lib/auth/password";
import { db } from "./index";
import {
  permissions,
  roles,
  rolePermissions,
  settings,
  userRoles,
  users,
  rules,
  rulesI18n,
} from "./schema";
import { seedServiceCatalog } from "./seed/service-catalog";
import { seedLanding } from "./seed/landing";
import { RULES_SEED } from "./seed/rules";

const ROLE_DEFS = [
  { key: "admin", name: "Admin", description: "Full platform access" },
  { key: "doctor", name: "Doctor", description: "Clinical staff" },
  { key: "receptionist", name: "Receptionist", description: "Front desk staff" },
  { key: "customer", name: "Customer", description: "Clinic client" },
] as const;

const PERMISSION_DEFS = [
  { key: "users.read", name: "Read users", description: "View user profiles" },
  { key: "users.write", name: "Write users", description: "Create and update users" },
  { key: "users.manage", name: "Manage users", description: "Ban, disable, and assign roles" },
  { key: "appointments.read", name: "Read appointments", description: "View appointments" },
  { key: "appointments.write", name: "Write appointments", description: "Create and update appointments" },
  { key: "appointments.manage", name: "Manage appointments", description: "Cancel and reschedule appointments" },
  { key: "records.read", name: "Read records", description: "View medical records" },
  { key: "records.write", name: "Write records", description: "Create and update medical records" },
  { key: "services.read", name: "Read services", description: "View the service catalog" },
  { key: "services.write", name: "Write services", description: "Create and update the service catalog" },
  { key: "services.manage", name: "Manage services", description: "Deactivate and delete service catalog entries" },
  { key: "rules.read", name: "Read rules", description: "View the clinic rules" },
  { key: "rules.write", name: "Write rules", description: "Create and update clinic rules" },
  { key: "rules.manage", name: "Manage rules", description: "Deactivate and delete clinic rules" },
  { key: "files.read", name: "Read files", description: "Browse and download the file manager" },
  { key: "files.write", name: "Write files", description: "Upload, create, edit and rename files" },
  { key: "files.manage", name: "Manage files", description: "Move files to trash, restore and delete" },
  { key: "settings.manage", name: "Manage settings", description: "Change platform settings" },
] as const;

const ALL_PERMISSIONS = PERMISSION_DEFS.map((p) => p.key);

const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  admin: ALL_PERMISSIONS,
  doctor: [
    "users.read",
    "appointments.read",
    "appointments.write",
    "records.read",
    "records.write",
    "services.read",
    "services.write",
    "rules.read",
    "rules.write",
    "files.read",
  ],
  receptionist: [
    "users.read",
    "users.write",
    "appointments.read",
    "appointments.write",
    "services.read",
    "rules.read",
    "files.read",
    "files.write",
  ],
  customer: [],
};

const SYSTEM_SETTINGS = [
  // Placeholder phone — replace with the real clinic number before going live.
  { key: "contact.phone", value: "+989120000000", type: "string" },
  { key: "contact.address_full", value: "اندیشه فاز دو - میدان مادر - ابتدای بلوار نیلوفر نبش بنفشه هفتم - پلاک ۳۹ - طبقه دو", type: "string" },
  { key: "contact.city", value: "اندیشه", type: "string" },
  { key: "contact.province", value: "تهران", type: "string" },
  { key: "contact.country", value: "IR", type: "string" },
  { key: "contact.map_neshan", value: "https://nshn.ir/rbvg0k2xLMq4", type: "string" },
  // eslint-disable-next-line no-secrets/no-secrets -- public Google Maps search URL, not a secret
  { key: "contact.map_google", value: "https://www.google.com/maps/search/?api=1&query=Andisheh+Phase+2", type: "string" },
  { key: "social.rubika", value: "https://rubika.ir/nafasclinic", type: "string" },
  { key: "social.bale", value: "https://ble.ir/nafasclinic", type: "string" },
  { key: "social.instagram", value: "https://instagram.com/nafasclinic", type: "string" },
  {
    key: "clinic.opening_hours",
    value: [
      {
        days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
        opens: "09:00",
        closes: "19:00",
      },
      { days: ["Thursday"], opens: "09:00", closes: "14:00" },
    ],
    type: "array",
  },
] as const;

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
    await db
      .insert(settings)
      .values({ scope: "system", key: def.key, value: def.value, type: def.type })
      .onConflictDoNothing({
        target: settings.key,
        where: sql`${settings.scope} = 'system'`,
      });
  }

    console.log("System settings seeded.");

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