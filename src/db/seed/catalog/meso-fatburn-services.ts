import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const MESO_FATBURN_CATEGORY: SeedCategory = {
  slug: "meso-fatburn-services",
  icon: "droplet",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "مزوچربی‌سوز",
      description:
        "مزوچربی‌سوز برای کاهش موضعی چربی در نواحی مختلف بدن؛ متناسب با ناحیه و نیاز شما و با رویکردی تدریجی و ایمن.",
      seoTitle: "مزوچربی‌سوز | لاغری موضعی",
      seoDescription:
        "قیمت مزوچربی‌سوز برای کاهش موضعی چربی شکم، پهلو، بازو و ران؛ متناسب با ناحیه و نیاز شما.",
    },
    {
      locale: "en",
      name: "Meso Fat-Burning",
      description:
        "Meso fat-burning for targeted reduction of localized fat across different body areas, tailored to your needs.",
      seoTitle: "Meso Fat-Burning | Targeted Fat Reduction",
      seoDescription:
        "Meso fat-burning prices for targeted reduction of fat in the abdomen, flanks, arms and thighs.",
    },
  ],
  services: [
    withSeo(
      svc(
        "meso-fatburn-single",
        "مزو چربی‌سوز (هر جلسه)",
        "Meso Fat-Burning (Per Session)",
        1_890_000,
        0,
      ),
      {
        fa: {
          shortDesc: "مزو چربی‌سوز در هر جلسه برای کاهش تدریجی چربی موضعی.",
          seoTitle: "مزو چربی‌سوز | قیمت هر جلسه",
          seoDescription:
            "قیمت مزو چربی‌سوز در هر جلسه برای کاهش تدریجی چربی موضعی و بهبود فرم نواحی بدن.",
        },
        en: {
          shortDesc: "Per-session meso fat-burning to gradually reduce localized fat.",
          seoTitle: "Meso Fat-Burning | Price per Session",
          seoDescription:
            "Per-session meso fat-burning price to gradually reduce localized fat and improve body contours.",
        },
      },
    ),
    withSeo(
      svc(
        "meso-fatburn-package-4",
        "پکیج ۴ جلسه مزو چربی‌سوز",
        "Meso Fat-Burning Package (4 Sessions)",
        6_900_000,
        1,
      ),
      {
        fa: {
          shortDesc: "پکیج ۴ جلسه مزو چربی‌سوز برای یک دوره کامل با صرفه‌جویی.",
          seoTitle: "پکیج مزو چربی‌سوز | قیمت ۴ جلسه",
          seoDescription:
            "قیمت پکیج ۴ جلسه مزو چربی‌سوز برای یک دوره کامل کاهش چربی موضعی با صرفه‌جویی.",
        },
        en: {
          shortDesc: "4-session meso fat-burning package for a full course at a better value.",
          seoTitle: "Meso Fat-Burning Package | 4 Sessions",
          seoDescription:
            "4-session meso fat-burning package price for a complete course of localized fat reduction.",
        },
      },
    ),
    withSeo(
      svc(
        "meso-fatburn-abdomen",
        "مزو چربی‌سوز شکم و پهلو",
        "Meso Fat-Burning (Abdomen & Flanks)",
        2_290_000,
        2,
      ),
      {
        fa: {
          shortDesc: "مزو چربی‌سوز شکم و پهلو برای کاهش موضعی و فرم‌دهی ناحیه میانی.",
          seoTitle: "مزو چربی‌سوز شکم و پهلو | قیمت",
          seoDescription:
            "قیمت مزو چربی‌سوز شکم و پهلو برای کاهش موضعی چربی و بهبود فرم ناحیه میانی بدن.",
        },
        en: {
          shortDesc: "Meso fat-burning for the abdomen and flanks to reduce fat and refine the midsection.",
          seoTitle: "Meso Fat-Burning (Abdomen & Flanks) | Price",
          seoDescription:
            "Meso fat-burning price for the abdomen and flanks to reduce localized fat and refine the midsection.",
        },
      },
    ),
    withSeo(
      svc("meso-fatburn-arm", "مزو چربی‌سوز بازو", "Meso Fat-Burning (Arms)", 1_990_000, 3),
      {
        fa: {
          shortDesc: "مزو چربی‌سوز بازو برای کاهش موضعی چربی و فرم‌دهی بازو.",
          seoTitle: "مزو چربی‌سوز بازو | قیمت",
          seoDescription:
            "قیمت مزو چربی‌سوز بازو برای کاهش موضعی چربی و بهبود فرم و تعریف ناحیه بازو.",
        },
        en: {
          shortDesc: "Meso fat-burning for the arms to reduce localized fat and improve definition.",
          seoTitle: "Meso Fat-Burning (Arms) | Price",
          seoDescription:
            "Meso fat-burning price for the arms to reduce localized fat and improve tone and definition.",
        },
      },
    ),
    withSeo(
      svc("meso-fatburn-thigh", "مزو چربی‌سوز ران", "Meso Fat-Burning (Thighs)", 2_190_000, 4),
      {
        fa: {
          shortDesc: "مزو چربی‌سوز ران برای کاهش موضعی چربی و فرم‌دهی ناحیه ران.",
          seoTitle: "مزو چربی‌سوز ران | قیمت",
          seoDescription:
            "قیمت مزو چربی‌سوز ران برای کاهش موضعی چربی و بهبود فرم و تناسب ناحیه ران.",
        },
        en: {
          shortDesc: "Meso fat-burning for the thighs to reduce localized fat and improve shape.",
          seoTitle: "Meso Fat-Burning (Thighs) | Price",
          seoDescription:
            "Meso fat-burning price for the thighs to reduce localized fat and improve shape and proportion.",
        },
      },
    ),
    withSeo(
      svc(
        "meso-fatburn-double-chin",
        "مزو چربی‌سوز غبغب",
        "Meso Fat-Burning (Double Chin)",
        1_690_000,
        5,
      ),
      {
        fa: {
          shortDesc: "مزو چربی‌سوز غبغب برای کاهش چربی موضعی و بهبود خط فک.",
          seoTitle: "مزو چربی‌سوز غبغب | قیمت",
          seoDescription:
            "قیمت مزو چربی‌سوز غبغب برای کاهش چربی موضعی و بهبود تعریف و خط فک.",
        },
        en: {
          shortDesc: "Meso fat-burning for the double chin to reduce fat and improve jawline definition.",
          seoTitle: "Meso Fat-Burning (Double Chin) | Price",
          seoDescription:
            "Meso fat-burning price for the double chin to reduce localized fat and improve jawline definition.",
        },
      },
    ),
  ],
};
