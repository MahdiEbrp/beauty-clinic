import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/src/db";
import { users, userRoles, roles, rolePermissions, permissions } from "@/src/db/schema";
import { ApiError } from "@/lib/api/errors";
import { hashPassword } from "@/lib/auth/password";
import { logInfo } from "@/lib/log";
import { createBookingGroup } from "@/lib/bookings/service";
import type {
  WebhookCreateBookingInput,
  WebhookListBookingsQuery,
  WebhookUpdateBookingInput,
} from "./schema";
import {
  webhookListBookingsQuerySchema,
  webhookUpdateBookingSchema,
  webhookCreateServiceGroupSchema,
  webhookUpdateServiceGroupSchema,
  webhookCreateServiceCategorySchema,
  webhookUpdateServiceCategorySchema,
  webhookCreateServiceSchema,
  webhookUpdateServiceSchema,
  webhookCreateUserSchema,
  webhookUpdateUserStatusSchema,
  webhookListUsersQuerySchema,
  webhookCreateWorkingHourSchema,
  webhookUpdateWorkingHourSchema,
  webhookListWorkingHoursQuerySchema,
  webhookCreateSettingSchema,
  webhookUpdateSettingSchema,
  webhookListSettingsQuerySchema,
  webhookCreateRuleSchema,
  webhookUpdateRuleSchema,
  webhookListRulesQuerySchema,
  webhookCreateCareGuideSchema,
  webhookUpdateCareGuideSchema,
  webhookListCareGuidesQuerySchema,
  webhookCreateCareGuideItemSchema,
  webhookUpdateCareGuideItemSchema,
  webhookListCareGuideItemsQuerySchema,
} from "./schema";
import type {
  WebhookCreateServiceGroupInput,
  WebhookUpdateServiceGroupInput,
  WebhookCreateServiceCategoryInput,
  WebhookUpdateServiceCategoryInput,
  WebhookCreateServiceInput,
  WebhookUpdateServiceInput,
  WebhookListServicesQuery,
  WebhookCreateUserInput,
  WebhookUpdateUserStatusInput,
  WebhookListUsersQuery,
  WebhookCreateWorkingHourInput,
  WebhookUpdateWorkingHourInput,
  WebhookListWorkingHoursQuery,
  WebhookCreateSettingInput,
  WebhookUpdateSettingInput,
  WebhookListSettingsQuery,
  WebhookCreateRuleInput,
  WebhookUpdateRuleInput,
  WebhookListRulesQuery,
  WebhookCreateCareGuideInput,
  WebhookUpdateCareGuideInput,
  WebhookListCareGuidesQuery,
  WebhookCreateCareGuideItemInput,
  WebhookUpdateCareGuideItemInput,
  WebhookListCareGuideItemsQuery,
} from "./schema";

/* ─────────────────────────────────────────────────────────────
 * Auth (existing)
 * ───────────────────────────────────────────────────────────── */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

const failedAttempts = new Map<string, { count: number; firstAt: number }>();

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(key);
  if (!entry || now - entry.firstAt > LOCKOUT_WINDOW_MS) {
    failedAttempts.set(key, { count: 1, firstAt: now });
  } else {
    entry.count += 1;
    failedAttempts.set(key, entry);
  }
}

function getFailedAttempts(key: string): { count: number; firstAt: number } | undefined {
  const entry = failedAttempts.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.firstAt > LOCKOUT_WINDOW_MS) {
    failedAttempts.delete(key);
    return undefined;
  }
  return entry;
}

function clearFailedAttempts(key: string): void {
  failedAttempts.delete(key);
}

export function clearAuthAttemptsForTesting(): void {
  failedAttempts.clear();
}

function parseBasicAuth(
  authorization: string | null,
): { username: string; password: string } | null {
  if (!authorization || !authorization.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf-8");
    const colonIndex = decoded.indexOf(":");
    if (colonIndex <= 0) return null;
    return {
      username: decoded.slice(0, colonIndex),
      password: decoded.slice(colonIndex + 1),
    };
  } catch {
    return null;
  }
}

