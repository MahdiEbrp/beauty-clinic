import { randomUUID } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Row, MockDb } from "@/lib/test/mock-db";
import { resetCacheForTests } from "@/lib/cache";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(() => Promise.resolve("hashed-random")),
}));

import { db } from "@/src/db";
import { ensureCustomerUser } from "./customers";

const mockDb = db as unknown as MockDb;

function user(overrides: Partial<Row> = {}): Row {
  return {
    id: randomUUID(),
    email: "staff@clinic.test",
    phone: null,
    passwordHash: "x",
    fullName: "Staff",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  mockDb.reset();
  resetCacheForTests();
});

describe("ensureCustomerUser", () => {
  it("reuses an existing user for the phone without creating another", async () => {
    const existing = user({
      phone: "09120000000",
      email: "09120000000@email.com",
      fullName: "Reza",
    });
    mockDb.seed("users", [existing]);

    const id = await mockDb.transaction((tx) =>
      ensureCustomerUser(tx as never, {
        phone: "0912 000 0000",
        fullName: "Different Name",
      }),
    );

    expect(id).toBe(existing.id);
    expect(mockDb.data.users).toHaveLength(1);
    expect(mockDb.data.users[0].fullName).toBe("Reza");
  });

  it("creates a customer user with normalized phone + auto email when missing", async () => {
    mockDb.seed("roles", [
      { id: "role-customer", key: "customer", name: "Customer" },
    ]);

    const id = await mockDb.transaction((tx) =>
      ensureCustomerUser(tx as never, {
        phone: "0912 345 6789",
        fullName: "Sara",
      }),
    );

    expect(id).toBeTruthy();
    const created = mockDb.data.users.find((row) => row.phone === "09123456789");
    expect(created).toBeTruthy();
    expect(created?.email).toBe("09123456789@email.com");
    expect(created?.fullName).toBe("Sara");
    expect(created?.passwordHash).toBe("hashed-random");
    expect(mockDb.data.user_roles).toHaveLength(1);
  });

  it("honors a caller-provided real email when it differs from the placeholder", async () => {
    const id = await mockDb.transaction((tx) =>
      ensureCustomerUser(tx as never, {
        phone: "09111111111",
        fullName: "Niloofar",
        email: "niloofar@clinic.test",
      }),
    );

    const created = mockDb.data.users.find((row) => row.id === id);
    expect(created?.email).toBe("niloofar@clinic.test");
  });
});
