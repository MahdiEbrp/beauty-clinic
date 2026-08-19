import { describe, expect, it } from "vitest";

import {
  mapAboutStat,
  mapGalleryItem,
  mapHero,
  mapLandingSection,
  mapLandingSeo,
  mapMarqueeItem,
  mapServiceCard,
} from "./map";

describe("mapMarqueeItem", () => {
  it("maps a row with translations", () => {
    const row = {
      id: "1",
      key: "mq-1",
      icon: "sparkles",
      displayOrder: 2,
      isActive: true,
    };
    const result = mapMarqueeItem(row, {
      fa: { text: "پوست شفاف" },
      en: { text: "Clear Skin" },
    });
    expect(result).toMatchObject({
      id: "1",
      key: "mq-1",
      icon: "sparkles",
      displayOrder: 2,
      isActive: true,
      text: "پوست شفاف",
    });
    expect(result.translations.fa).toEqual({ text: "پوست شفاف" });
    expect(result.translations.en).toEqual({ text: "Clear Skin" });
  });

  it("falls back to empty text when translations are missing", () => {
    const result = mapMarqueeItem(
      { id: "1", key: "mq-1", icon: null, displayOrder: 0, isActive: false },
      undefined,
    );
    expect(result.text).toBe("");
    expect(result.translations.fa).toEqual({ text: "" });
  });
});

describe("mapServiceCard", () => {
  it("maps translations and keeps nullables", () => {
    const row = {
      id: "1",
      key: "sc-1",
      serviceId: null,
      icon: "sparkles",
      image: null,
      displayOrder: 1,
      isActive: true,
    };
    const result = mapServiceCard(row, {
      fa: { title: "ژل", description: "توضیح", ctaLabel: null },
      en: { title: "Filler", description: null, ctaLabel: "Book" },
    });
    expect(result.title).toBe("ژل");
    expect(result.description).toBe("توضیح");
    expect(result.ctaLabel).toBeNull();
    expect(result.translations.en.ctaLabel).toBe("Book");
  });

  it("falls back when translations are missing", () => {
    const result = mapServiceCard(
      { id: "1", key: "sc-1", serviceId: null, icon: null, image: null, displayOrder: 0, isActive: true },
      undefined,
    );
    expect(result.title).toBe("");
    expect(result.description).toBeNull();
  });
});

describe("mapAboutStat", () => {
  it("maps value, compact and plus", () => {
    const row = {
      id: "1",
      key: "st-1",
      value: 15000,
      compact: true,
      plus: true,
      displayOrder: 0,
      isActive: true,
    };
    const result = mapAboutStat(row, {
      fa: { label: "مشتری راضی" },
      en: { label: "Happy Clients" },
    });
    expect(result.value).toBe(15000);
    expect(result.compact).toBe(true);
    expect(result.plus).toBe(true);
    expect(result.label).toBe("مشتری راضی");
  });
});

describe("mapGalleryItem", () => {
  it("maps imageUrl and translations", () => {
    const row = {
      id: "1",
      key: "gl-1",
      imageUrl: "https://cdn.example.com/gallery/1.jpg",
      displayOrder: 0,
      isActive: true,
    };
    const result = mapGalleryItem(row, {
      fa: { alt: "تصویر", caption: null },
      en: { alt: "Photo", caption: "Caption" },
    });
    expect(result.imageUrl).toBe("https://cdn.example.com/gallery/1.jpg");
    expect(result.alt).toBe("تصویر");
    expect(result.caption).toBeNull();
    expect(result.translations.en.caption).toBe("Caption");
  });
});

describe("mapHero", () => {
  it("maps image, taglineIcon and translations", () => {
    const row = { image: "https://cdn.example.com/hero.jpg", taglineIcon: "sparkles" };
    const result = mapHero(row, {
      fa: { title: "ت", tagline: null, description: null, ctaLabel1: "رزرو", ctaLabel2: "مشاوره" },
      en: { title: "T", tagline: "tag", description: "desc", ctaLabel1: "Book", ctaLabel2: "Consult" },
    });
    expect(result.image).toBe("https://cdn.example.com/hero.jpg");
    expect(result.taglineIcon).toBe("sparkles");
    expect(result.translations.fa.title).toBe("ت");
    expect(result.translations.en.description).toBe("desc");
  });

  it("uses empty hero fallback when translations are missing", () => {
    const result = mapHero({ image: null, taglineIcon: null }, undefined);
    expect(result.translations.fa).toEqual({
      title: "",
      tagline: null,
      description: null,
      ctaLabel1: "",
      ctaLabel2: "",
    });
  });
});

describe("mapLandingSeo", () => {
  it("finds translations by locale", () => {
    const result = mapLandingSeo([
      { locale: "en", seoTitle: "Title", seoDescription: "Desc" },
      { locale: "fa", seoTitle: "عنوان", seoDescription: null },
    ]);
    expect(result.translations.fa.seoTitle).toBe("عنوان");
    expect(result.translations.en.seoTitle).toBe("Title");
  });

  it("defaults missing locales to null", () => {
    const result = mapLandingSeo([{ locale: "fa", seoTitle: null, seoDescription: null }]);
    expect(result.translations.en).toEqual({ seoTitle: null, seoDescription: null });
  });
});

describe("mapLandingSection", () => {
  it("returns null when translations are missing", () => {
    expect(mapLandingSection({ key: "services" }, undefined)).toBeNull();
  });

  it("maps a section with translations", () => {
    const result = mapLandingSection(
      { key: "services" },
      {
        fa: { heading: "سرتیتر", description: null },
        en: { heading: "Heading", description: "Desc" },
      },
    );
    expect(result?.key).toBe("services");
    expect(result?.heading).toBe("سرتیتر");
    expect(result?.translations.en.description).toBe("Desc");
  });
});