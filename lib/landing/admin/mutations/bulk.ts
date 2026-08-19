import "server-only";

import { eq, inArray } from "drizzle-orm";

import { db } from "@/src/db";
import {
  landingAboutStats,
  landingGalleryItems,
  landingMarqueeItems,
  landingServices,
} from "@/src/db/schema";
import { bustLandingCache } from "../../landing";
import type { LandingCollectionKey } from "../types";

function collectionTable(key: LandingCollectionKey): typeof landingMarqueeItems {
  switch (key) {
    case "marquee":
      return landingMarqueeItems;
    case "services":
      return landingServices as unknown as typeof landingMarqueeItems;
    case "stats":
      return landingAboutStats as unknown as typeof landingMarqueeItems;
    case "gallery":
      return landingGalleryItems as unknown as typeof landingMarqueeItems;
  }
}

export async function setCollectionActiveBulk(
  key: LandingCollectionKey,
  ids: string[],
  isActive: boolean,
): Promise<void> {
  if (ids.length === 0) return;
  const table = collectionTable(key);
  await db.update(table).set({ isActive }).where(inArray(table.id, ids));
  await bustLandingCache();
}

export async function deleteCollectionBulk(
  key: LandingCollectionKey,
  ids: string[],
): Promise<void> {
  if (ids.length === 0) return;
  const table = collectionTable(key);
  await db.delete(table).where(inArray(table.id, ids));
  await bustLandingCache();
}

export async function setCollectionActive(
  key: LandingCollectionKey,
  id: string,
  isActive: boolean,
): Promise<void> {
  const table = collectionTable(key);
  await db.update(table).set({ isActive }).where(eq(table.id, id));
  await bustLandingCache();
}