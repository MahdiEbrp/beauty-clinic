import { describe, expect, it } from "vitest";

import { resolveTarget } from "./guard";
import type { AuthSession } from "@/lib/auth/dal";

const REGULAR_USER: AuthSession = {
  userId: "550e8400-e29b-41d4-a716-446655440001",
  user: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "user@example.com",
    fullName: "Regular User",
    roles: ["customer"],
    permissions: [],
  },
};

const ADMIN_USER: AuthSession = {
  userId: "550e8400-e29b-41d4-a716-446655440002",
  user: {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "admin@example.com",
    fullName: "Admin",
    roles: ["admin"],
    permissions: ["settings.manage"],
  },
};

const OTHER_ID = "550e8400-e29b-41d4-a716-446655440099";

describe("resolveTarget", () => {
  describe("user scope", () => {
    it("returns own id for regular user without userId", () => {
      const result = resolveTarget(REGULAR_USER, "user");
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.targetUserId).toBe(REGULAR_USER.user.id);
        expect(result.scope).toBe("user");
        expect(result.isAdmin).toBe(false);
      }
    });

    it("returns own id for regular user with own userId", () => {
      const result = resolveTarget(REGULAR_USER, "user", REGULAR_USER.user.id);
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.targetUserId).toBe(REGULAR_USER.user.id);
        expect(result.isAdmin).toBe(false);
      }
    });

    it("rejects regular user with someone else's userId", () => {
      const result = resolveTarget(REGULAR_USER, "user", OTHER_ID);
      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.response.status).toBe(403);
      }
    });

    it("returns own id for admin without userId", () => {
      const result = resolveTarget(ADMIN_USER, "user");
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.targetUserId).toBe(ADMIN_USER.user.id);
        expect(result.isAdmin).toBe(true);
      }
    });

    it("returns requested userId for admin with any userId", () => {
      const result = resolveTarget(ADMIN_USER, "user", OTHER_ID);
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.targetUserId).toBe(OTHER_ID);
        expect(result.isAdmin).toBe(true);
      }
    });
  });

  describe("system scope", () => {
    it("allows admin", () => {
      const result = resolveTarget(ADMIN_USER, "system");
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.targetUserId).toBeNull();
        expect(result.scope).toBe("system");
        expect(result.isAdmin).toBe(true);
      }
    });

    it("rejects regular user", () => {
      const result = resolveTarget(REGULAR_USER, "system");
      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.response.status).toBe(403);
      }
    });
  });

  describe("default scope", () => {
    it("defaults to user scope when no scope provided", () => {
      const result = resolveTarget(REGULAR_USER);
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.scope).toBe("user");
      }
    });
  });
});