import { count, sql } from "drizzle-orm";
import type { AnyPgTable, PgColumn } from "drizzle-orm/pg-core";

import { db } from "@/src/db";
import { serviceCategories, serviceGroups, services } from "@/src/db/schema";

export type PerformanceCounts = {
  total: number;
  active: number;
};

export type PerformanceViewData = {
  totalAssets: number;
  groups: PerformanceCounts;
  categories: PerformanceCounts;
  services: PerformanceCounts;
};

const RETRYABLE_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ECONNABORTED",
  "EPIPE",
  "UND_ERR_SOCKET",
]);

function isRetryableConnectionError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code
    ?? (error as { cause?: { code?: unknown } })?.cause?.code;
  return typeof code === "string" && RETRYABLE_CODES.has(code);
}

async function countRows(table: AnyPgTable, isActive: PgColumn): Promise<PerformanceCounts> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const [row] = await db
        .select({
          total: count(),
          active: sql<number>`coalesce(sum(case when ${isActive} then 1 else 0 end), 0)::int`,
        })
        .from(table);

      return {
        total: row?.total ?? 0,
        active: row?.active ?? 0,
      };
    } catch (error) {
      if (attempt >= 1 || !isRetryableConnectionError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}

export async function getPerformanceView(): Promise<PerformanceViewData> {
  const [groups, categories, serviceCounts] = await Promise.all([
    countRows(serviceGroups, serviceGroups.isActive),
    countRows(serviceCategories, serviceCategories.isActive),
    countRows(services, services.isActive),
  ]);

  return {
    totalAssets: groups.total + categories.total + serviceCounts.total,
    groups,
    categories,
    services: serviceCounts,
  };
}