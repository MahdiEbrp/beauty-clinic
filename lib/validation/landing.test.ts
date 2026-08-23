import { describe, expect, it } from "vitest";

import {
  bulkLandingCollectionSchema,
  createGalleryItemSchema,
  createMarqueeItemSchema,
  createServiceCardSchema,
  createStatSchema,
  landingListQuerySchema,
  updateHeroSchema,
  updateSettingsSchema,
} from "./landing";

const UUID = "7f9c2f10-2f6b-4d4f-9e1f-5f2f3f4f5f6f";

const marqueePayload = {
  icon: "sparkles",
  displayOrder: 3,
  isActive: true,
  translations: {
    fa: { text: "پوست شفاف" },
    en: { text: "Clear Skin" },
  },
};

// eslint-disable-next-line no-secrets/no-secrets
describe("landingListQuerySchema", () => {
  it("applies defaults for page, perPage and status", () => {
    const result = landingListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1, perPage: 10, status: "all" });
    }
  });

  it("coerces numeric query strings", () => {
    const result = landingListQuerySchema.safeParse({
      page: "2",
      perPage: "25",
      status: "active",
      search: "  laser  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.perPage).toBe(25);
      expect(result.data.status).toBe("active");
      expect(result.data.search).toBe("laser");
    }
  });

  it("rejects unknown status and over-limit perPage", () => {
    expect(landingListQuerySchema.safeParse({ status: "archived" }).success).toBe(false);
    expect(landingListQuerySchema.safeParse({ perPage: 101 }).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(landingListQuerySchema.safeParse({ sort: "name" }).success).toBe(false);
  });
});

describe("createMarqueeItemSchema", () => {
  it("accepts a valid payload and applies defaults", () => {
    const result = createMarqueeItemSchema.safeParse(marqueePayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayOrder).toBe(3);
      expect(result.data.isActive).toBe(true);
    }
  });

  it("rejects a payload without translations", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { translations: _t, ...rest } = marqueePayload;
    expect(createMarqueeItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty text and unknown fields", () => {
    const bad = {
      ...marqueePayload,
      translations: { fa: { text: "" }, en: { text: "" } },
    };
    expect(createMarqueeItemSchema.safeParse(bad).success).toBe(false);
    expect(
      createMarqueeItemSchema.safeParse({ ...marqueePayload, admin: true }).success,
    ).toBe(false);
  });

  it("update schema accepts a partial payload", () => {
    const result = createMarqueeItemSchema.partial().strict().safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });
});

