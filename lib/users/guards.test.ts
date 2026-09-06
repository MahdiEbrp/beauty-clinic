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
import { createUser, updateUserRole, updateUserStatus } from "./service";

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
    nameEn: null,
    description: null,
    scope: "global",
    isSystem: false,
    createdAt: new Date(2024, 0, 1, 0, 0, counter),
    updatedAt: new Date(2024, 0, 1, 0, 0, counter),
    deletedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  mockDb.reset();
});

describe("createUser role grants", () => {
  it("blocks non-manage callers from assigning staff roles", async () => {
    mockDb.seed("roles", [makeRole({ id: "r-admin", key: "admin" })]);
    await expect(
      createUser(
        {
          fullName: "Hacker",
          email: "hacker@example.com",
          phone: null,
          password: "P@ssw0rd!",
          roleKey: "admin",
        },
        ["users.write"],
      ),
    ).rejects.toThrow(
      new ApiError(403, "FORBIDDEN_ROLE", "Only user managers may assign staff roles."),
    );
    expect(mockDb.data.users).toBeUndefined();
  });

  it("allows users.manage callers to assign staff roles", async () => {
    mockDb.seed("roles", [makeRole({ id: "r-rec", key: "receptionist" })]);
    const result = await createUser(
      {
        fullName: "Reception",
        email: "rec@example.com",
        phone: null,
        password: "P@ssw0rd!",
        roleKey: "receptionist",
      },
      ["users.write", "users.manage"],
    );
    expect(result.id).toBeTruthy();
    expect(mockDb.data.users).toHaveLength(1);
  });
});

describe("updateUserStatus", () => {
  it("blocks deactivating the last active admin", async () => {
    mockDb.seed("users", [
      makeUser({ id: "u-admin", email: "admin@example.com", isActive: true }),
    ]);
    mockDb.seed("roles", [makeRole({ id: "r-admin", key: "admin" })]);
    mockDb.seed("user_roles", [
      { userId: "u-admin", roleId: "r-admin", createdAt: new Date() },
    ]);

    await expect(updateUserStatus("u-admin", { isActive: false })).rejects.toThrow(
      new ApiError(409, "LAST_ADMIN", "This is the last active admin account; it cannot be demoted or removed."),
    );
    expect(mockDb.data.users[0]).toMatchObject({ isActive: true });
  });
});

describe("updateUserRole", () => {
  it("blocks changing your own role", async () => {
    mockDb.seed("roles", [makeRole({ id: "r-customer", key: "customer" })]);
    await expect(
      updateUserRole(
        "u1",
        "customer",
        { id: "u1", permissions: ["users.manage"] },
      ),
    ).rejects.toThrow(
      new ApiError(403, "SELF_ROLE_CHANGE", "You cannot change your own role."),
    );
  });

  it("blocks demoting the last active admin", async () => {
    mockDb.seed("users", [makeUser({ id: "u-admin", email: "admin@example.com" })]);
    mockDb.seed("roles", [
      makeRole({ id: "r-admin", key: "admin" }),
      makeRole({ id: "r-customer", key: "customer" }),
    ]);
    mockDb.seed("user_roles", [
      { userId: "u-admin", roleId: "r-admin", createdAt: new Date() },
    ]);

    await expect(
      updateUserRole("u-admin", "customer", {
        id: "u-boss",
        permissions: ["users.manage"],
      }),
    ).rejects.toThrow(new ApiError(409, "LAST_ADMIN", "This is the last active admin account; it cannot be demoted or removed."));
  });

  it("allows demoting an admin when another active admin remains", async () => {
    mockDb.seed("users", [
      makeUser({ id: "u-admin-a", email: "a@example.com" }),
      makeUser({ id: "u-admin-b", email: "b@example.com" }),
    ]);
    mockDb.seed("roles", [
      makeRole({ id: "r-admin", key: "admin" }),
      makeRole({ id: "r-customer", key: "customer" }),
    ]);
    mockDb.seed("user_roles", [
      { userId: "u-admin-a", roleId: "r-admin", createdAt: new Date() },
      { userId: "u-admin-b", roleId: "r-admin", createdAt: new Date() },
    ]);

    await updateUserRole("u-admin-a", "customer", {
      id: "u-boss",
      permissions: ["users.manage"],
    });

    const rows = mockDb.data.user_roles ?? [];
    expect(rows.find((r) => r.userId === "u-admin-a")?.roleId).toBe("r-customer");
    expect(rows.find((r) => r.userId === "u-admin-b")?.roleId).toBe("r-admin");
  });
});