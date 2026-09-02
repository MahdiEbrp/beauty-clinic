import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MockDb } from "@/lib/test/mock-db";

const passwordMock = vi.hoisted(() => ({
  hashPassword: vi.fn((plain: string) => `hash:${plain}`),
}));

const sessionMock = vi.hoisted(() => ({
  createSession: vi.fn(() => {}),
}));

// `server-only` throws when imported outside a Server Component runtime, so
// the auth service's guard import must be stubbed in the test environment.
vi.mock("server-only", () => ({}));
vi.mock("./password", () => passwordMock);
vi.mock("./session", () => sessionMock);

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

import { db } from "@/src/db";
import { registerUser } from "./service";

const mockDb = db as unknown as MockDb;

const customerRole = {
  id: "r-customer",
  key: "customer",
  name: "Customer",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  mockDb.reset();
  passwordMock.hashPassword.mockImplementation((plain: string) => `hash:${plain}`);
  sessionMock.createSession.mockClear();
});

describe("registerUser", () => {
  it("creates a user with the phone, assigns the customer role and signs them in", async () => {
    mockDb.seed("roles", [customerRole]);

    const result = await registerUser(
      {
        fullName: "Jane Doe",
        email: "jane@example.com",
        phone: "+989121234567",
        password: "secret",
      },
      { userAgent: "ua", ip: "1.2.3.4" },
    );

    expect(result).toEqual({ ok: true });
    expect(mockDb.data.users).toHaveLength(1);
    expect(mockDb.data.users[0]).toMatchObject({
      email: "jane@example.com",
      phone: "+989121234567",
      fullName: "Jane Doe",
      passwordHash: "hash:secret",
    });
    expect(mockDb.data.user_roles).toEqual([
      expect.objectContaining({ userId: mockDb.data.users[0].id, roleId: "r-customer" }),
    ]);
    expect(sessionMock.createSession).toHaveBeenCalledWith(
      mockDb.data.users[0].id,
      "ua",
      "1.2.3.4",
    );
  });

  it("throws CUSTOMER_ROLE_NOT_FOUND when the customer role is missing", async () => {
    await expect(
      registerUser({
        fullName: "Jane Doe",
        email: "jane@example.com",
        phone: "+989121234567",
        password: "secret",
      }),
    ).rejects.toMatchObject({
      code: "CUSTOMER_ROLE_NOT_FOUND",
    });

    // No session should be created, and no user-role assignment.
    expect(mockDb.data.user_roles ?? []).toHaveLength(0);
    expect(sessionMock.createSession).not.toHaveBeenCalled();
  });

  it("returns EMAIL_TAKEN on an email unique-violation error", async () => {
    mockDb.failInsert = () => ({ code: "23505", constraint: "users_email_key" });

    const result = await registerUser({
      fullName: "Jane Doe",
      email: "taken@example.com",
      phone: "+989121234567",
      password: "secret",
    });

    expect(result).toEqual({ ok: false, reason: "EMAIL_TAKEN" });
    expect(sessionMock.createSession).not.toHaveBeenCalled();
  });

  it("returns PHONE_TAKEN on a phone unique-violation error", async () => {
    mockDb.failInsert = () => ({ code: "23505", constraint: "users_phone_idx" });

    const result = await registerUser({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+989121234567",
      password: "secret",
    });

    expect(result).toEqual({ ok: false, reason: "PHONE_TAKEN" });
    expect(sessionMock.createSession).not.toHaveBeenCalled();
  });

  it("propagates unexpected errors", async () => {
    mockDb.failInsert = () => new Error("db is down");

    await expect(
      registerUser({
        fullName: "Jane Doe",
        email: "jane@example.com",
        phone: "+989121234567",
        password: "secret",
      }),
    ).rejects.toThrow("db is down");
  });
});
