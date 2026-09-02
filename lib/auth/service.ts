import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import { roles, userRoles, users } from "@/src/db/schema";
import { ApiError } from "@/lib/api/errors";
import { hashPassword } from "./password";
import { createSession } from "./session";
import type { SignupInput } from "@/lib/validation/user";

export type LoginMeta = {
  userAgent?: string;
  ip?: string;
};

export type RegisterResult =
  | { ok: true }
  | { ok: false; reason: "EMAIL_TAKEN" | "PHONE_TAKEN" };

/** Which unique column a Postgres 23505 violation hit, if it is ours. */
function uniqueViolationField(error: unknown): "email" | "phone" | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    (error as { code?: string }).code !== "23505"
  ) {
    return null;
  }
  const constraint = (error as { constraint?: string }).constraint;
  if (constraint && constraint.includes("phone")) return "phone";
  return constraint && constraint.includes("email") ? "email" : null;
}

/**
 * Creates a customer account and signs the new user in (sets the session
 * cookie). Returns `EMAIL_TAKEN` / `PHONE_TAKEN` when the email or phone is
 * already in use; any other failure propagates to the caller.
 */
export async function registerUser(
  input: SignupInput,
  meta?: LoginMeta,
): Promise<RegisterResult> {
  const passwordHash = await hashPassword(input.password);

  try {
    const userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          phone: input.phone,
          fullName: input.fullName,
          passwordHash,
        })
        .returning({ id: users.id });

      if (!user) throw new Error("Failed to create user");

      const role = await tx.query.roles.findFirst({
        where: eq(roles.key, "customer"),
        columns: { id: true },
      });

      // A registered account without the customer role is unusable (no
      // permissions, invisible to the dashboard), and silently creating one
      // would hide a misconfigured seed. Fail loudly and roll back the insert.
      if (!role) {
        throw new ApiError(
          500,
          "CUSTOMER_ROLE_NOT_FOUND",
          "The customer role is not configured.",
        );
      }

      await tx.insert(userRoles).values({ userId: user.id, roleId: role.id });

      return user.id;
    });

    await createSession(userId, meta?.userAgent, meta?.ip);
    return { ok: true };
  } catch (error) {
    const field = uniqueViolationField(error);
    if (field === "phone") return { ok: false, reason: "PHONE_TAKEN" };
    if (field === "email") return { ok: false, reason: "EMAIL_TAKEN" };
    throw error;
  }
}
