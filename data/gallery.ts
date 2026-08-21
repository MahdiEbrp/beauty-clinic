import { IMG } from "@/lib/images";

export const galleryKeys = [
  "hydrafacial",
  "laserRejuv",
  "microneedling",
  "skinCare",
] as const;

export type GalleryKey = (typeof galleryKeys)[number];

const galleryImages: Record<GalleryKey, string> = {
  hydrafacial: IMG.hydraulically,
  laserRejuv: IMG.skinRejuvenation,
  microneedling: IMG.microneedling,
  skinCare: IMG.care,
};

/**
 * Alt text and captions come from `galleryItems.*` in the message catalogue, so
 * they follow the active locale. They used to be a hardcoded English array,
 * which meant the Persian site shipped English alt text while the four
 * translated `galleryItems` keys were never rendered at all.
 */
export function getGalleryItems() {
  return galleryKeys.map((key) => ({
    key,
    tKey: `galleryItems.${key}` as const,

    image: galleryImages[key],
  }));
}
