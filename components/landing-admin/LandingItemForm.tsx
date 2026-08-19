"use client";

import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import MarqueeForm from "./forms/MarqueeForm";
import ServiceCardForm from "./forms/ServiceCardForm";
import StatForm from "./forms/StatForm";
import GalleryForm from "./forms/GalleryForm";
import type { CollectionKey } from "./types";

export default function LandingItemForm({
  collection,
  initial,
}: {
  collection: CollectionKey;
  initial?: AdminCollectionRow;
}) {
  switch (collection) {
    case "marquee":
      return <MarqueeForm collection={collection} initial={initial} />;
    case "services":
      return <ServiceCardForm collection={collection} initial={initial} />;
    case "stats":
      return <StatForm collection={collection} initial={initial} />;
    case "gallery":
      return <GalleryForm collection={collection} initial={initial} />;
  }
}