"use client";

import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import LandingWizard from "./wizard/LandingWizard";
import type { CollectionKey } from "./types";

export default function LandingItemForm({
  collection,
  initial,
}: {
  collection: CollectionKey;
  initial?: AdminCollectionRow;
}) {
  return <LandingWizard collection={collection} initial={initial} />;
}