import { randomBytes } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import type { db } from "@/src/db";
import { roles, userRoles, users } from "@/src/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Host used for the auto-generated placeholder customer email. */
export const AUTO_CUSTOMER_EMAIL_HOST = "email.com";

/** Digits only — the canonical key we store for phone-based customers. */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Unique placeholder email derived from the (normalized) phone number. */
export function autoCustomerEmail(phone: string, host = AUTO_CUSTOMER_EMAIL_HOST): string {
  const local = phoneDigits(phone) || randomBytes(4).toString("hex");
  return `${local}@${host}`;
}

/**
 * Ensures a customer user exists for a phone number and returns its id.
 * Must run inside the caller's transaction so a failed order never leaves an
 * orphan account behind:
 *  - an existing (non-deleted) user with that phone is reused as-is,
 *  - otherwise a new `customer` user is created with an auto email
 *    (`{digits}@{host}`), the caller's name, and an unrecoverable random
 *    password. Email uniqueness is pre-checked; if the synthetic address is
 *    already taken by a manually created user, a short suffix is appended.
 */
export async function ensureCustomerUser(
  tx: Tx,
  input: { phone: string; fullName: string; email?: string | null },
): Promise<string> {
  const phone = phoneDigits(input.phone);
  const existing = await tx
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.phone, phone), isNull(users.deletedAt)))
    .limit(1);
  if (existing[0]) return existing[0].id;

  let email =
    input.email?.trim() && phoneDigits(input.email) !== phone ? input.email.trim() : autoCustomerEmail(phone);
  const [emailTaken] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (emailTaken) {
    email = `${phoneDigits(phone)}.${randomBytes(3).toString("hex")}@${AUTO_CUSTOMER_EMAIL_HOST}`;
  }

  const password = randomBytes(24).toString("base64url");
  const passwordHash = await hashPassword(password);

  const created = await tx
    .insert(users)
    .values({
      email,
      phone,
      fullName: input.fullName.trim() || `Customer ${phone.slice(-4)}`,
      passwordHash,
      isActive: true,
    })
    .onConflictDoNothing({ target: users.phone, where: isNull(users.deletedAt) })
    .returning({ id: users.id });

  const id =
    created[0]?.id ??
    (await tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.phone, phone), isNull(users.deletedAt)))
      .limit(1))[0]?.id;
  if (!id) {
    throw new ApiError(500, "CUSTOMER_CREATE_FAILED", "Could not create the customer account.");
  }

  const [role] = await tx
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.key, "customer"))
    .limit(1);
  if (role) {
    await tx
      .insert(userRoles)
      .values({ userId: id, roleId: role.id })
      .onConflictDoNothing();
  }
  return id;
}