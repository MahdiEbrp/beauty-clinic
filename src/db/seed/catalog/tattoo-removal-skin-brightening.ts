import type { SeedGroup } from "./types";
import { IMG } from "../images";

export const TATTOO_REMOVAL_GROUP: SeedGroup = {
  slug: "tattoo-removal-skin-brightening",
  icon: "wand-sparkles",
  image: IMG.pigmentation,
  displayOrder: 7,
  i18n: [
    {
      locale: "fa",
      name: "لیزر پاک‌کننده تتو و روشن‌کننده پوست",
      description:
        "با لیزر کیوسوییچ، به کاهش رنگ تتو و بهبود ظاهر برخی لک‌ها و تیرگی‌های پوستی کمک کنید و پوستی یکدست‌تر داشته باشید.",
      seoTitle: "لیزر کیوسوییچ | پاک کردن تتو و روشن‌کننده پوست",
      seoDescription:
        "لیزر کیوسوییچ برای کاهش رنگ تتو و بهبود ظاهر لک و تیرگی‌های پوستی؛ روشی دقیق برای داشتن پوستی شفاف‌تر و یکدست‌تر.",
    },
    {
      locale: "en",
      name: "Tattoo Removal & Skin Brightening",
      description:
        "Reveal clearer, more even-looking skin with targeted Q-switched laser treatments for tattoo fading and pigmentation concerns.",
      seoTitle: "Q-Switched Laser | Tattoo Removal & Skin Brightening",
      seoDescription:
        "Explore Q-switched laser treatments for tattoo removal and pigmentation concerns. A precise approach to achieving clearer, more even-looking skin.",
    },
  ],
  categories: [
    {
      slug: "qswitch-services",
      icon: "wand-sparkles",
      displayOrder: 0,
      i18n: [
        {
          locale: "fa",
          name: "خدمات دستگاه کیوسوییچ",
          description:
            "خدمات دستگاه لیزر کیوسوییچ برای پاک کردن تتو، روشن‌کردن پوست و از بین بردن لک و تیرگی؛ با رویکردی دقیق و تدریجی.",
          seoTitle: "خدمات دستگاه کیوسوییچ | لیزر تتو و لک پوست",
          seoDescription:
            "لیزر کیوسوییچ برای پاک کردن تتو، روشن‌کردن پوست و از بین بردن لک و تیرگی؛ روشی دقیق برای پوستی شفاف‌تر و یکدست‌تر.",
        },
        {
          locale: "en",
          name: "Q-Switch Device Services",
          description:
            "Q-switch laser device services for tattoo fading, skin brightening and removal of pigmentation and dark spots with a precise, gradual approach.",
          seoTitle: "Q-Switch Device Services | Laser, Tattoo & Pigmentation",
          seoDescription:
            "Q-switch laser for tattoo removal, skin brightening, and treatment of pigmentation and dark spots — a precise approach to clearer, more even skin.",
        },
      ],
      // NOTE: no pricing provided yet. priceType stays on_request (price:
      // null) so the row is valid and visible but flagged as "needs price."
      // Mahdi said he'll paste real pricing later — just add svc(...) entries
      // here (or turn priceType to "fixed").
      services: [
        {
          slug: "tattoo-removal",
          price: null,
          priceType: "on_request",
          displayOrder: 0,
          i18n: [
            {
              locale: "fa",
              title: "پاک کردن تتو",
              shortDesc: "لیزر کیوسوییچ برای پاک کردن و کاهش رنگ تتو به‌صورت تدریجی و دقیق.",
              seoTitle: "لیزر پاک کردن تتو | قیمت و مشاوره",
              seoDescription:
                "قیمت و مشاوره لیزر کیوسوییچ برای پاک کردن تتو و کاهش رنگ آن؛ با رویکردی دقیق و تدریجی و متناسب با نوع و اندازه تتو.",
            },
            {
              locale: "en",
              title: "Tattoo Removal",
              shortDesc: "Q-switch laser to fade and remove tattoos gradually and precisely.",
              seoTitle: "Tattoo Removal Laser | Price & Consultation",
              seoDescription:
                "Q-switch laser price and consultation for tattoo removal and fading — a precise, gradual approach tailored to your tattoo.",
            },
          ],
        },
        {
          slug: "skin-whitening",
          price: null,
          priceType: "on_request",
          displayOrder: 1,
          i18n: [
            {
              locale: "fa",
              title: "سفید کننده (وایتنینگ)",
              shortDesc: "لیزر و درمان‌های روشن‌کننده پوست برای یکدست‌تر شدن رنگ پوست.",
              seoTitle: "لیزر سفید کردن پوست | قیمت",
              seoDescription:
                "قیمت و مشاوره لیزر کیوسوییچ برای روشن‌کردن و یکدست‌تر شدن رنگ پوست.",
            },
            {
              locale: "en",
              title: "Skin Whitening",
              shortDesc: "Laser and brightening treatments for a more even skin tone.",
              seoTitle: "Skin Brightening Laser | Price",
              seoDescription:
                "Q-switch laser price and consultation for skin brightening and a more even skin tone.",
            },
          ],
        },
        {
          slug: "pigmentation-removal",
          price: null,
          priceType: "on_request",
          displayOrder: 2,
          i18n: [
            {
              locale: "fa",
              title: "از بین بردن لک و تیرگی",
              shortDesc: "از بین بردن لک و تیرگی پوست با لیزر کیوسوییچ؛ برای پوستی شفاف‌تر.",
              seoTitle: "لیزر از بین بردن لک | قیمت",
              seoDescription:
                "قیمت و مشاوره لیزر کیوسوییچ برای از بین بردن لک و تیرگی‌های پوستی.",
            },
            {
              locale: "en",
              title: "Pigmentation & Dark Spot Removal",
              shortDesc: "Remove pigmentation and dark spots with Q-switch laser for clearer skin.",
              seoTitle: "Pigmentation Removal Laser | Price",
              seoDescription:
                "Q-switch laser price and consultation for removing pigmentation and dark spots for clearer, more even skin.",
            },
          ],
        },
      ],
    },
  ],
};