import { and, eq, inArray } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";
import { services, servicesI18n } from "@/src/db/schema";
import type { Locale } from "@/lib/services/types";

import { toMoney } from "./money";

export type ServiceSnapshot = {
  title: string;
  price: number;
  currency: string;
  durationMin: number | null;
  sessionsCount: number;
};

/** Batched service snapshots for a whole order (one query, no N+1). */
export async function snapshotServices(
  serviceIds: string[],
  locale: Locale,
): Promise<Map<string, ServiceSnapshot>> {
  const map = new Map<string, ServiceSnapshot>();
  const unique = [...new Set(serviceIds)];
  if (unique.length === 0) return map;

  const settings = await loadSystemSettingsMap();
  const currency = (settings.get("booking.currency") as string) ?? "تومان";

  const rows = await db
    .select({
      id: services.id,
      title: servicesI18n.title,
      price: services.price,
      durationMin: services.durationMin,
      sessionsCount: services.sessionsCount,
      isActive: services.isActive,
    })
    .from(services)
    .innerJoin(
      servicesI18n,
      and(eq(servicesI18n.serviceId, services.id), eq(servicesI18n.locale, locale)),
    )
    .where(inArray(services.id, unique));

  for (const row of rows) {
    if (!row.isActive) {
      throw new ApiError(409, "SERVICE_UNAVAILABLE", "This service is not available for booking.");
    }
    map.set(row.id, {
      title: row.title,
      price: toMoney(row.price),
      currency,
      durationMin: row.durationMin,
      sessionsCount: row.sessionsCount,
    });
  }

  for (const id of unique) {
    if (!map.has(id)) throw new ApiError(404, "BOOKING_NOT_FOUND", "Service not found.");
  }
  return map;
}

