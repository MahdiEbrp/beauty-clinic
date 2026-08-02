import { describe, expect, it } from "vitest";

import { hasAllRoles, hasAnyPermission, hasPermission, hasRole } from "./rbac";

describe("hasRole", () => {
  it("matches any of the allowed roles", () => {
    expect(hasRole(["customer"], "admin", "customer")).toBe(true);
  });

  it("returns false when no role matches", () => {
    expect(hasRole(["customer"], "admin")).toBe(false);
  });

  it("returns false for an empty role list", () => {
    expect(hasRole([], "admin")).toBe(false);
  });
});

describe("hasAllRoles", () => {
  it("requires every role", () => {
    expect(hasAllRoles(["admin", "doctor"], "admin", "doctor")).toBe(true);
  });

  it("returns false when a role is missing", () => {
    expect(hasAllRoles(["admin"], "admin", "doctor")).toBe(false);
  });
});

describe("hasPermission", () => {
  it("matches a single required permission", () => {
    expect(hasPermission(["users.read", "users.write"], "users.read")).toBe(true);
  });

  it("requires every permission when given a list", () => {
    expect(hasPermission(["users.read", "users.write"], ["users.read", "users.write"])).toBe(true);
    expect(hasPermission(["users.read"], ["users.read", "users.write"])).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("matches when at least one candidate is present", () => {
    expect(hasAnyPermission(["users.read"], ["appointments.read", "users.read"])).toBe(true);
  });

  it("returns false when none are present", () => {
    expect(hasAnyPermission(["users.read"], ["appointments.read"])).toBe(false);
  });
});
