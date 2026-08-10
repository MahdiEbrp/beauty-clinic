/* eslint-disable max-lines -- comprehensive seed script with all reference data and defaults */

import { eq, sql } from "drizzle-orm";

import { hashPassword } from "@/lib/auth/password";
import { db } from "./index";
import {
  permissions,
  roles,
  rolePermissions,
  serviceCategories,
  serviceFaqs,
  serviceGroups,
  serviceImages,
  services,
  settings,
  userRoles,
  users,
} from "./schema";

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
    "files.read",
  ],
  receptionist: [
    "users.read",
    "users.write",
    "appointments.read",
    "appointments.write",
    "services.read",
    "files.read",
    "files.write",
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

  // --- Service catalog ----------------------------------------------------
  // Groups/categories/services store *translation keys* in their name/title/
  // description columns; the UI resolves them via next-intl `t()`. The catalog
  // is seeded idempotently: slugs are unique and existing rows are left alone.

  const GROUP_DEFS = [
    { slug: "facial", icon: "facial", displayOrder: 1 },
    { slug: "laser", icon: "laser", displayOrder: 2 },
    { slug: "antiaging", icon: "antiaging", displayOrder: 3 },
    { slug: "body", icon: "body", displayOrder: 4 },
    { slug: "peel", icon: "peel", displayOrder: 5 },
    { slug: "wellness", icon: "wellness", displayOrder: 6 },
  ] as const;

  const CATEGORY_DEFS = [
    { slug: "gel-botox", icon: "gelBotox", groupSlug: "antiaging", displayOrder: 1 },
    { slug: "facial", icon: "facial", groupSlug: "facial", displayOrder: 2 },
    { slug: "rejuvenation", icon: "rejuvenation", groupSlug: "antiaging", displayOrder: 3 },
    { slug: "body-filler", icon: "bodyFiller", groupSlug: "body", displayOrder: 4 },
    { slug: "hifu", icon: "hifu", groupSlug: "laser", displayOrder: 5 },
    { slug: "microneedling", icon: "microneedling", groupSlug: "facial", displayOrder: 6 },
  ] as const;

  // Category key used inside the `servicesPage.services.*` message namespace.
  const CATEGORY_MESSAGE_KEY: Record<string, string> = {
    "gel-botox": "gelBotox",
    facial: "facial",
    rejuvenation: "rejuvenation",
    "body-filler": "bodyFiller",
    hifu: "hifu",
    microneedling: "microneedling",
  };

  const SERVICE_DEFS = [
    { slug: "gel-botox-injection", categorySlug: "gel-botox", price: 23600, priceType: "from", durationMin: 30, sessionsCount: 1, isFeatured: true },
    { slug: "specialized-facial", categorySlug: "facial", price: null, priceType: "on_request", durationMin: 60, sessionsCount: 1 },
    { slug: "rejuvenation-lift", categorySlug: "rejuvenation", price: 16290, priceType: "from", durationMin: 45, sessionsCount: 2 },
    { slug: "body-filler", categorySlug: "body-filler", price: 390, priceType: "from", durationMin: 30, sessionsCount: 2 },
    { slug: "hifu-therapy", categorySlug: "hifu", price: null, priceType: "on_request", durationMin: 60, sessionsCount: 3 },
    { slug: "microneedling", categorySlug: "microneedling", price: 1990, priceType: "fixed", durationMin: 45, sessionsCount: 3 },
  ] as const;

  for (const def of GROUP_DEFS) {
    await db
      .insert(serviceGroups)
      .values({
        slug: def.slug,
        name: `servicesList.${def.slug}.title`,
        description: `servicesList.${def.slug}.description`,
        icon: def.icon,
        displayOrder: def.displayOrder,
      })
      .onConflictDoNothing({ target: serviceGroups.slug });
  }
  const groupRows = await db.select().from(serviceGroups);
  const groupIdBySlug = new Map(groupRows.map((g) => [g.slug, g.id]));

  for (const def of CATEGORY_DEFS) {
    const groupId = groupIdBySlug.get(def.groupSlug);
    if (!groupId) {
      console.warn(`Skipping category ${def.slug}: group ${def.groupSlug} not found.`);
      continue;
    }
    const messageKey = CATEGORY_MESSAGE_KEY[def.slug];
    await db
      .insert(serviceCategories)
      .values({
        groupId,
        slug: def.slug,
        name: `servicesPage.services.${messageKey}.title`,
        description: `servicesPage.services.${messageKey}.description`,
        icon: def.icon,
        displayOrder: def.displayOrder,
      })
      .onConflictDoNothing({ target: serviceCategories.slug });
  }
  const categoryRows = await db.select().from(serviceCategories);
  const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  for (const def of SERVICE_DEFS) {
    const categoryId = categoryIdBySlug.get(def.categorySlug);
    if (!categoryId) {
      console.warn(`Skipping service ${def.slug}: category ${def.categorySlug} not found.`);
      continue;
    }
    const messageKey = CATEGORY_MESSAGE_KEY[def.categorySlug];
    await db
      .insert(services)
      .values({
        categoryId,
        slug: def.slug,
        title: `servicesPage.services.${messageKey}.title`,
        fullDesc: `serviceDetail.services.${def.slug}.fullDesc`,
        price: def.price === null ? null : String(def.price),
        priceType: def.priceType,
        durationMin: def.durationMin,
        sessionsCount: def.sessionsCount,
        isFeatured: (def as { isFeatured?: boolean }).isFeatured ?? false,
      })
      .onConflictDoNothing({ target: services.slug });
  }
  const serviceRows = await db.select().from(services);
  const serviceIdBySlug = new Map(serviceRows.map((s) => [s.slug, s.id]));

  const IMAGE_DEFS: {
    slug: string;
    images: { imageUrl: string; type: "before" | "after" | "gallery"; displayOrder: number }[];
  }[] = [
    {
      slug: "gel-botox-injection",
      images: [
        { imageUrl: "/images/gallery/hydrafacial.webp", type: "gallery", displayOrder: 1 },
        { imageUrl: "/images/gallery/laser-rejuv.webp", type: "gallery", displayOrder: 2 },
      ],
    },
    {
      slug: "specialized-facial",
      images: [
        { imageUrl: "/images/gallery/hydrafacial.webp", type: "before", displayOrder: 1 },
        { imageUrl: "/images/gallery/skin-care.webp", type: "after", displayOrder: 2 },
      ],
    },
    {
      slug: "rejuvenation-lift",
      images: [
        { imageUrl: "/images/gallery/laser-rejuv.webp", type: "gallery", displayOrder: 1 },
      ],
    },
    {
      slug: "body-filler",
      images: [
        { imageUrl: "/images/gallery/microneedling.webp", type: "gallery", displayOrder: 1 },
      ],
    },
    {
      slug: "hifu-therapy",
      images: [
        { imageUrl: "/images/gallery/laser-rejuv.webp", type: "gallery", displayOrder: 1 },
        { imageUrl: "/images/gallery/microneedling.webp", type: "gallery", displayOrder: 2 },
      ],
    },
    {
      slug: "microneedling",
      images: [
        { imageUrl: "/images/gallery/microneedling.webp", type: "gallery", displayOrder: 1 },
      ],
    },
  ];

  for (const def of IMAGE_DEFS) {
    const serviceId = serviceIdBySlug.get(def.slug);
    if (!serviceId) continue;
    for (const image of def.images) {
      await db.insert(serviceImages).values({ serviceId, ...image });
    }
  }

  const FAQ_DEFS: {
    slug: string;
    faqs: { question: string; answer: string; displayOrder: number }[];
  }[] = [
    {
      slug: "gel-botox-injection",
      faqs: [
        { question: "serviceDetail.faqs.gel-botox-injection.q1", answer: "serviceDetail.faqs.gel-botox-injection.a1", displayOrder: 1 },
        { question: "serviceDetail.faqs.gel-botox-injection.q2", answer: "serviceDetail.faqs.gel-botox-injection.a2", displayOrder: 2 },
      ],
    },
    {
      slug: "specialized-facial",
      faqs: [
        { question: "serviceDetail.faqs.specialized-facial.q1", answer: "serviceDetail.faqs.specialized-facial.a1", displayOrder: 1 },
        { question: "serviceDetail.faqs.specialized-facial.q2", answer: "serviceDetail.faqs.specialized-facial.a2", displayOrder: 2 },
      ],
    },
    {
      slug: "rejuvenation-lift",
      faqs: [
        { question: "serviceDetail.faqs.rejuvenation-lift.q1", answer: "serviceDetail.faqs.rejuvenation-lift.a1", displayOrder: 1 },
        { question: "serviceDetail.faqs.rejuvenation-lift.q2", answer: "serviceDetail.faqs.rejuvenation-lift.a2", displayOrder: 2 },
      ],
    },
    {
      slug: "body-filler",
      faqs: [
        { question: "serviceDetail.faqs.body-filler.q1", answer: "serviceDetail.faqs.body-filler.a1", displayOrder: 1 },
        { question: "serviceDetail.faqs.body-filler.q2", answer: "serviceDetail.faqs.body-filler.a2", displayOrder: 2 },
      ],
    },
    {
      slug: "hifu-therapy",
      faqs: [
        { question: "serviceDetail.faqs.hifu-therapy.q1", answer: "serviceDetail.faqs.hifu-therapy.a1", displayOrder: 1 },
        { question: "serviceDetail.faqs.hifu-therapy.q2", answer: "serviceDetail.faqs.hifu-therapy.a2", displayOrder: 2 },
      ],
    },
    {
      slug: "microneedling",
      faqs: [
        { question: "serviceDetail.faqs.microneedling.q1", answer: "serviceDetail.faqs.microneedling.a1", displayOrder: 1 },
        { question: "serviceDetail.faqs.microneedling.q2", answer: "serviceDetail.faqs.microneedling.a2", displayOrder: 2 },
      ],
    },
  ];

  for (const def of FAQ_DEFS) {
    const serviceId = serviceIdBySlug.get(def.slug);
    if (!serviceId) continue;
    for (const faq of def.faqs) {
      await db.insert(serviceFaqs).values({ serviceId, ...faq });
    }
  }

  console.log("Service catalog seeded.");

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
