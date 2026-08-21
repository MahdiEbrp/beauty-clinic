/**
 * Central source for media URLs used across the app.
 *
 * Treatment / venue photos are hosted on Vercel Blob so they load directly in
 * the browser from a public CDN (native <img>, no next/image). Keep the base in
 * one place so the blob bucket can be swapped without touching every catalog,
 * landing, rules and pricing entity.
 */
export const BLOB_BASE = "https://kyqojapbzmoz2zvk.public.blob.vercel-storage.com";

/** Build a full blob URL for a stored file name. */
const blob = (file: string): string => `${BLOB_BASE}/${file}`;

export const IMG = {
  filler: blob("filler.webp"),
  fullFiller: blob("full-filler.webp"),
  bodyFiller: blob("body-filler.webp"),
  botox: blob("botox.webp"),
  hifu: blob("hifu.webp"),
  laserHairRemoval: blob("laser-hair-removal.webp"),
  mesotherapy: blob("mesotherapy.webp"),
  care: blob("care.webp"),
  pigmentation: blob("pigmentation-treatments.webp"),
  clinic: blob("clinic.webp"),
  clean: blob("clean.webp"),
  hydraulically: blob("hydraulically.webp"),
  microneedling: blob("Microneedling.webp"),
  // File name contains a space — Vercel blob encodes it as %20 in the URL.
  skinRejuvenation: blob("Skin%20Rejuvenation.webp"),
  // Rule card images.
  time: blob("time.webp"),
  waiting: blob("waiting.webp"),
  car: blob("car.webp"),
  companionPolicy: blob("companion-policy.webp"),
  cancellation: blob("cancellation.webp"),
  /** Neutral backdrop when a DB image is missing. */
  fallback: blob("clinic.webp"),
} as const;