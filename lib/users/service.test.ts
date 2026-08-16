import { randomUUID } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Row, MockDb } from "@/lib/test/mock-db";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

import { db } from "@/src/db";
import { ApiError } from "@/lib/api/errors";
import { listUsers, updateUserStatus } from "./service";

const mockDb = db as unknown as MockDb;

let counter = 0;

function makeUser(overrides: Partial<Row> = {}): Row {
  counter += 1;
  return {
    id: randomUUID(),
    email: `user${counter}@example.com`,
    phone: null,
    passwordHash: "hash",
    fullName: `User ${counter}`,
    avatarUrl: null,
    isActive: true,
    isBanned: false,
    bannedAt: null,
    banReason: null,
    bannedBy: null,
    deletedAt: null,
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    passwordChangedAt: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(2024, 0, 1, 0, 0, counter),
    updatedAt: new Date(2024, 0, 1, 0, 0, counter),
    lastLoginAt: null,
    ...overrides,
  };
}

function makeRole(overrides: Partial<Row> = {}): Row {
  counter += 1;
  return {
    id: randomUUID(),
    key: `role-${counter}`,
    name: `Role ${counter}`,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeSession(userId: string): Row {
  return {
    id: randomUUID(),
    userId,
    tokenHash: "tok",
    userAgent: null,
    ip: null,
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    lastSeenAt: new Date(),
    revokedAt: null,
  };
}

beforeEach(() => {
  mockDb.reset();
  counter = 0;
});

describe("listUsers", () => {
  it("returns an empty result for an empty database", async () => {
    const result = await listUsers({ page: 1, perPage: 10 });
    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 10,
      totalPages: 0,
    });
  });

  it("paginates and orders newest accounts first", async () => {
    const seeded = [
      makeUser({ createdAt: new Date(2024, 0, 1, 10) }),
      makeUser({ createdAt: new Date(2024, 0, 1, 11) }),
      makeUser({ createdAt: new Date(2024, 0, 1, 12) }),
      makeUser({ createdAt: new Date(2024, 0, 1, 13) }),
      makeUser({ createdAt: new Date(2024, 0, 1, 14) }),
    ];
    mockDb.seed("users", seeded);

    const page1 = await listUsers({ page: 1, perPage: 2 });
    expect(page1.total).toBe(5);
    expect(page1.totalPages).toBe(3);
    expect(page1.items.map((u) => u.id)).toEqual([seeded[4].id, seeded[3].id]);

    const page3 = await listUsers({ page: 3, perPage: 2 });
    expect(page3.items.map((u) => u.id)).toEqual([seeded[0].id]);
  });

  it("excludes soft-deleted users from the count", async () => {
    mockDb.seed("users", [
      makeUser(),
      makeUser({ deletedAt: new Date() }),
    ]);
    const result = await listUsers({ page: 1, perPage: 10 });
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it("searches by full name and email", async () => {
    mockDb.seed("users", [
      makeUser({ fullName: "Jane Doe", email: "jane@example.com" }),
      makeUser({ fullName: "John Smith", email: "john@example.com" }),
    ]);
    const byName = await listUsers({ page: 1, perPage: 10, search: "jane" });
    expect(byName.items.map((u) => u.email)).toEqual(["jane@example.com"]);

    const byEmail = await listUsers({ page: 1, perPage: 10, search: "john@" });
    expect(byEmail.items.map((u) => u.email)).toEqual(["john@example.com"]);
  });

  it("filters by status: active, inactive and banned", async () => {
    mockDb.seed("users", [
      makeUser({ id: "u-active", email: "active@example.com" }),
      makeUser({ id: "u-inactive", email: "inactive@example.com", isActive: false }),
      makeUser({ id: "u-banned", email: "banned@example.com", isBanned: true }),
    ]);

    const active = await listUsers({ page: 1, perPage: 10, status: "active" });
    expect(active.items.map((u) => u.id)).toEqual(["u-active"]);

    const inactive = await listUsers({ page: 1, perPage: 10, status: "inactive" });
    expect(inactive.items.map((u) => u.id)).toEqual(["u-inactive"]);

    const banned = await listUsers({ page: 1, perPage: 10, status: "banned" });
    expect(banned.items.map((u) => u.id)).toEqual(["u-banned"]);
  });

  it("returns the banned flags on banned users", async () => {
    mockDb.seed("users", [
      makeUser({
        id: "u-banned",
        isBanned: true,
        bannedAt: new Date(),
        banReason: "spam",
      }),
    ]);
    const result = await listUsers({ page: 1, perPage: 10, status: "banned" });
    expect(result.items[0]).toMatchObject({
      isBanned: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test matcher
      bannedAt: expect.any(Date),
      banReason: "spam",
    });
  });

  it("attaches role keys from the join", async () => {
    const admin = makeUser({ id: "u-admin" });
    const customer = makeUser({ id: "u-customer" });
    mockDb.seed("users", [customer, admin]);

    const adminRole = makeRole({ id: "r-admin", key: "admin" });
    const customerRole = makeRole({ id: "r-customer", key: "customer" });
    mockDb.seed("roles", [adminRole, customerRole]);
    mockDb.seed("user_roles", [
      { userId: "u-admin", roleId: "r-admin", createdAt: new Date() },
      { userId: "u-customer", roleId: "r-customer", createdAt: new Date() },
    ]);

    const result = await listUsers({ page: 1, perPage: 10 });
    const byId = new Map(result.items.map((u) => [u.id, u.roles]));
    expect(byId.get("u-admin")).toEqual(["admin"]);
    expect(byId.get("u-customer")).toEqual(["customer"]);
  });

  it("defaults roles to an empty array for users without roles", async () => {
    mockDb.seed("users", [makeUser({ id: "u1" })]);
    const result = await listUsers({ page: 1, perPage: 10 });
    expect(result.items[0].roles).toEqual([]);
  });
});

describe("updateUserStatus", () => {
  it("throws USER_NOT_FOUND for a missing user", async () => {
    await expect(
      updateUserStatus("missing", { isActive: false }),
    ).rejects.toThrow(new ApiError(404, "USER_NOT_FOUND", "User not found."));
  });

  it("throws USER_NOT_FOUND for a soft-deleted user", async () => {
    mockDb.seed("users", [makeUser({ id: "u1", deletedAt: new Date() })]);
    await expect(
      updateUserStatus("u1", { isActive: false }),
    ).rejects.toThrow(ApiError);
  });

  it("deactivates a user and revokes their sessions", async () => {
    mockDb.seed("users", [makeUser({ id: "u1", email: "a@example.com" })]);
    mockDb.seed("sessions", [makeSession("u1"), makeSession("u1")]);

    await updateUserStatus("u1", { isActive: false });

    expect(mockDb.data.users[0]).toMatchObject({ isActive: false, isBanned: false });
    expect(mockDb.data.sessions).toHaveLength(0);
  });

  it("keeps the existing flags when patching a single field", async () => {
    mockDb.seed("users", [
      makeUser({ id: "u1", email: "a@example.com", isActive: true, isBanned: false }),
    ]);
    await updateUserStatus("u1", { isBanned: true });

    expect(mockDb.data.users[0]).toMatchObject({
      isActive: true,
      isBanned: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test matcher
      bannedAt: expect.any(Date),
      banReason: null,
    });
    expect(mockDb.data.sessions).toBeUndefined();
  });

  it("bans a user with a reason and revokes sessions", async () => {
    mockDb.seed("users", [makeUser({ id: "u1", email: "a@example.com" })]);
    mockDb.seed("sessions", [makeSession("u1")]);

    await updateUserStatus("u1", { isBanned: true, banReason: "abuse" });

    expect(mockDb.data.users[0]).toMatchObject({
      isBanned: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test matcher
      bannedAt: expect.any(Date),
      banReason: "abuse",
    });
    expect(mockDb.data.sessions).toHaveLength(0);
  });

  it("clears the ban when unbanning", async () => {
    mockDb.seed("users", [
      makeUser({
        id: "u1",
        email: "a@example.com",
        isBanned: true,
        bannedAt: new Date(),
        banReason: "old reason",
      }),
    ]);
    await updateUserStatus("u1", { isBanned: false });

    expect(mockDb.data.users[0]).toMatchObject({
      isBanned: false,
      bannedAt: null,
      banReason: null,
    });
  });

  it("updates only the ban reason without touching flags", async () => {
    mockDb.seed("users", [
      makeUser({ id: "u1", email: "a@example.com", isBanned: true, banReason: "old" }),
    ]);
    await updateUserStatus("u1", { banReason: "new reason" });

    expect(mockDb.data.users[0]).toMatchObject({
      isActive: true,
      isBanned: true,
      banReason: "new reason",
    });
    expect(mockDb.data.sessions).toBeUndefined();
  });
});