describe("createServiceCardSchema", () => {
  it("accepts a valid payload with optional translations", () => {
    const payload = {
      icon: "sparkles",
      image: null,
      displayOrder: 1,
      isActive: true,
      translations: {
        fa: { title: "تزریق ژل", description: "توضیح", ctaLabel: "رزرو" },
        en: { title: "Filler", description: null, ctaLabel: null },
      },
    };
    expect(createServiceCardSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects a missing title", () => {
    const payload = {
      translations: {
        fa: { title: "" },
        en: { title: "Filler" },
      },
    };
    expect(createServiceCardSchema.safeParse(payload).success).toBe(false);
  });
});

describe("createStatSchema", () => {
  it("accepts a valid payload", () => {
    const payload = {
      value: 15000,
      compact: true,
      plus: true,
      displayOrder: 0,
      isActive: true,
      translations: {
        fa: { label: "مشتری راضی" },
        en: { label: "Happy Clients" },
      },
    };
    expect(createStatSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects non-integer and negative values", () => {
    const base = {
      compact: false,
      plus: false,
      translations: { fa: { label: "x" }, en: { label: "x" } },
    };
    expect(createStatSchema.safeParse({ ...base, value: 1.5 }).success).toBe(false);
    expect(createStatSchema.safeParse({ ...base, value: -1 }).success).toBe(false);
    expect(createStatSchema.safeParse({ ...base, value: 0 }).success).toBe(true);
  });
});

describe("createGalleryItemSchema", () => {
  it("accepts a valid payload with imageUrl", () => {
    const payload = {
      imageUrl: "https://cdn.example.com/gallery/1.jpg",
      displayOrder: 2,
      isActive: true,
      translations: {
        fa: { alt: "تصویر", caption: null },
        en: { alt: "Photo", caption: "Caption" },
      },
    };
    expect(createGalleryItemSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects a payload without imageUrl or alt", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageUrl: _i, ...noUrl } = {
      imageUrl: "https://cdn.example.com/gallery/1.jpg",
      displayOrder: 2,
      isActive: true,
      translations: { fa: { alt: "a", caption: null }, en: { alt: "a", caption: null } },
    };
    expect(createGalleryItemSchema.safeParse(noUrl).success).toBe(false);

    const noAlt = {
      imageUrl: "https://cdn.example.com/gallery/1.jpg",
      translations: {
        fa: { alt: "", caption: null },
        en: { alt: "Photo", caption: null },
      },
    };
    expect(createGalleryItemSchema.safeParse(noAlt).success).toBe(false);
  });
});

describe("updateHeroSchema", () => {
  it("accepts a partial payload without translations", () => {
    expect(updateHeroSchema.safeParse({ image: "https://cdn.example.com/hero.jpg" }).success).toBe(
      true,
    );
    expect(updateHeroSchema.safeParse({ taglineIcon: "sparkles" }).success).toBe(true);
  });

  it("accepts a full payload with translations", () => {
    const payload = {
      image: "https://cdn.example.com/hero.jpg",
      taglineIcon: "sparkles",
      translations: {
        fa: { title: "سلامت", tagline: "زیبایی", description: "توضیح", ctaLabel1: "رزرو", ctaLabel2: "مشاوره" },
        en: { title: "Health", tagline: null, description: null, ctaLabel1: "Book", ctaLabel2: "Consult" },
      },
    };
    expect(updateHeroSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects translations missing required fields", () => {
    const payload = {
      translations: {
        fa: { title: "t" },
        en: { title: "t" },
      },
    };
    expect(updateHeroSchema.safeParse(payload).success).toBe(false);
  });
});

describe("updateSettingsSchema", () => {
  it("accepts seo and sections", () => {
    const payload = {
      seo: {
        fa: { seoTitle: "عنوان", seoDescription: "توضیح" },
        en: { seoTitle: "Title", seoDescription: null },
      },
      sections: [
        {
          key: "services",
          translations: {
            fa: { heading: "سرتیتر" },
            en: { heading: "Heading" },
          },
        },
      ],
    };
    expect(updateSettingsSchema.safeParse(payload).success).toBe(true);
  });

  it("accepts an empty sections list and rejects unknown section keys", () => {
    expect(updateSettingsSchema.safeParse({ sections: [] }).success).toBe(true);
    expect(
      updateSettingsSchema.safeParse({ sections: [{ key: "nope", translations: {} }] }).success,
    ).toBe(false);
  });
});

// eslint-disable-next-line no-secrets/no-secrets
describe("bulkLandingCollectionSchema", () => {
  it("accepts a page-scoped bulk delete with ids", () => {
    const result = bulkLandingCollectionSchema.safeParse({
      action: "delete",
      scope: "page",
      ids: [UUID],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a filtered-scoped bulk action without ids", () => {
    const result = bulkLandingCollectionSchema.safeParse({
      action: "activate",
      scope: "filtered",
      filters: { search: "laser", status: "active" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a page scope with no ids, invalid ids and unknown actions", () => {
    expect(
      bulkLandingCollectionSchema.safeParse({ action: "deactivate", scope: "page" }).success,
    ).toBe(false);
    expect(
      bulkLandingCollectionSchema.safeParse({
        action: "delete",
        scope: "page",
        ids: ["not-a-uuid"],
      }).success,
    ).toBe(false);
    expect(
      bulkLandingCollectionSchema.safeParse({ action: "archive", scope: "page", ids: [UUID] }).success,
    ).toBe(false);
  });
});