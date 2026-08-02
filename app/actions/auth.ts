"use server";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/src/db";
import { roles, userRoles, users } from "@/src/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, signupSchema } from "@/lib/validation/user";
import { getLocale } from "next-intl/server";
import { localizedHref } from "@/lib/site";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

export type AuthFormState = {
  error?: string;
  errors?: Record<string, string[] | undefined>;
} | undefined;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

async function requestMeta(): Promise<{ userAgent: string | undefined; ip: string | undefined }> {
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? undefined;
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : undefined;
  return { userAgent, ip };
}

async function redirectHome(): Promise<never> {
  const locale = await getLocale();
  redirect(localizedHref(locale, "/"));
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { fullName, email, phone, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  let userId: string;
  try {
    userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email, phone, fullName, passwordHash })
        .returning({ id: users.id });

      if (!user) throw new Error("Failed to create user");

      const role = await tx.query.roles.findFirst({
        where: eq(roles.key, "customer"),
        columns: { id: true },
      });

      if (role) {
        await tx.insert(userRoles).values({ userId: user.id, roleId: role.id });
      }

      return user.id;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "An account with this email already exists." };
    }
    throw error;
  }

  const { userAgent, ip } = await requestMeta();
  await createSession(userId, userAgent, ip);

  revalidatePath("/");
  await redirectHome();
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const genericError: AuthFormState = { error: "Invalid email or password." };

  const user = await db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.deletedAt)),
  });

  if (!user) return genericError;
  if (!user.isActive || user.isBanned) return genericError;
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) return genericError;

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const now = Date.now();
    const lockedUntil =
      attempts >= MAX_FAILED_LOGIN_ATTEMPTS
        ? new Date(now + LOGIN_LOCKOUT_MS)
        : user.lockedUntil;
    await db
      .update(users)
      .set({ failedLoginAttempts: attempts, lockedUntil })
      .where(eq(users.id, user.id));
    return genericError;
  }

  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  const { userAgent, ip } = await requestMeta();
  await createSession(user.id, userAgent, ip);

  revalidatePath("/");
  await redirectHome();
}

export async function logout(): Promise<void> {
  await destroySession();
  revalidatePath("/");
  redirect("/");
}
