/* eslint-disable max-lines */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockDb } from "@/lib/test/mock-db";

import type { WebhookCreateBookingInput } from "./schema";

const hashPasswordMock = vi.hoisted(() => ({
  hashPassword: vi.fn((plain: string) => `hash:${plain}`),
}));

const argon2Mock = vi.hoisted(() => ({
  verify: vi.fn(() => Promise.resolve(true)),
}));

const bookingMock = vi.hoisted(() => ({
  createBookingGroup: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/password", () => hashPasswordMock);
vi.mock("argon2", () => argon2Mock);
vi.mock("@/lib/bookings/service", () => bookingMock);

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

import { db } from "@/src/db";
import {
  authenticateWebhook,
  clearAuthAttemptsForTesting,
  createWebhookBooking,
} from "./service";

const mockDb = db as unknown as MockDb;

const adminRole = {
  id: "r-admin",
  key: "admin",
  name: "Admin",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const receptionistRole = {
  id: "r-receptionist",
  key: "receptionist",
  name: "Receptionist",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const writePerm = {
  id: "p-write",
  key: "appointments.write",
  name: "Write appointments",
  description: "Create and update appointments",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const readPerm = {
  id: "p-read",
  key: "appointments.read",
  name: "Read appointments",
  description: "View appointments",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testUser = {
  id: "u-webhook-user",
  email: "webhook@clinic.com",
  fullName: "Webhook User",
  passwordHash: "hash:SuperSecret1!",
  isActive: true,
  isBanned: false,
};

const inactiveUser = {
  id: "u-inactive",
  email: "inactive@clinic.com",
  fullName: "Inactive User",
  passwordHash: "hash:Secret1!",
  isActive: false,
  isBanned: false,
};

const bannedUser = {
  id: "u-banned",
  email: "banned@clinic.com",
  fullName: "Banned User",
  passwordHash: "hash:Secret1!",
  isActive: true,
  isBanned: true,
};

const noWritePermUser = {
  id: "u-no-write",
  email: "nowrite@clinic.com",
  fullName: "No Write User",
  passwordHash: "hash:Secret1!",
  isActive: true,
  isBanned: false,
};

function seedBaseData(): void {
  mockDb.seed("roles", [adminRole, receptionistRole]);
  mockDb.seed("permissions", [writePerm, readPerm]);
  mockDb.seed("user_roles", [
    { userId: testUser.id, roleId: adminRole.id },
    { userId: inactiveUser.id, roleId: receptionistRole.id },
    { userId: bannedUser.id, roleId: receptionistRole.id },
    { userId: noWritePermUser.id, roleId: receptionistRole.id },
  ]);
  mockDb.seed("role_permissions", [
    { roleId: adminRole.id, permissionId: writePerm.id },
    { roleId: adminRole.id, permissionId: readPerm.id },
    { roleId: receptionistRole.id, permissionId: readPerm.id },
    // receptionist does NOT have appointments.write
  ]);
  mockDb.seed("users", [
    testUser,
    inactiveUser,
    bannedUser,
    noWritePermUser,
  ]);
}

beforeEach(() => {
  mockDb.reset();
  seedBaseData();
  // Clear in-memory auth attempt tracker between tests
  clearAuthAttemptsForTesting();
  hashPasswordMock.hashPassword.mockImplementation(
    (plain: string) => `hash:${plain}`,
  );
  argon2Mock.verify.mockImplementation(() => Promise.resolve(true));
  bookingMock.createBookingGroup.mockImplementation(() => ({
    groupRef: "NF-12345",
    items: [],
    deposit: 1000000,
  }));
});

const validInput: WebhookCreateBookingInput = {
  fullName: "محمد احمدی",
  phone: "+989121234567",
  email: "customer@example.com",
  locale: "fa",
  notes: "تست ایجاد نوبت از طریق وب هووک",
  consultationRequired: false,
  hasAllergies: false,
  isPregnant: false,
  termsAccepted: true,
  items: [
    {
      groupId: "11111111-1111-1111-1111-111111111111",
      slotId: "22222222-2222-2222-2222-222222222222",
      quantity: 1,
    },
  ],
};

describe("authenticateWebhook", () => {
  it("authenticates a valid admin user and returns roles and permissions", async () => {
    const user = await authenticateWebhook(
      `Basic ${Buffer.from("webhook@clinic.com:SuperSecret1!").toString("base64")}`,
    );

    expect(user.id).toBe(testUser.id);
    expect(user.email).toBe(testUser.email);
    expect(user.fullName).toBe(testUser.fullName);
    expect(user.roles).toContain("admin");
    expect(user.permissions).toContain("appointments.write");
    expect(user.permissions).toContain("appointments.read");
  });

  it("rejects missing Authorization header", async () => {
    await expect(authenticateWebhook(null)).rejects.toMatchObject({
      code: "MISSING_AUTH",
      status: 401,
    });
  });

  it("rejects malformed Authorization header", async () => {
    await expect(authenticateWebhook("Bearer token123")).rejects.toMatchObject({
      code: "MISSING_AUTH",
      status: 401,
    });

    await expect(authenticateWebhook("Basic")).rejects.toMatchObject({
      code: "MISSING_AUTH",
      status: 401,
    });

    await expect(authenticateWebhook("Basic dXNlcg==")).rejects.toMatchObject({
      code: "MISSING_AUTH",
      status: 401,
    });
  });

  it("rejects invalid password", async () => {
    argon2Mock.verify.mockImplementation(() => Promise.resolve(false));

    await expect(
      authenticateWebhook(
    // eslint-disable-next-line no-secrets/no-secrets
        `Basic ${Buffer.from("webhook@clinic.com:WrongPassword1!").toString("base64")}`,
      ),
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      status: 401,
    });
  });

  it("rejects non-existent user", async () => {
    await expect(
      authenticateWebhook(
        `Basic ${Buffer.from("nonexistent@clinic.com:SuperSecret1!").toString("base64")}`,
      ),
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      status: 401,
    });
  });

  it("rejects inactive user", async () => {
    await expect(
      authenticateWebhook(
        `Basic ${Buffer.from("inactive@clinic.com:Secret1!").toString("base64")}`,
      ),
    ).rejects.toMatchObject({
      code: "USER_INACTIVE",
      status: 403,
    });
  });

  it("rejects banned user", async () => {
    await expect(
      authenticateWebhook(
        `Basic ${Buffer.from("banned@clinic.com:Secret1!").toString("base64")}`,
      ),
    ).rejects.toMatchObject({
      code: "USER_BANNED",
      status: 403,
    });
  });

  it("locks out after 5 failed attempts", async () => {
    argon2Mock.verify.mockImplementation(() => Promise.resolve(false));

    for (let i = 0; i < 5; i++) {
      await expect(
        authenticateWebhook(
    // eslint-disable-next-line no-secrets/no-secrets
          `Basic ${Buffer.from("webhook@clinic.com:WrongPassword1!").toString("base64")}`,
        ),
      ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    }

    // 6th attempt should be rate-locked
    await expect(
      authenticateWebhook(
        `Basic ${Buffer.from("webhook@clinic.com:SuperSecret1!").toString("base64")}`,
      ),
    ).rejects.toMatchObject({
      code: "AUTH_LOCKED",
      status: 429,
    });
  });

  it("clears failed attempts after successful auth", async () => {
    argon2Mock.verify.mockImplementation(() => Promise.resolve(false));

    // 2 failed attempts
    for (let i = 0; i < 2; i++) {
      try {
        await authenticateWebhook(
    // eslint-disable-next-line no-secrets/no-secrets
          `Basic ${Buffer.from("webhook@clinic.com:WrongPassword1!").toString("base64")}`,
        );
      } catch {}
    }

    // Now a valid password should succeed
    argon2Mock.verify.mockImplementation(() => Promise.resolve(true));
    const user = await authenticateWebhook(
      `Basic ${Buffer.from("webhook@clinic.com:SuperSecret1!").toString("base64")}`,
    );
    expect(user.id).toBe(testUser.id);
  });
});

describe("createWebhookBooking", () => {
  it("creates a booking group successfully for an authorized user", async () => {
    bookingMock.createBookingGroup.mockResolvedValue({
      groupRef: "NF-99999",
      items: [{ id: "b-1", groupRef: "NF-99999", status: "pending" }],
      deposit: 1500000,
    });

    const result = await createWebhookBooking(validInput, testUser.id);

    expect(result.groupRef).toBe("NF-99999");
    expect(result.items).toHaveLength(1);
    expect(result.deposit).toBe(1500000);
    expect(bookingMock.createBookingGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "محمد احمدی",
        phone: "+989121234567",
        email: "customer@example.com",
        termsAccepted: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        items: expect.arrayContaining([
          expect.objectContaining({
            groupId: "11111111-1111-1111-1111-111111111111",
            slotId: "22222222-2222-2222-2222-222222222222",
            quantity: 1,
          }),
        ]),
      }),
    );
  });

  it("passes through null email", async () => {
    const input: WebhookCreateBookingInput = {
      ...validInput,
      email: null,
    };
    bookingMock.createBookingGroup.mockResolvedValue({
      groupRef: "NF-11111",
      items: [],
      deposit: 1000000,
    });

    await createWebhookBooking(input, testUser.id);

    expect(bookingMock.createBookingGroup).toHaveBeenCalledWith(
      expect.objectContaining({ email: null }),
    );
  });

  it("applies defaults for omitted optional fields", async () => {
    const input: WebhookCreateBookingInput = {
      ...validInput,
      notes: undefined,
    };
    bookingMock.createBookingGroup.mockResolvedValue({
      groupRef: "NF-22222",
      items: [],
      deposit: 1000000,
    });

    await createWebhookBooking(input, testUser.id);

    expect(bookingMock.createBookingGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: null,
        consultationRequired: false,
        hasAllergies: false,
        isPregnant: false,
        termsAccepted: true,
      }),
    );
  });

  it("propagates errors from createBookingGroup", async () => {
    const dbError = new Error("SLOT_FULL") as Error & {
      status?: number;
      code?: string;
    };
    dbError.status = 409;
    dbError.code = "SLOT_FULL";
    bookingMock.createBookingGroup.mockRejectedValue(dbError);

    await expect(createWebhookBooking(validInput, testUser.id)).rejects.toThrow(
      "SLOT_FULL",
    );
  });
});
