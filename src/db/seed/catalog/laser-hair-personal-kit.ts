import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const LASER_PERSONAL_KIT_CATEGORY: SeedCategory = {
      slug: "laser-hair-personal-kit",
      icon: "gift",
      displayOrder: 3,
      i18n: [
        {
          locale: "fa",
          name: "پک شخصی",
          description:
            "لوازم بهداشتی پک شخصی لیزر مو شامل عینک محافظ، سری، حوله و زیرانداز برای رعایت کامل بهداشت در هر جلسه.",
          seoTitle: "پک شخصی لیزر | قیمت وسایل",
          seoDescription:
            "قیمت لوازم پک شخصی لیزر مو؛ عینک محافظ، سری، حوله و زیرانداز برای رعایت کامل بهداشت در هر جلسه.",
        },
        {
          locale: "en",
          name: "Personal Kit",
          description:
            "Personal laser kit hygiene essentials — protective goggles, head cover, towel and underlay for complete hygiene at every session.",
          seoTitle: "Personal Laser Kit | Prices",
          seoDescription:
            "Personal laser kit prices: protective goggles, head cover, towel and underlay for complete hygiene at every session.",
        },
      ],
      services: [
        withSeo(svc("goggles", "عینک", "Goggles", 50_000, 0), {
          fa: {
            shortDesc: "عینک محافظ استاندارد چشم در طول جلسات لیزر.",
            seoTitle: "عینک محافظ لیزر | قیمت",
            seoDescription:
              "قیمت عینک محافظ پک شخصی لیزر مو؛ محافظ استاندارد چشم در طول جلسات لیزر.",
          },
          en: {
            shortDesc: "Laser safety goggles for standard eye protection during sessions.",
            seoTitle: "Laser Safety Goggles | Price",
            seoDescription:
              "Laser safety goggles for your personal kit — standard eye protection during laser sessions.",
          },
        }),
        withSeo(svc("head-cover", "سری", "Head Cover", 50_000, 1), {
          fa: {
            shortDesc: "سری محافظ برای رعایت بهداشت و محافظت از موها.",
            seoTitle: "سری محافظ لیزر | قیمت",
            seoDescription:
              "قیمت سری محافظ پک شخصی لیزر مو؛ برای رعایت بهداشت و محافظت از موها در طول جلسات.",
          },
          en: {
            shortDesc: "Head cover for hygiene and hair protection during sessions.",
            seoTitle: "Laser Head Cover | Price",
            seoDescription:
              "Laser head cover for your personal kit — hygiene and hair protection during sessions.",
          },
        }),
        withSeo(svc("towel", "حوله", "Towel", 35_000, 2), {
          fa: {
            shortDesc: "حوله بهداشتی برای رعایت کامل بهداشت در هر جلسه.",
            seoTitle: "حوله لیزر | قیمت",
            seoDescription:
              "قیمت حوله پک شخصی لیزر مو؛ برای رعایت کامل بهداشت در هر جلسه.",
          },
          en: {
            shortDesc: "Towel for complete hygiene at every session.",
            seoTitle: "Laser Towel | Price",
            seoDescription:
              "Towel for your personal laser kit — complete hygiene at every session.",
          },
        }),
        withSeo(svc("underlay", "زیر انداز", "Underlay", 40_000, 3), {
          fa: {
            shortDesc: "زیرانداز بهداشتی و راحت برای هر جلسه.",
            seoTitle: "زیرانداز لیزر | قیمت",
            seoDescription:
              "قیمت زیرانداز پک شخصی لیزر مو؛ برای رعایت بهداشت و راحتی در طول جلسات.",
          },
          en: {
            shortDesc: "Underlay for hygiene and comfort during sessions.",
            seoTitle: "Laser Underlay | Price",
            seoDescription:
              "Underlay for your personal laser kit — hygiene and comfort during sessions.",
          },
        }),
      ],
};
