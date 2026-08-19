import type { CollectionKey } from "../types";

export const STEPS = [
  { id: 1, key: "content" },
  { id: 2, key: "appearance" },
  { id: 3, key: "settings" },
  { id: 4, key: "review" },
] as const;

/** Steps that expose the en/fa language switcher. */
export const LANG_AWARE_STEPS = new Set<number>([1]);

export type WizardField = {
  key: string;
  labelKey: string;
  placeholderKey: string;
  type: "input" | "textarea";
  required?: boolean;
  hintKey?: string;
  rows?: number;
};

export const CONTENT_FIELDS: Record<CollectionKey, WizardField[]> = {
  marquee: [
    {
      key: "text",
      labelKey: "fields.text",
      placeholderKey: "fields.textPlaceholder",
      type: "input",
      required: true,
    },
  ],
  services: [
    {
      key: "title",
      labelKey: "fields.title",
      placeholderKey: "fields.titlePlaceholder",
      type: "input",
      required: true,
    },
    {
      key: "description",
      labelKey: "fields.description",
      placeholderKey: "fields.descriptionPlaceholder",
      hintKey: "fields.descriptionHint",
      type: "textarea",
      rows: 4,
    },
    {
      key: "ctaLabel",
      labelKey: "fields.ctaLabel",
      placeholderKey: "fields.ctaLabelPlaceholder",
      hintKey: "fields.ctaLabelHint",
      type: "input",
    },
  ],
  stats: [
    {
      key: "label",
      labelKey: "fields.label",
      placeholderKey: "fields.labelPlaceholder",
      type: "input",
      required: true,
    },
  ],
  gallery: [
    {
      key: "alt",
      labelKey: "fields.alt",
      placeholderKey: "fields.altPlaceholder",
      type: "input",
      required: true,
    },
    {
      key: "caption",
      labelKey: "fields.caption",
      placeholderKey: "fields.captionPlaceholder",
      hintKey: "fields.captionHint",
      type: "input",
    },
  ],
};

export function usesIcon(collection: CollectionKey): boolean {
  return collection === "marquee" || collection === "services";
}

export function usesImage(collection: CollectionKey): boolean {
  return collection === "services" || collection === "gallery";
}

export function isStat(collection: CollectionKey): boolean {
  return collection === "stats";
}