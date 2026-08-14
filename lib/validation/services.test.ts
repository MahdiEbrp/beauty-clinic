import { describe, expect, it } from "vitest";

import {
  createServiceCategorySchema,
  createServiceGroupSchema,
  createServiceSchema,
  listServicesQuerySchema,
  serviceFaqInputSchema,
  serviceImageInputSchema,
  updateServiceCategorySchema,
  updateServiceGroupSchema,
  updateServiceSchema,
} from "./services";

const groupTranslation = {
  name: "Laser",
  description: "Laser treatments",
  seoTitle: "Laser | Clinic",
  seoDescription: null,
};

const validGroup = {
  slug: "laser",
  icon: "laser",
  image: null,
  displayOrder: 1,
  isActive: true,
  translations: { fa: groupTranslation, en: groupTranslation },
};

const validCategory = {
  ...validGroup,
  groupId: "7f9c2f10-2f6b-4d4f-9e1f-5f2f3f4f5f6f",
};

const serviceTranslation = {
  title: "Laser Hair Removal",
  shortDesc: "Permanent hair removal",
  fullDesc: null,
  seoTitle: "Laser Hair Removal | Clinic",
  seoDescription: null,
};

const validService = {
  categoryId: "7f9c2f10-2f6b-4d4f-9e1f-5f2f3f4f5f6f",
  slug: "laser-hair-removal",
  price: 250,
  priceType: "from",
  durationMin: 45,
  sessionsCount: 3,
  coverImage: null,
  isActive: true,
  isFeatured: false,
  displayOrder: 1,
  translations: { fa: serviceTranslation, en: serviceTranslation },
  images: [
    { imageUrl: "/images/laser.webp", type: "gallery", displayOrder: 1 },
  ],
  faqs: [
    {
      displayOrder: 1,
      translations: {
        fa: { question: "Does it hurt?", answer: "No." },
        en: { question: "Does it hurt?", answer: "No." },
      },
    },
  ],
};

describe("listServicesQuerySchema", () => {
  it("applies defaults for page, perPage, status and featured", () => {
    const result = listServicesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1, perPage: 20, status: "all", featured: "all" });
    }
  });

  it("coerces numeric query strings", () => {
    const result = listServicesQuerySchema.safeParse({ page: "3", perPage: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.perPage).toBe(25);
    }
  });

  it("accepts optional categoryId, search and valid filters", () => {
    const result = listServicesQuerySchema.safeParse({
      categoryId: validCategory.groupId,
      search: "  laser  ",
      status: "inactive",
      featured: "yes",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("laser");
      expect(result.data.status).toBe("inactive");
      expect(result.data.featured).toBe("yes");
    }
  });

  it("rejects an invalid categoryId", () => {
    expect(listServicesQuerySchema.safeParse({ categoryId: "nope" }).success).toBe(false);
  });

  it("rejects unknown status and featured values", () => {
    expect(listServicesQuerySchema.safeParse({ status: "archived" }).success).toBe(false);
    expect(listServicesQuerySchema.safeParse({ featured: "maybe" }).success).toBe(false);
  });

  it("rejects perPage above the maximum", () => {
    expect(listServicesQuerySchema.safeParse({ perPage: 101 }).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(listServicesQuerySchema.safeParse({ sort: "price" }).success).toBe(false);
  });
});

describe("createServiceGroupSchema", () => {
  it("accepts a valid group and applies defaults", () => {
    const result = createServiceGroupSchema.safeParse({
      slug: "laser",
      translations: { fa: groupTranslation, en: groupTranslation },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        displayOrder: 0,
        isActive: true,
      });
    }
  });

  it("accepts a fully populated group", () => {
    expect(createServiceGroupSchema.safeParse(validGroup).success).toBe(true);
  });

  it("rejects a non-kebab-case slug", () => {
    expect(createServiceGroupSchema.safeParse({ ...validGroup, slug: "Laser Group" }).success).toBe(false);
    expect(createServiceGroupSchema.safeParse({ ...validGroup, slug: "laser_group" }).success).toBe(false);
  });

  it("rejects unknown fields (mass-assignment protection)", () => {
    expect(createServiceGroupSchema.safeParse({ ...validGroup, ownerId: "x" }).success).toBe(false);
  });

  it("rejects an empty name in either locale", () => {
    expect(
      createServiceGroupSchema.safeParse({
        ...validGroup,
        translations: { ...validGroup.translations, fa: { ...groupTranslation, name: "   " } },
      }).success,
    ).toBe(false);
    expect(
      createServiceGroupSchema.safeParse({
        ...validGroup,
        translations: { ...validGroup.translations, en: { ...groupTranslation, name: "   " } },
      }).success,
    ).toBe(false);
  });
});

