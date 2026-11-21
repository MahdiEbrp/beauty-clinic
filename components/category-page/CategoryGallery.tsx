"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { asTranslate } from "@/src/i18n/message-key";
import type { CategoryPageCategory } from "@/lib/services/category-page";

interface CategoryGalleryProps {
  category: CategoryPageCategory;
}

/**
 * Treatment photo gallery for a service category: shows the cover image plus
 * every before/after/gallery photo across the category's services, with a
 * lightbox for closer inspection. No price, brand or booking UI here.
 */
export default function CategoryGallery({ category }: CategoryGalleryProps) {
  const t = useTranslations("categoryPage");
  const gt = useTranslations("gallery");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isOpen = lightboxIndex !== null;

  // The category image is its hero/gallery image. Service cover images are
  // already rendered alongside their descriptions in CategoryDetails.
  const items: { key: string; imageUrl: string; caption: string | null; alt: string }[] = [
    ...(category.image
      ? [{ key: "category-image", imageUrl: category.image, caption: null, alt: category.title }]
      : []),
    ...category.services.flatMap((service, sIndex) =>
      service.images.map((image, i) => ({
        key: `${image.type}-${i}-${sIndex}`,
        imageUrl: image.imageUrl,
        caption: null,
        alt: service.title,
      })),
    ),
  ];

  if (items.length === 0) return null;

  const active = isOpen && lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <section aria-labelledby="category-gallery-heading" className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <Camera className="size-5 text-copper" aria-hidden="true" />
        <h2 id="category-gallery-heading" className="text-lg font-bold tracking-tight text-accent">
          {t("gallery.heading")}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setLightboxIndex(index)}
            aria-label={gt("viewImage", { title: item.alt }) ?? "مشاهده تصویر"}
            className="relative aspect-square rounded-panel overflow-hidden border border-border-interactive bg-surface-secondary group"
          >
            <img
              src={item.imageUrl}
              alt={item.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </button>
        ))}
      </div>

      <GalleryLightbox
        open={isOpen}
        active={active}
        items={items}
        rotation={0}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null);
        }}
        onNavigate={() => {}}
        onRotateLeft={() => {}}
        onRotateRight={() => {}}
        onSelect={(index) => setLightboxIndex(index)}
        t={asTranslate(gt)}
      />
    </section>
  );
}
