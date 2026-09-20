import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const MESO_ANTISPOT_CATEGORY: SeedCategory = {
  slug: "meso-antispot-services",
  icon: "droplet",
  displayOrder: 1,
  i18n: [
    {
      locale: "fa",
      name: "مزو ضدلک",
      description:
        "مزو ضدلک و روشن‌سازی برای کاهش لک، یکدست‌سازی رنگ و شفاف‌تر شدن پوست؛ متناسب با نوع پوست و نیاز شما.",
      seoTitle: "مزو ضدلک | روشن‌سازی و یکدست‌سازی",
      seoDescription:
        "قیمت مزو ضدلک و روشن‌سازی برای کاهش لک، یکدست‌سازی رنگ پوست و شفاف‌تر شدن ظاهر پوست.",
    },
    {
      locale: "en",
      name: "Meso Anti-Spot",
      description:
        "Meso anti-spot and brightening services to reduce pigmentation, even out tone and clarify the skin.",
      seoTitle: "Meso Anti-Spot | Brightening & Even Tone",
      seoDescription:
        "Meso anti-spot and brightening prices to reduce pigmentation, even out skin tone and clarify the complexion.",
    },
  ],
  services: [
    withSeo(
      svc("meso-antispot-single", "مزو ضدلک (هر جلسه)", "Meso Anti-Spot (Per Session)", 1_890_000, 0),
      {
        fa: {
          shortDesc: "مزو ضدلک در هر جلسه برای کاهش تدریجی لک و یکدستی رنگ پوست.",
          seoTitle: "مزو ضدلک | قیمت هر جلسه",
          seoDescription:
            "قیمت مزو ضدلک در هر جلسه برای کاهش تدریجی لک، یکدست‌سازی رنگ و شفاف‌تر شدن پوست.",
        },
        en: {
          shortDesc: "Per-session meso anti-spot to gradually reduce pigmentation and even out tone.",
          seoTitle: "Meso Anti-Spot | Price per Session",
          seoDescription:
            "Per-session meso anti-spot price to gradually reduce pigmentation, even out tone and clarify skin.",
        },
      },
    ),
    withSeo(
      svc(
        "meso-antispot-package-4",
        "پکیج ۴ جلسه مزو ضدلک",
        "Meso Anti-Spot Package (4 Sessions)",
        6_900_000,
        1,
      ),
      {
        fa: {
          shortDesc: "پکیج ۴ جلسه مزو ضدلک برای یک دوره کامل روشن‌سازی با صرفه‌جویی.",
          seoTitle: "پکیج مزو ضدلک | قیمت ۴ جلسه",
          seoDescription:
            "قیمت پکیج ۴ جلسه مزو ضدلک برای یک دوره کامل کاهش لک و روشن‌سازی با صرفه‌جویی.",
        },
        en: {
          shortDesc: "4-session meso anti-spot package for a full brightening course at a better value.",
          seoTitle: "Meso Anti-Spot Package | 4 Sessions",
          seoDescription:
            "4-session meso anti-spot package price for a complete pigmentation and brightening course.",
        },
      },
    ),
    withSeo(
      svc(
        "skin-brightening-session",
        "روشن‌سازی و یکدست‌سازی پوست",
        "Skin Brightening & Tone Correction",
        2_490_000,
        2,
      ),
      {
        fa: {
          shortDesc: "روشن‌سازی و یکدست‌سازی پوست برای کاهش کدری و بهبود شفافیت.",
          seoTitle: "روشن‌سازی و یکدست‌سازی پوست | قیمت",
          seoDescription:
            "قیمت روشن‌سازی و یکدست‌سازی پوست برای کاهش کدری، بهبود شفافیت و رنگ یکدست‌تر.",
        },
        en: {
          shortDesc: "Brightening and tone correction to reduce dullness and improve clarity.",
          seoTitle: "Skin Brightening & Tone Correction | Price",
          seoDescription:
            "Skin brightening and tone correction price to reduce dullness, improve clarity and even out tone.",
        },
      },
    ),
    withSeo(
      svc(
        "meso-antispot-face-neck",
        "مزو ضدلک صورت و گردن",
        "Meso Anti-Spot (Face & Neck)",
        2_190_000,
        3,
      ),
      {
        fa: {
          shortDesc: "مزو ضدلک صورت و گردن برای کاهش لک در نواحی نمایان پوست.",
          seoTitle: "مزو ضدلک صورت و گردن | قیمت",
          seoDescription:
            "قیمت مزو ضدلک صورت و گردن برای کاهش لک و یکدست‌سازی نواحی نمایان پوست.",
        },
        en: {
          shortDesc: "Meso anti-spot for the face and neck to reduce pigmentation in visible areas.",
          seoTitle: "Meso Anti-Spot (Face & Neck) | Price",
          seoDescription:
            "Meso anti-spot price for the face and neck to reduce pigmentation and even out visible areas.",
        },
      },
    ),
    withSeo(
      svc("meso-antispot-body", "مزو ضدلک بدن", "Meso Anti-Spot (Body)", 2_590_000, 4),
      {
        fa: {
          shortDesc: "مزو ضدلک بدن برای کاهش لک و یکدست‌سازی رنگ پوست نواحی بدن.",
          seoTitle: "مزو ضدلک بدن | قیمت",
          seoDescription:
            "قیمت مزو ضدلک بدن برای کاهش لک و یکدست‌سازی رنگ پوست در نواحی مختلف بدن.",
        },
        en: {
          shortDesc: "Meso anti-spot for the body to reduce pigmentation and even out skin tone.",
          seoTitle: "Meso Anti-Spot (Body) | Price",
          seoDescription:
            "Meso anti-spot price for the body to reduce pigmentation and even out skin tone across areas.",
        },
      },
    ),
  ],
};
