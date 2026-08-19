import { relations } from "drizzle-orm";

import {
  landingAboutStats,
  landingAboutStatsI18n,
  landingGalleryItems,
  landingGalleryItemsI18n,
  landingHero,
  landingHeroI18n,
  landingMarqueeItems,
  landingMarqueeItemsI18n,
  landingPages,
  landingPagesI18n,
  landingSections,
  landingSectionsI18n,
  landingServices,
  landingServicesI18n,
} from "./landing";
import { services } from "./service-catalog";

export const landingPagesRelations = relations(landingPages, ({ many }) => ({
  i18n: many(landingPagesI18n),
  sections: many(landingSections),
  hero: many(landingHero),
  marqueeItems: many(landingMarqueeItems),
}));

export const landingPagesI18nRelations = relations(landingPagesI18n, ({ one }) => ({
  landingPage: one(landingPages, {
    fields: [landingPagesI18n.landingPageId],
    references: [landingPages.id],
  }),
}));

export const landingSectionsRelations = relations(landingSections, ({ one, many }) => ({
  landingPage: one(landingPages, {
    fields: [landingSections.landingPageId],
    references: [landingPages.id],
  }),
  i18n: many(landingSectionsI18n),
  services: many(landingServices),
  stats: many(landingAboutStats),
  galleryItems: many(landingGalleryItems),
}));

export const landingSectionsI18nRelations = relations(landingSectionsI18n, ({ one }) => ({
  section: one(landingSections, {
    fields: [landingSectionsI18n.sectionId],
    references: [landingSections.id],
  }),
}));

export const landingHeroRelations = relations(landingHero, ({ one, many }) => ({
  landingPage: one(landingPages, {
    fields: [landingHero.landingPageId],
    references: [landingPages.id],
  }),
  i18n: many(landingHeroI18n),
}));

export const landingHeroI18nRelations = relations(landingHeroI18n, ({ one }) => ({
  hero: one(landingHero, { fields: [landingHeroI18n.heroId], references: [landingHero.id] }),
}));

export const landingMarqueeItemsRelations = relations(
  landingMarqueeItems,
  ({ one, many }) => ({
    landingPage: one(landingPages, {
      fields: [landingMarqueeItems.landingPageId],
      references: [landingPages.id],
    }),
    i18n: many(landingMarqueeItemsI18n),
  }),
);

export const landingMarqueeItemsI18nRelations = relations(
  landingMarqueeItemsI18n,
  ({ one }) => ({
    marqueeItem: one(landingMarqueeItems, {
      fields: [landingMarqueeItemsI18n.marqueeItemId],
      references: [landingMarqueeItems.id],
    }),
  }),
);

export const landingServicesRelations = relations(landingServices, ({ one, many }) => ({
  section: one(landingSections, {
    fields: [landingServices.sectionId],
    references: [landingSections.id],
  }),
  service: one(services, { fields: [landingServices.serviceId], references: [services.id] }),
  i18n: many(landingServicesI18n),
}));

export const landingServicesI18nRelations = relations(landingServicesI18n, ({ one }) => ({
  landingService: one(landingServices, {
    fields: [landingServicesI18n.landingServiceId],
    references: [landingServices.id],
  }),
}));

export const landingAboutStatsRelations = relations(landingAboutStats, ({ one, many }) => ({
  section: one(landingSections, {
    fields: [landingAboutStats.sectionId],
    references: [landingSections.id],
  }),
  i18n: many(landingAboutStatsI18n),
}));

export const landingAboutStatsI18nRelations = relations(landingAboutStatsI18n, ({ one }) => ({
  stat: one(landingAboutStats, {
    fields: [landingAboutStatsI18n.statId],
    references: [landingAboutStats.id],
  }),
}));

export const landingGalleryItemsRelations = relations(landingGalleryItems, ({ one, many }) => ({
  section: one(landingSections, {
    fields: [landingGalleryItems.sectionId],
    references: [landingSections.id],
  }),
  i18n: many(landingGalleryItemsI18n),
}));

export const landingGalleryItemsI18nRelations = relations(
  landingGalleryItemsI18n,
  ({ one }) => ({
    galleryItem: one(landingGalleryItems, {
      fields: [landingGalleryItemsI18n.galleryItemId],
      references: [landingGalleryItems.id],
    }),
  }),
);