async function authenticateUser(
  username: string,
  password: string,
): Promise<{
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      isBanned: users.isBanned,
    })
    .from(users)
    .where(
      and(
        eq(users.email, username),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);

  const dummyHash =
    "$argon2id$v=19$m=19456,t=2,p=1$dGVzdHNhbHQ$dummyhashvaluefornotfounduser";
  void dummyHash;

  const userRecord = user;
  if (!userRecord || !userRecord.passwordHash) {
    await hashPassword(password);
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid username or password.");
  }

  if (!userRecord.isActive) {
    throw new ApiError(403, "USER_INACTIVE", "This account is deactivated.");
  }

  if (userRecord.isBanned) {
    throw new ApiError(403, "USER_BANNED", "This account is banned.");
  }

  const { verify } = await import("argon2");
  const valid = await verify(userRecord.passwordHash, password).catch(() => false);
  if (!valid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid username or password.");
  }

  const roleRows = await db
    .select({ roleKey: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userRecord.id));

  const permRows = await db
    .select({ permissionKey: permissions.key })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userRecord.id));

  const roleSet = new Set<string>();
  const permissionSet = new Set<string>();
  for (const row of roleRows) roleSet.add(row.roleKey);
  for (const row of permRows) if (row.permissionKey) permissionSet.add(row.permissionKey);

  return {
    id: userRecord.id,
    email: userRecord.email,
    fullName: userRecord.fullName,
    roles: [...roleSet],
    permissions: [...permissionSet],
  };
}

export async function authenticateWebhook(
  authorization: string | null,
): Promise<{
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}> {
  const creds = parseBasicAuth(authorization);
  if (!creds) {
    throw new ApiError(401, "MISSING_AUTH", "Authorization header with Basic credentials is required.");
  }

  const rateKey = `webhook:auth:${creds.username}`;
  const attempts = getFailedAttempts(rateKey);
  if (attempts && attempts.count >= MAX_FAILED_ATTEMPTS) {
    throw new ApiError(429, "AUTH_LOCKED", "Too many failed attempts. Try again later.");
  }

  try {
    const user = await authenticateUser(creds.username, creds.password);
    clearFailedAttempts(rateKey);
    return user;
  } catch (error) {
    recordFailedAttempt(rateKey);
    throw error;
  }
}

/* ─────────────────────────────────────────────────────────────
 * Bookings
 * ───────────────────────────────────────────────────────────── */

export async function createWebhookBooking(
  input: WebhookCreateBookingInput,
  actorUserId: string,
): Promise<{
  groupRef: string;
  items: Awaited<ReturnType<typeof createBookingGroup>>["items"];
  deposit: number;
}> {
  const result = await createBookingGroup({
    fullName: input.fullName,
    phone: input.phone,
    email: input.email ?? null,
    locale: input.locale,
    notes: input.notes ?? null,
    consultationRequired: input.consultationRequired ?? false,
    hasAllergies: input.hasAllergies ?? false,
    isPregnant: input.isPregnant ?? false,
    termsAccepted: input.termsAccepted,
    items: input.items.map((item) => ({
      groupId: item.groupId,
      slotId: item.slotId,
      quantity: item.quantity,
    })),
  });

  logInfo("webhook.booking_created", {
    actorUserId,
    groupRef: result.groupRef,
    itemCount: result.items.length,
  });

  return result;
}

export async function listWebhookBookings(
  query: WebhookListBookingsQuery,
  actorUserId: string,
) {
  const { listBookings } = await import("@/lib/bookings/service");
  const parsed = webhookListBookingsQuerySchema.safeParse(query);
  if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Invalid query parameters.");
  return listBookings(parsed.data);
}

export async function getWebhookBooking(id: string, actorUserId: string) {
  const { getBooking } = await import("@/lib/bookings/service");
  return getBooking(id);
}

export async function updateWebhookBooking(
  id: string,
  input: WebhookUpdateBookingInput,
  actorUserId: string,
) {
  const { updateBookingDetails } = await import("@/lib/bookings/service");
  const parsed = webhookUpdateBookingSchema.safeParse(input);
  if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body.");
  return updateBookingDetails(id, parsed.data);
}

export async function deleteWebhookBooking(id: string, actorUserId: string) {
  const { deleteBooking } = await import("@/lib/bookings/service");
  return deleteBooking(id);
}

