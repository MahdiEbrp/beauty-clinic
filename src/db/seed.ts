import { eq } from "drizzle-orm";

import { hashPassword } from "@/lib/auth/password";
import { db } from "./index";
import { permissions, roles, rolePermissions, settings, userRoles, users } from "./schema";

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
  { key: "services.write", name: "Write services", description: "Manage the service catalog" },
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
  ],
  receptionist: [
    "users.read",
    "users.write",
    "appointments.read",
    "appointments.write",
    "services.read",
  ],
  customer: [],
};

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

  const SYSTEM_SETTINGS = [
    { key: "contact.phone", value: null, type: "string" },
    { key: "contact.address_full", value: "اندیشه فاز دو - میدان مادر - ابتدای بلوار نیلوفر نبش بنفشه هفتم - پلاک ۳۹ - طبقه دو", type: "string" },
    { key: "contact.city", value: "اندیشه", type: "string" },
    { key: "contact.province", value: "تهران", type: "string" },
    { key: "contact.country", value: "IR", type: "string" },
    { key: "contact.map_neshan", value: "https://nshn.ir/rbvg0k2xLMq4", type: "string" },
    { key: "contact.map_google", value: "https://www.google.com/maps/search/?api=1&query=Andisheh+Phase+2", type: "string" },
    { key: "social.rubika", value: "https://rubika.ir/nafasclinic", type: "string" },
    { key: "social.bale", value: "https://ble.ir/nafasclinic", type: "string" },
  ] as const;

  for (const def of SYSTEM_SETTINGS) {
    await db
      .insert(settings)
      .values({ scope: "system", key: def.key, value: def.value, type: def.type })
      .onConflictDoNothing({ target: [settings.key] });
  }

  console.log("System settings seeded.");

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
