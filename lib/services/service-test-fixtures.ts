import { randomUUID } from "node:crypto";

import type { Row, MockDb } from "@/lib/test/mock-db";
import { resetCacheForTests } from "@/lib/cache";
import { db } from "@/src/db";

export const mockDb = db as unknown as MockDb;

export const UUID = () => randomUUID();

export function makeGroup(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    name: "Laser",
    slug: "laser",
    description: null,
    icon: null,
    image: null,
    displayOrder: 1,
    isActive: true,
    seoTitle: null,
    seoDescription: null,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

export function makeCategory(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    groupId: "g1",
    name: "Laser Hair Removal",
    slug: "laser-hair-removal",
    description: null,
    icon: null,
    image: null,
    displayOrder: 1,
    isActive: true,
    seoTitle: null,
    seoDescription: null,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

export function makeService(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    categoryId: "c1",
    title: "Laser Hair Removal",
    slug: "laser-hair-removal",
    shortDesc: null,
    fullDesc: null,
    price: 100,
    priceType: "fixed",
    durationMin: 30,
    sessionsCount: 1,
    coverImage: null,
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

export function makeImage(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    serviceId: "s1",
    imageUrl: "/images/laser.webp",
    type: "gallery",
    displayOrder: 0,
    createdAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

export function makeFaq(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    serviceId: "s1",
    question: "Does it hurt?",
    answer: "No.",
    displayOrder: 0,
    createdAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

/** Seeds a group plus its fa/en translations (names resolve through i18n). */
export function seedGroup(overrides: Partial<Row> = {}): Row {
  const row = makeGroup(overrides);
  mockDb.seed("service_groups", [row]);
  mockDb.seed("service_groups_i18n", [
    { groupId: row.id, locale: "fa", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
    { groupId: row.id, locale: "en", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
  ]);
  return row;
}

/** Seeds a category plus its fa/en translations. */
export function seedCategory(overrides: Partial<Row> = {}): Row {
  const row = makeCategory(overrides);
  mockDb.seed("service_categories", [row]);
  mockDb.seed("service_categories_i18n", [
    { categoryId: row.id, locale: "fa", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
    { categoryId: row.id, locale: "en", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
  ]);
  return row;
}

/** Seeds a service plus its fa/en translations. */
export function seedService(overrides: Partial<Row> = {}): Row {
  const row = makeService(overrides);
  mockDb.seed("services", [row]);
  mockDb.seed("services_i18n", [
    { serviceId: row.id, locale: "fa", title: row.title, shortDesc: row.shortDesc, fullDesc: row.fullDesc },
    { serviceId: row.id, locale: "en", title: row.title, shortDesc: row.shortDesc, fullDesc: row.fullDesc },
  ]);
  return row;
}

/** Seeds a faq plus its fa/en translations. */
export function seedFaq(overrides: Partial<Row> = {}): Row {
  const row = makeFaq(overrides);
  mockDb.seed("service_faqs", [row]);
  mockDb.seed("service_faqs_i18n", [
    { faqId: row.id, locale: "fa", question: row.question, answer: row.answer },
    { faqId: row.id, locale: "en", question: row.question, answer: row.answer },
  ]);
  return row;
}

/** Wipes the mock database and the cache layer before each test. */
export function resetServiceDb(): void {
  mockDb.reset();
  resetCacheForTests();
}
