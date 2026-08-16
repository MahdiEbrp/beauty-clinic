import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

import { makeCategory, makeFaq, makeImage, makeService, mockDb, resetServiceDb } from "./service-test-fixtures";
import { createService, deleteService, updateService } from "./service";

const input = {
  categoryId: "c1",
  slug: "botox-injection",
  price: 150,
  priceType: "fixed" as const,
  durationMin: 30,
  sessionsCount: 1,
  coverImage: null,
  isActive: true,
  isFeatured: false,
  displayOrder: 0,
  translations: {
    fa: { title: "Botox Injection", shortDesc: null, fullDesc: null, seoTitle: null, seoDescription: null },
    en: { title: "Botox Injection", shortDesc: null, fullDesc: null, seoTitle: null, seoDescription: null },
  },
  images: [{ imageUrl: "/images/botox.webp", type: "gallery" as const, displayOrder: 1 }],
  faqs: [
    {
      displayOrder: 1,
      translations: {
        fa: { question: "Q?", answer: "A." },
        en: { question: "Q?", answer: "A." },
      },
    },
  ],
};

beforeEach(() => {
  resetServiceDb();
});

describe("createService", () => {
  it("creates a service with nested translations, images and faqs", async () => {
    mockDb.seed("service_categories", [makeCategory({ id: "c1" })]);

    const { id } = await createService(input);
    expect(id).toBeTruthy();
    expect(mockDb.data.services).toHaveLength(1);
    expect(mockDb.data.services[0]).toMatchObject({ slug: "botox-injection" });
    expect(mockDb.data.services_i18n).toHaveLength(2);
    expect(
      mockDb.data.services_i18n.some((r) => r.locale === "fa" && r.title === "Botox Injection"),
    ).toBe(true);
    expect(mockDb.data.service_images).toHaveLength(1);
    expect(mockDb.data.service_images[0]).toMatchObject({ serviceId: id, imageUrl: "/images/botox.webp" });
    expect(mockDb.data.service_faqs).toHaveLength(1);
    expect(mockDb.data.service_faqs_i18n).toHaveLength(2);
  });

  it("throws INVALID_CATEGORY for a missing category", async () => {
    await expect(createService(input)).rejects.toThrow(
      new ApiError(400, "INVALID_CATEGORY", "The selected category does not exist."),
    );
  });

  it("maps a duplicate slug to a 409", async () => {
    mockDb.seed("service_categories", [makeCategory({ id: "c1" })]);
    mockDb.failInsert = (table, values) =>
      table === "services" && values.slug === "botox-injection"
        ? { code: "23505" }
        : null;

    await expect(createService(input)).rejects.toThrow(
      new ApiError(409, "SLUG_TAKEN", "A service with this slug already exists."),
    );
  });
});

describe("updateService", () => {
  it("throws SERVICE_NOT_FOUND for a missing service", async () => {
    await expect(
      updateService("missing", { isFeatured: true }),
    ).rejects.toThrow(
      new ApiError(404, "SERVICE_NOT_FOUND", "Service not found."),
    );
  });

  it("patches scalar fields and translations", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    await updateService("s1", {
      isFeatured: true,
      translations: { fa: { title: "New Title" }, en: { title: "New Title" } },
    });

    expect(mockDb.data.services[0]).toMatchObject({ isFeatured: true });
    expect(mockDb.data.services_i18n).toHaveLength(2);
    expect(
      mockDb.data.services_i18n.some((r) => r.locale === "fa" && r.title === "New Title"),
    ).toBe(true);
  });

  it("replaces images and faqs when provided", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    mockDb.seed("service_images", [makeImage({ serviceId: "s1" })]);
    mockDb.seed("service_faqs", [makeFaq({ serviceId: "s1" })]);

    await updateService("s1", {
      images: [{ imageUrl: "/new.webp", type: "after", displayOrder: 1 }],
      faqs: [],
    });

    expect(mockDb.data.service_images).toHaveLength(1);
    expect(mockDb.data.service_images[0]).toMatchObject({ imageUrl: "/new.webp", type: "after" });
    expect(mockDb.data.service_faqs).toHaveLength(0);
  });

  it("throws INVALID_CATEGORY when reparenting to a missing category", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    await expect(updateService("s1", { categoryId: "missing" })).rejects.toThrow(ApiError);
  });

  it("maps a duplicate slug to a 409", async () => {
    mockDb.seed("services", [
      makeService({ id: "s1", slug: "original" }),
      makeService({ id: "s2", slug: "taken" }),
    ]);

    await expect(updateService("s1", { slug: "taken" })).rejects.toThrow(
      new ApiError(409, "SLUG_TAKEN", "A service with this slug already exists."),
    );
  });
});

describe("deleteService", () => {
  it("throws SERVICE_NOT_FOUND for a missing service", async () => {
    await expect(deleteService("missing")).rejects.toThrow(ApiError);
  });

  it("deletes an existing service", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    await deleteService("s1");
    expect(mockDb.data.services).toHaveLength(0);
  });
});