describe("updateServiceGroupSchema", () => {
  it("accepts a partial patch and applies defaults", () => {
    const result = updateServiceGroupSchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toMatchObject({ isActive: false });
  });

  it("accepts an empty patch", () => {
    expect(updateServiceGroupSchema.safeParse({}).success).toBe(true);
  });
});

describe("createServiceCategorySchema", () => {
  it("accepts a valid category", () => {
    expect(createServiceCategorySchema.safeParse(validCategory).success).toBe(true);
  });

  it("rejects a missing groupId", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { groupId: _groupId, ...rest } = validCategory;
    expect(createServiceCategorySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an invalid groupId", () => {
    expect(createServiceCategorySchema.safeParse({ ...validCategory, groupId: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(createServiceCategorySchema.safeParse({ ...validCategory, serviceIds: [] }).success).toBe(false);
  });
});

describe("updateServiceCategorySchema", () => {
  it("accepts a partial patch", () => {
    const result = updateServiceCategorySchema.safeParse({ groupId: validCategory.groupId });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toMatchObject({ groupId: validCategory.groupId });
  });
});

describe("serviceImageInputSchema", () => {
  it("accepts a valid image and defaults the type", () => {
    const result = serviceImageInputSchema.safeParse({ imageUrl: "/x.webp" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.type).toBe("gallery");
  });

  it("accepts before/after/gallery types", () => {
    for (const type of ["before", "after", "gallery"]) {
      expect(serviceImageInputSchema.safeParse({ imageUrl: "/x.webp", type }).success).toBe(true);
    }
  });

  it("rejects an invalid type", () => {
    expect(serviceImageInputSchema.safeParse({ imageUrl: "/x.webp", type: "banner" }).success).toBe(false);
  });

  it("rejects an empty imageUrl", () => {
    expect(serviceImageInputSchema.safeParse({ imageUrl: "" }).success).toBe(false);
  });
});

describe("serviceFaqInputSchema", () => {
  it("accepts a valid faq", () => {
    const result = serviceFaqInputSchema.safeParse({ question: "Q", answer: "A" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.displayOrder).toBe(0);
  });

  it("rejects a missing answer", () => {
    expect(serviceFaqInputSchema.safeParse({ question: "Q" }).success).toBe(false);
  });
});

describe("createServiceSchema", () => {
  it("accepts a fully populated service", () => {
    const result = createServiceSchema.safeParse(validService);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(250);
      expect(result.data.images).toHaveLength(1);
      expect(result.data.faqs).toHaveLength(1);
    }
  });

  it("coerces a string price", () => {
    const result = createServiceSchema.safeParse({ ...validService, price: "123" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.price).toBe(123);
  });

  it("accepts an on_request service without a price", () => {
    const result = createServiceSchema.safeParse({
      ...validService,
      price: null,
      priceType: "on_request",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a negative price", () => {
    expect(createServiceSchema.safeParse({ ...validService, price: -1 }).success).toBe(false);
  });

  it("rejects a missing categoryId or slug", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryId: _categoryId, ...noCategory } = validService;
    expect(createServiceSchema.safeParse(noCategory).success).toBe(false);
    expect(createServiceSchema.safeParse({ ...validService, slug: "" }).success).toBe(false);
  });

  it("rejects more than 50 images", () => {
    const images = Array.from({ length: 51 }, (_, index) => ({
      imageUrl: `/x-${index}.webp`,
    }));
    expect(createServiceSchema.safeParse({ ...validService, images }).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(createServiceSchema.safeParse({ ...validService, availability: true }).success).toBe(false);
  });
});

describe("updateServiceSchema", () => {
  it("accepts a partial patch and applies defaults", () => {
    const result = updateServiceSchema.safeParse({ isFeatured: true });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toMatchObject({ isFeatured: true });
  });

  it("accepts replacing nested images", () => {
    const result = updateServiceSchema.safeParse({
      images: [{ imageUrl: "/new.webp", type: "after", displayOrder: 1 }],
    });
    expect(result.success).toBe(true);
  });
});
