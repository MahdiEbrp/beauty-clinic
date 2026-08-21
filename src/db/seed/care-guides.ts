/** Seed data upsert for the `care_guides` / `care_guide_items` tables. */
import { db } from "../index";
import {
  careGuideItems,
  careGuideItemsI18n,
  careGuides,
  careGuidesI18n,
} from "../schema";
import { CARE_GUIDES_SEED } from "./care-guide-content";

export async function seedCareGuides(): Promise<void> {
  for (const def of CARE_GUIDES_SEED) {
    const [guide] = await db
      .insert(careGuides)
      .values({
        slug: def.slug,
        icon: def.icon,
        displayOrder: def.displayOrder,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: careGuides.slug,
        set: {
          icon: def.icon,
          displayOrder: def.displayOrder,
          isActive: true,
        },
      })
      .returning({ id: careGuides.id });

    for (const entry of def.i18n) {
      await db
        .insert(careGuidesI18n)
        .values({
          guideId: guide.id,
          locale: entry.locale,
          name: entry.name,
          description: entry.description,
        })
        .onConflictDoUpdate({
          target: [careGuidesI18n.guideId, careGuidesI18n.locale],
          set: { name: entry.name, description: entry.description },
        });
    }

    for (const item of def.items) {
      const [row] = await db
        .insert(careGuideItems)
        .values({
          guideId: guide.id,
          highlighted: item.highlighted,
          displayOrder: item.displayOrder,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: [careGuideItems.guideId, careGuideItems.displayOrder],
          set: { highlighted: item.highlighted, isActive: true },
        })
        .returning({ id: careGuideItems.id });

      for (const entry of item.i18n) {
        await db
          .insert(careGuideItemsI18n)
          .values({
            itemId: row.id,
            locale: entry.locale,
            title: entry.title,
            description: entry.description,
          })
          .onConflictDoUpdate({
            target: [careGuideItemsI18n.itemId, careGuideItemsI18n.locale],
            set: { title: entry.title, description: entry.description },
          });
      }
    }
  }
  console.log("Care guides seeded.");
}
