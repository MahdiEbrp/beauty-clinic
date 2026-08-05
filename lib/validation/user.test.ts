import { describe, expect, it } from "vitest";

import {
  listUsersQuerySchema,
  loginSchema,
  signupSchema,
  updateUserStatusSchema,
  createUserSchema,
} from "./user";

const validSignup = {
  fullName: "Jane Doe",
  email: "Jane@Example.COM",
  phone: "+989121234567",
  password: "Correct-Horse-1!",
};

describe("signupSchema", () => {
  it("accepts a valid signup and normalizes email", () => {
    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("jane@example.com");
      expect(result.data.fullName).toBe("Jane Doe");
    }
  });

  it("accepts an empty phone", () => {
    const result = signupSchema.safeParse({ ...validSignup, phone: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBeNull();
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a weak password", () => {
    const result = signupSchema.safeParse({ ...validSignup, password: "weak" });
    expect(result.success).toBe(false);
  });

  it("rejects a password without special characters", () => {
    const result = signupSchema.safeParse({ ...validSignup, password: "CorrectHorse1" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields (mass-assignment protection)", () => {
    const result = signupSchema.safeParse({ ...validSignup, role: "admin" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "Jane@Example.COM", password: "x".repeat(12) });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = loginSchema.safeParse({ email: "jane@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "x".repeat(12),
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("listUsersQuerySchema", () => {
  it("applies defaults for page, perPage and status", () => {
    const result = listUsersQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1, perPage: 10, status: "all" });
    }
  });

  it("coerces numeric query strings", () => {
    const result = listUsersQuerySchema.safeParse({ page: "3", perPage: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.perPage).toBe(25);
    }
  });

  it("trims search and keeps it optional", () => {
    const result = listUsersQuerySchema.safeParse({ search: "  jane  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.search).toBe("jane");
  });

  it("accepts an optional role filter", () => {
    const result = listUsersQuerySchema.safeParse({ role: "admin" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe("admin");
  });

  it("accepts every status filter", () => {
    for (const status of ["all", "active", "inactive", "banned"]) {
      expect(listUsersQuerySchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects an unknown status", () => {
    expect(listUsersQuerySchema.safeParse({ status: "admin" }).success).toBe(false);
  });

  it("rejects perPage above the maximum", () => {
    expect(listUsersQuerySchema.safeParse({ perPage: 51 }).success).toBe(false);
  });

  it("rejects a non-positive page", () => {
    expect(listUsersQuerySchema.safeParse({ page: 0 }).success).toBe(false);
    expect(listUsersQuerySchema.safeParse({ page: -2 }).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(listUsersQuerySchema.safeParse({ sort: "email" }).success).toBe(false);
  });
});

describe("updateUserStatusSchema", () => {
  it("accepts a partial patch", () => {
    const result = updateUserStatusSchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ isActive: false });
  });

  it("accepts a ban with reason and nullish banReason", () => {
    expect(updateUserStatusSchema.safeParse({ isBanned: true, banReason: "spam" }).success).toBe(true);
    expect(updateUserStatusSchema.safeParse({ isBanned: false, banReason: null }).success).toBe(true);
  });

  it("rejects an empty patch (nothing to update)", () => {
    const result = updateUserStatusSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "Nothing to update.")).toBe(true);
    }
  });

  it("rejects unknown fields", () => {
    expect(updateUserStatusSchema.safeParse({ email: "x@y.z" }).success).toBe(false);
  });

  it("rejects a banReason longer than 500 characters", () => {
    const result = updateUserStatusSchema.safeParse({
      isBanned: true,
      banReason: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("createUserSchema", () => {
  it("accepts a complete admin-created user", () => {
    const result = createUserSchema.safeParse({
      fullName: "Jane Doe",
      email: "Jane@Example.COM",
      phone: "",
      password: "Correct-Horse-1!",
      roleKey: "customer",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("jane@example.com");
      expect(result.data.phone).toBeNull();
    }
  });

  it("rejects weak passwords and mass-assigned fields", () => {
    expect(createUserSchema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "",
      password: "weak",
      roleKey: "customer",
      isAdmin: true,
    }).success).toBe(false);
  });
});
