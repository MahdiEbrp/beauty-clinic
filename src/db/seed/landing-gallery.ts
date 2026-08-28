import type { SeedGalleryItem } from "./landing-content";
import { IMG } from "./images";

/**
 * Landing page transformation gallery.
 *
 * Kept in its own module so landing-content.ts stays under the 300-line cap.
 * Treat these as the primary showcase of real service photos; all images
 * load from Vercel Blob.
 */
export const LANDING_GALLERY_ITEMS: SeedGalleryItem[] = [
  {
    imageUrl: IMG.microneedling,
    i18n: { en: { alt: "Microneedling", caption: "Microneedling" }, fa: { alt: "میکرونیدلینگ", caption: "میکرونیدلینگ" } },
  },
  {
    imageUrl: IMG.skinRejuvenation,
    i18n: {
      en: { alt: "Skin Rejuvenation", caption: "Skin Rejuvenation" },
      fa: { alt: "جوان‌سازی پوست", caption: "جوان‌سازی پوست" },
    },
  },
  {
    imageUrl: IMG.filler,
    i18n: {
      en: { alt: "Facial Filler", caption: "Facial Filler" },
      fa: { alt: "فیلر صورت", caption: "فیلر صورت" },
    },
  },
  {
    imageUrl: IMG.mesotherapy,
    i18n: {
      en: { alt: "Mesotherapy", caption: "Mesotherapy" },
      fa: { alt: "مزوتراپی", caption: "مزوتراپی" },
    },
  },
  {
    imageUrl: IMG.laserHairRemoval,
    i18n: {
      en: { alt: "Laser Hair Removal", caption: "Laser Hair Removal" },
      fa: { alt: "لیزر موهای زائد", caption: "لیزر موهای زائد" },
    },
  },
  {
    imageUrl: IMG.hifu,
    i18n: {
      en: { alt: "HIFU Therapy", caption: "HIFU Therapy" },
      fa: { alt: "هایفوتراپی", caption: "هایفوتراپی" },
    },
  },
  {
    imageUrl: IMG.botox,
    i18n: {
      en: { alt: "Botox Service", caption: "Botox Service" },
      fa: { alt: "بوتاکس", caption: "بوتاکس" },
    },
  },
  {
    imageUrl: IMG.clean,
    i18n: {
      en: { alt: "Clean & Relaxing Clinic", caption: "A clean, calm clinic space" },
      fa: { alt: "کلینیک تمیز و آرام", caption: "فضایی تمیز و آرام در کلینیک" },
    },
  },
  {
    imageUrl: IMG.hydraulically,
    i18n: {
      en: { alt: "HydraFacial Service", caption: "HydraFacial Service" },
      fa: { alt: "خدمت هیدرافیشیال", caption: "خدمت هیدرافیشیال" },
    },
  },
  {
    imageUrl: IMG.clinic,
    i18n: {
      en: { alt: "Nafas Beauty Clinic", caption: "Nafas Beauty Clinic" },
      fa: { alt: "کلینیک زیبایی نفس", caption: "کلینیک زیبایی نفس" },
    },
  },
  {
    imageUrl: IMG.fullFiller,
    i18n: {
      en: { alt: "Full Face Filler", caption: "Full Face Filler" },
      fa: { alt: "فیلر تمام صورت", caption: "فیلر تمام صورت" },
    },
  },
  {
    imageUrl: IMG.bodyFiller,
    i18n: {
      en: { alt: "Body Filler", caption: "Body Filler" },
      fa: { alt: "فیلر بادی", caption: "فیلر بادی" },
    },
  },
];
