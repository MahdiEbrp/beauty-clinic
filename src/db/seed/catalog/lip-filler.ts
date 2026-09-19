import type { SeedGroup } from "./types";
import { FILLER_LIP_CHIN_CATEGORY } from "./face-filler-lip-chin-cheek";
import { IMG } from "../images";

export const LIP_FILLER_GROUP: SeedGroup = {
  slug: "lip-filler",
  icon: "Syringe",
  image: IMG.filler,
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "فیلر لب",
      description:
        "لب‌هایی طبیعی و متناسب با چهره خودتان.\nبا فیلر لب، حجم و فرم لب به‌صورت ظریف بازسازی می‌شود؛ نتیجه‌ای متعادل و طبیعی که همچنان خودِ شماست.",
      seoTitle: "فیلر لب | حجم‌دهی طبیعی و ظریف لب",
      seoDescription:
        "با فیلر لب، حجم و فرم لب را ظریف و متناسب با چهره خود بازسازی کنید؛ برای نتیجه‌ای طبیعی، متعادل و شاداب.",
    },
    {
      locale: "en",
      name: "Lip Filler",
      description:
        "Natural, balanced lip enhancement.\nLip filler restores volume and shape with a subtle finish that still looks like you.",
      seoTitle: "Lip Filler | Natural, Refined Volume",
      seoDescription:
        "Restore lip volume and definition with expert lip filler for a natural, balanced and refreshed look.",
    },
  ],
  categories: [FILLER_LIP_CHIN_CATEGORY],
};