/* ─────────────────────────────────────────────────────────────
 * Services
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookServices(
  query: WebhookListServicesQuery,
  actorUserId: string,
) {
  const { listServices } = await import("@/lib/services/services");
  return listServices(query);
}

export async function getWebhookService(id: string, actorUserId: string) {
  const { getService } = await import("@/lib/services/services");
  return getService(id);
}

export async function createWebhookService(
  input: WebhookCreateServiceInput,
  actorUserId: string,
) {
  const { createService } = await import("@/lib/services/service-mutations");
  return createService(input);
}

export async function updateWebhookService(
  id: string,
  input: WebhookUpdateServiceInput,
  actorUserId: string,
) {
  const { updateService } = await import("@/lib/services/service-mutations");
  return updateService(id, input);
}

export async function deleteWebhookService(id: string, actorUserId: string) {
  const { deleteService } = await import("@/lib/services/service-mutations");
  return deleteService(id);
}

/* ─────────────────────────────────────────────────────────────
 * Service groups
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookServiceGroups(
  query: { page?: number; perPage?: number; search?: string; status?: string },
  actorUserId: string,
) {
  const { listServiceGroups } = await import("@/lib/services/groups");
  return listServiceGroups({
    page: query.page ?? 1,
    perPage: query.perPage ?? 20,
    search: query.search,
    status: query.status as any,
  });
}

export async function getWebhookServiceGroup(id: string, actorUserId: string) {
  const { getGroup } = await import("@/lib/services/groups");
  return getGroup(id);
}

export async function createWebhookServiceGroup(
  input: WebhookCreateServiceGroupInput,
  actorUserId: string,
) {
  const { createGroup } = await import("@/lib/services/groups");
  return createGroup(input);
}

export async function updateWebhookServiceGroup(
  id: string,
  input: WebhookUpdateServiceGroupInput,
  actorUserId: string,
) {
  const { updateGroup } = await import("@/lib/services/groups");
  return updateGroup(id, input);
}

export async function deleteWebhookServiceGroup(id: string, actorUserId: string) {
  const { deleteGroup } = await import("@/lib/services/groups");
  return deleteGroup(id);
}

/* ─────────────────────────────────────────────────────────────
 * Service categories
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookServiceCategories(
  query: { page?: number; perPage?: number; search?: string; status?: string },
  actorUserId: string,
) {
  const { listServiceCategories } = await import("@/lib/services/categories-admin");
  return listServiceCategories({
    page: query.page ?? 1,
    perPage: query.perPage ?? 20,
    search: query.search,
    status: query.status as any,
  });
}

export async function getWebhookServiceCategory(id: string, actorUserId: string) {
  const { getCategory } = await import("@/lib/services/categories");
  return getCategory(id);
}

export async function createWebhookServiceCategory(
  input: WebhookCreateServiceCategoryInput,
  actorUserId: string,
) {
  const { createCategory } = await import("@/lib/services/categories");
  return createCategory(input);
}

export async function updateWebhookServiceCategory(
  id: string,
  input: WebhookUpdateServiceCategoryInput,
  actorUserId: string,
) {
  const { updateCategory } = await import("@/lib/services/categories");
  return updateCategory(id, input);
}

export async function deleteWebhookServiceCategory(id: string, actorUserId: string) {
  const { deleteCategory } = await import("@/lib/services/categories");
  return deleteCategory(id);
}

/* ─────────────────────────────────────────────────────────────
 * Users
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookUsers(
  query: WebhookListUsersQuery,
  actorUserId: string,
) {
  const { listUsers } = await import("@/lib/users/service");
  return listUsers(query);
}

export async function createWebhookUser(
  input: WebhookCreateUserInput,
  actorUserId: string,
  actorPermissions: string[],
) {
  const { createUser } = await import("@/lib/users/service");
  return createUser(input, actorPermissions);
}

export async function updateWebhookUserStatus(
  id: string,
  input: WebhookUpdateUserStatusInput,
  actorUserId: string,
) {
  const { updateUserStatus } = await import("@/lib/users/service");
  return updateUserStatus(id, input);
}

export async function deleteWebhookUser(id: string, actorUserId: string) {
  const { softDeleteUser } = await import("@/lib/users/service");
  return softDeleteUser(id);
}

/* ─────────────────────────────────────────────────────────────
 * Working hours
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookWorkingHours(
  query: WebhookListWorkingHoursQuery,
  actorUserId: string,
) {
  const { listWorkingHoursAdmin } = await import("@/lib/bookings/working-hours-admin");
  return listWorkingHoursAdmin({
    page: query.page,
    perPage: query.perPage,
    search: query.search,
    status: query.status,
  });
}

export async function getWebhookWorkingHour(id: string, actorUserId: string) {
  const { getWorkingHour } = await import("@/lib/bookings/working-hours-admin");
  return getWorkingHour(id);
}

export async function createWebhookWorkingHour(
  input: WebhookCreateWorkingHourInput,
  actorUserId: string,
) {
  const { createWorkingHour } = await import("@/lib/bookings/working-hours-admin");
  return createWorkingHour(input);
}

export async function updateWebhookWorkingHour(
  id: string,
  input: WebhookUpdateWorkingHourInput,
  actorUserId: string,
) {
  const { updateWorkingHour } = await import("@/lib/bookings/working-hours-admin");
  return updateWorkingHour(id, input);
}

export async function deleteWebhookWorkingHour(id: string, actorUserId: string) {
  const { deleteWorkingHour } = await import("@/lib/bookings/working-hours-admin");
  return deleteWorkingHour(id);
}

/* ─────────────────────────────────────────────────────────────
 * Settings
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookSettings(
  query: WebhookListSettingsQuery,
  actorUserId: string,
) {
  const { listSystemSettings } = await import("@/lib/settings/admin");
  return listSystemSettings(query);
}

export async function getWebhookSetting(id: string, actorUserId: string) {
  const { getSystemSettingById } = await import("@/lib/settings/admin");
  return getSystemSettingById(id);
}

export async function createWebhookSetting(
  input: WebhookCreateSettingInput,
  actorUserId: string,
) {
  const { createSystemSetting } = await import("@/lib/settings/admin");
  return createSystemSetting(input);
}

export async function updateWebhookSetting(
  id: string,
  input: WebhookUpdateSettingInput,
  actorUserId: string,
) {
  const { updateSystemSetting } = await import("@/lib/settings/admin");
  return updateSystemSetting(id, input);
}

export async function deleteWebhookSetting(id: string, actorUserId: string) {
  const { deleteSystemSetting } = await import("@/lib/settings/admin");
  return deleteSystemSetting(id);
}

/* ─────────────────────────────────────────────────────────────
 * Rules
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookRules(
  query: WebhookListRulesQuery,
  actorUserId: string,
) {
  const { listRulesAdmin } = await import("@/lib/services/rules-admin");
  return listRulesAdmin(query);
}

export async function getWebhookRule(id: string, actorUserId: string) {
  const { getRule } = await import("@/lib/services/rules");
  return getRule(id);
}

export async function createWebhookRule(
  input: WebhookCreateRuleInput,
  actorUserId: string,
) {
  const { createRule } = await import("@/lib/services/rules");
  return createRule(input);
}

export async function updateWebhookRule(
  id: string,
  input: WebhookUpdateRuleInput,
  actorUserId: string,
) {
  const { updateRule } = await import("@/lib/services/rules");
  return updateRule(id, input);
}

export async function deleteWebhookRule(id: string, actorUserId: string) {
  const { deleteRule } = await import("@/lib/services/rules");
  return deleteRule(id);
}

/* ─────────────────────────────────────────────────────────────
 * Care guides
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookCareGuides(
  query: WebhookListCareGuidesQuery,
  actorUserId: string,
) {
  const { listCareGuidesAdmin } = await import("@/lib/services/care-guides");
  return listCareGuidesAdmin(query);
}

export async function getWebhookCareGuide(id: string, actorUserId: string) {
  const { getCareGuide } = await import("@/lib/services/care-guides");
  return getCareGuide(id);
}

export async function createWebhookCareGuide(
  input: WebhookCreateCareGuideInput,
  actorUserId: string,
) {
  const { createCareGuide } = await import("@/lib/services/care-guides");
  return createCareGuide(input);
}

export async function updateWebhookCareGuide(
  id: string,
  input: WebhookUpdateCareGuideInput,
  actorUserId: string,
) {
  const { updateCareGuide } = await import("@/lib/services/care-guides");
  return updateCareGuide(id, input);
}

export async function deleteWebhookCareGuide(id: string, actorUserId: string) {
  const { deleteCareGuide } = await import("@/lib/services/care-guides");
  return deleteCareGuide(id);
}

/* ─────────────────────────────────────────────────────────────
 * Care guide items
 * ───────────────────────────────────────────────────────────── */

export async function listWebhookCareGuideItems(
  query: WebhookListCareGuideItemsQuery,
  actorUserId: string,
) {
  const { listCareGuideItemsAdmin } = await import("@/lib/services/care-guide-items");
  return listCareGuideItemsAdmin(query);
}

export async function getWebhookCareGuideItem(id: string, actorUserId: string) {
  const { getCareGuideItem } = await import("@/lib/services/care-guide-items");
  return getCareGuideItem(id);
}

export async function createWebhookCareGuideItem(
  input: WebhookCreateCareGuideItemInput,
  actorUserId: string,
) {
  const { createCareGuideItem } = await import("@/lib/services/care-guide-items");
  return createCareGuideItem(input);
}

export async function updateWebhookCareGuideItem(
  id: string,
  input: WebhookUpdateCareGuideItemInput,
  actorUserId: string,
) {
  const { updateCareGuideItem } = await import("@/lib/services/care-guide-items");
  return updateCareGuideItem(id, input);
}

export async function deleteWebhookCareGuideItem(id: string, actorUserId: string) {
  const { deleteCareGuideItem } = await import("@/lib/services/care-guide-items");
  return deleteCareGuideItem(id);
}
