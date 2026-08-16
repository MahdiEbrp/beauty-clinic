import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Row } from "@/lib/test/mock-db";
import { ApiError } from "@/lib/api/errors";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

import {
  makeImage,
  makeService,
  mockDb,
  resetServiceDb,
  seedCategory,
  seedFaq,
  seedGroup,
  seedService,
} from "./service-test-fixtures";
import { getService, listServices } from "./service";

function seedServices(rows: Row[]) {
  mockDb.seed("services", rows);
}

beforeEach(() => {
  resetServiceDb();
});

describe("listServices", () => {
  it("returns an empty result for an empty database", async () => {
    const result = await listServices({ page: 1, perPage: 20 });
    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
    });
  });

  it("paginates and orders newest services first", async () => {
    const seeded = [
      makeService({ id: "s1", createdAt: new Date(2024, 0, 1, 10) }),
      makeService({ id: "s2", createdAt: new Date(2024, 0, 1, 11) }),
      makeService({ id: "s3", createdAt: new Date(2024, 0, 1, 12) }),
      makeService({ id: "s4", createdAt: new Date(2024, 0, 1, 13) }),
      makeService({ id: "s5", createdAt: new Date(2024, 0, 1, 14) }),
    ];
    seedServices(seeded);

    const page1 = await listServices({ page: 1, perPage: 2 });
    expect(page1.total).toBe(5);
    expect(page1.totalPages).toBe(3);
    expect(page1.items.map((s) => s.id)).toEqual(["s5", "s4"]);

    const page3 = await listServices({ page: 3, perPage: 2 });
    expect(page3.items.map((s) => s.id)).toEqual(["s1"]);
  });

  it("attaches category and group names from the join", async () => {
    seedGroup({ id: "g1", name: "Laser", slug: "laser" });
    seedCategory({ id: "c1", groupId: "g1", name: "Laser Hair", slug: "laser-hair" });
    seedService({ id: "s1", categoryId: "c1" });

    const result = await listServices({ page: 1, perPage: 20 });
    expect(result.items[0]).toMatchObject({
      categoryName: "Laser Hair",
      groupName: "Laser",
      groupId: "g1",
    });
  });

  it("searches by title and slug", async () => {
    seedService({ id: "s1", title: "Botox Injection", slug: "botox-injection" });
    seedService({ id: "s2", title: "Facial", slug: "specialized-facial" });

    const byTitle = await listServices({ page: 1, perPage: 20, search: "botox" });
    expect(byTitle.items.map((s) => s.id)).toEqual(["s1"]);

    const bySlug = await listServices({ page: 1, perPage: 20, search: "specialized-facial" });
    expect(bySlug.items.map((s) => s.id)).toEqual(["s2"]);
  });

  it("filters by categoryId", async () => {
    seedServices([
      makeService({ id: "s1", categoryId: "c1" }),
      makeService({ id: "s2", categoryId: "c2" }),
    ]);
    const result = await listServices({ page: 1, perPage: 20, categoryId: "c2" });
    expect(result.items.map((s) => s.id)).toEqual(["s2"]);
  });

  it("filters by status and featured flags", async () => {
    seedServices([
      makeService({ id: "s1", createdAt: new Date(2024, 0, 1, 10), isActive: true, isFeatured: false }),
      makeService({ id: "s2", createdAt: new Date(2024, 0, 1, 11), isActive: false, isFeatured: false }),
      makeService({ id: "s3", createdAt: new Date(2024, 0, 1, 12), isActive: true, isFeatured: true }),
    ]);

    const active = await listServices({ page: 1, perPage: 20, status: "active" });
    expect(active.items.map((s) => s.id)).toEqual(["s3", "s1"]);

    const inactive = await listServices({ page: 1, perPage: 20, status: "inactive" });
    expect(inactive.items.map((s) => s.id)).toEqual(["s2"]);

    const featured = await listServices({ page: 1, perPage: 20, featured: "yes" });
    expect(featured.items.map((s) => s.id)).toEqual(["s3"]);

    const notFeatured = await listServices({ page: 1, perPage: 20, featured: "no" });
    expect(notFeatured.items.map((s) => s.id)).toEqual(["s2", "s1"]);
  });
});

describe("getService", () => {
  it("throws SERVICE_NOT_FOUND for a missing service", async () => {
    await expect(getService("missing")).rejects.toThrow(
      new ApiError(404, "SERVICE_NOT_FOUND", "Service not found."),
    );
  });

  it("returns a service with names, images and faqs", async () => {
    seedGroup({ id: "g1", name: "Laser" });
    seedCategory({ id: "c1", groupId: "g1", name: "Laser Hair" });
    seedService({ id: "s1", categoryId: "c1", price: 250 });
    mockDb.seed("service_images", [makeImage({ serviceId: "s1" })]);
    seedFaq({ serviceId: "s1" });

    const service = await getService("s1");
    expect(service).toMatchObject({
      id: "s1",
      categoryName: "Laser Hair",
      groupName: "Laser",
      groupId: "g1",
      price: 250,
    });
    expect(service.images).toHaveLength(1);
    expect(service.images[0]).toMatchObject({ imageUrl: "/images/laser.webp", type: "gallery" });
    expect(service.faqs).toHaveLength(1);
    expect(service.faqs[0].answer).toBe("No.");
  });
});
