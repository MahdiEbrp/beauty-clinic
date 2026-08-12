import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MockDb, Row } from "@/lib/test/mock-db";

const passwordMock = vi.hoisted(() => ({
  hashPassword: vi.fn((plain: string) => `hash:${plain}`),
  verifyPassword: vi.fn(() => true),
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
import { loginUser, registerUser } from "./service";

const mockDb = db as unknown as MockDb;

const baseUser: Row = {
  id: "u1",
  email: "jane@example.com",
  phone: null,
  passwordHash: "hash:secret",
  fullName: "Jane Doe",
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
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
};

beforeEach(() => {
  mockDb.reset();
  passwordMock.verifyPassword.mockResolvedValue(true);
  passwordMock.hashPassword.mockImplementation((plain: string) => `hash:${plain}`);
  sessionMock.createSession.mockClear();
});

describe("loginUser", () => {
  it("returns false and does not create a session for an unknown email", async () => {
    mockDb.seed("users", [baseUser]);
    expect(await loginUser("nobody@example.com", "whatever")).toBe(false);
    expect(sessionMock.createSession).not.toHaveBeenCalled();
    // No failed-attempt update was applied to any user.
    expect(mockDb.data.users[0].failedLoginAttempts).toBe(0);
  });

  it("returns false for an inactive account", async () => {
    mockDb.seed("users", [{ ...baseUser, isActive: false }]);
    expect(await loginUser("jane@example.com", "secret")).toBe(false);
    expect(sessionMock.createSession).not.toHaveBeenCalled();
  });

  it("returns false for a banned account", async () => {
    mockDb.seed("users", [{ ...baseUser, isBanned: true }]);
    expect(await loginUser("jane@example.com", "secret")).toBe(false);
    expect(sessionMock.createSession).not.toHaveBeenCalled();
  });

  it("returns false while the account is locked out", async () => {
    mockDb.seed("users", [
      { ...baseUser, lockedUntil: new Date(Date.now() + 60_000) },
    ]);
    expect(await loginUser("jane@example.com", "secret")).toBe(false);
    expect(passwordMock.verifyPassword).not.toHaveBeenCalled();
  });

  it("increments failed attempts on a wrong password", async () => {
    passwordMock.verifyPassword.mockResolvedValue(false);
    mockDb.seed("users", [baseUser]);

    expect(await loginUser("jane@example.com", "wrong")).toBe(false);
    expect(mockDb.data.users[0]).toMatchObject({
      failedLoginAttempts: 1,
      lockedUntil: null,
    });
    expect(sessionMock.createSession).not.toHaveBeenCalled();
  });

  it("locks the account after five failed attempts", async () => {
    passwordMock.verifyPassword.mockResolvedValue(false);
    mockDb.seed("users", [{ ...baseUser, failedLoginAttempts: 4 }]);

    expect(await loginUser("jane@example.com", "wrong")).toBe(false);
    const user = mockDb.data.users[0];
    expect(user.failedLoginAttempts).toBe(5);
    expect(user.lockedUntil).toBeInstanceOf(Date);
    expect((user.lockedUntil as Date).getTime()).toBeGreaterThan(Date.now());
  });

  it("resets counters and logs in on success", async () => {
    mockDb.seed("users", [
      { ...baseUser, failedLoginAttempts: 3, lockedUntil: new Date() },
    ]);

    const result = await loginUser("jane@example.com", "secret", {
      userAgent: "test-agent",
      ip: "1.2.3.4",
    });

    expect(result).toBe(true);
    expect(mockDb.data.users[0]).toMatchObject({
      failedLoginAttempts: 0,
      lockedUntil: null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test matcher
      lastLoginAt: expect.any(Date),
    });
    expect(sessionMock.createSession).toHaveBeenCalledWith(
      "u1",
      "test-agent",
      "1.2.3.4",
    );
  });
});

describe("registerUser", () => {
  it("creates a user, assigns the customer role and signs them in", async () => {
    mockDb.seed("roles", [
      { id: "r-customer", key: "customer", name: "Customer", createdAt: new Date(), updatedAt: new Date() },
    ]);

    const result = await registerUser(
      { fullName: "Jane Doe", email: "jane@example.com", phone: null, password: "secret" },
      { userAgent: "ua", ip: "1.2.3.4" },
    );

    expect(result).toEqual({ ok: true });
    expect(mockDb.data.users).toHaveLength(1);
    expect(mockDb.data.users[0]).toMatchObject({
      email: "jane@example.com",
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
        phone: null,
        password: "secret",
      }),
    ).rejects.toMatchObject({
      code: "CUSTOMER_ROLE_NOT_FOUND",
    });

    // No session should be created, and no user-role assignment.
    expect(mockDb.data.user_roles ?? []).toHaveLength(0);
    expect(sessionMock.createSession).not.toHaveBeenCalled();
  });

  it("returns EMAIL_TAKEN on a unique-violation error", async () => {
    mockDb.failInsert = () => ({ code: "23505" });

    const result = await registerUser({
      fullName: "Jane Doe",
      email: "taken@example.com",
      phone: null,
      password: "secret",
    });

    expect(result).toEqual({ ok: false, reason: "EMAIL_TAKEN" });
    expect(sessionMock.createSession).not.toHaveBeenCalled();
  });

  it("propagates unexpected errors", async () => {
    mockDb.failInsert = () => new Error("db is down");

    await expect(
      registerUser({
        fullName: "Jane Doe",
        email: "jane@example.com",
        phone: null,
        password: "secret",
      }),
    ).rejects.toThrow("db is down");
  });
});
