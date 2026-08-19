import "server-only";

import { and, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { db } from "@/src/db";
import { landingPages, landingSections } from "@/src/db/schema";
import { ApiError } from "@/lib/api/errors";
import { getCollectionRow } from "../queries";
import type { LandingCollectionKey } from "../types";

export type Locale = "fa" | "en";
export const LOCALES: Locale[] = ["fa", "en"];

export async function eachLocale(fn: (l: Locale) => unknown): Promise<void> {
  for (const l of LOCALES) {
    await fn(l);
  }
}

export async function findHomePageId(): Promise<string> {
  const [page] = await db
    .select({ id: landingPages.id })
    .from(landingPages)
    .where(eq(landingPages.slug, "home"))
    .limit(1);
  if (!page) throw new ApiError(404, "LANDING_NOT_FOUND", "Landing page not found.");
  return page.id;
}

export async function sectionIdByKey(pageId: string, key: string): Promise<string> {
  const [section] = await db
    .select({ id: landingSections.id })
    .from(landingSections)
    .where(and(eq(landingSections.landingPageId, pageId), eq(landingSections.key, key)))
    .limit(1);
  if (!section) throw new ApiError(404, "LANDING_SECTION_NOT_FOUND", "Landing section not found.");
  return section.id;
}

export function genKey(prefix: string): string {
  return `${prefix}-${randomBytes(4).toString("hex")}`;
}

export async function ensureRow(key: LandingCollectionKey, id: string): Promise<void> {
  await getCollectionRow(key, id);
}
