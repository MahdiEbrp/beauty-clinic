import { and, count, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import type {
  ServiceFeaturedFilter,
  ServiceStatusFilter,
} from "@/lib/validation/services-admin";
import { db } from "@/src/db";
import { services, servicesI18n } from "@/src/db/schema";

/**
 * Service-level conditions shared by the paginated admin list and the bulk-id
 * resolver. Searches the slug as well as the bilingual titles so the UI and
 * bulk actions stay consistent with `listServices`.
 */
function serviceListConditions(opts: {
  search?: string;
  status?: ServiceStatusFilter;
  featured?: ServiceFeaturedFilter;
  categoryId?: string;
}): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(services.slug, term),
        sql`exists (
          select 1 from ${servicesI18n}
          where ${servicesI18n.serviceId} = ${services.id}
            and ${servicesI18n.title} ilike ${term}
        )`,
      ),
    );
  }
  if (opts.categoryId) conditions.push(eq(services.categoryId, opts.categoryId));
  if (opts.status === "active") conditions.push(eq(services.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(services.isActive, false));
  if (opts.featured === "yes") conditions.push(eq(services.isFeatured, true));
  else if (opts.featured === "no") conditions.push(eq(services.isFeatured, false));
  return conditions;
}

/** Returns the service ids matching the given filters (used for bulk actions). */
export async function findServiceIds(opts: {
  search?: string;
  status?: ServiceStatusFilter;
  featured?: ServiceFeaturedFilter;
  categoryId?: string;
}): Promise<string[]> {
  const where = and(...serviceListConditions(opts));
  const rows = await db
    .select({ id: services.id })
    .from(services)
    .where(where);
  return rows.map((row) => row.id);
}

/** Total count of services matching the given filters. */
export async function countServiceIds(opts: {
  search?: string;
  status?: ServiceStatusFilter;
  featured?: ServiceFeaturedFilter;
  categoryId?: string;
}): Promise<number> {
  const where = and(...serviceListConditions(opts));
  const [row] = await db.select({ value: count() }).from(services).where(where);
  return row?.value ?? 0;
}
