import type { SeedGroup } from "./types";
import { FACE_FILLER_AREA_CATEGORIES } from "./filler-areas";
import { IMG } from "../images";

export const FACE_FILLER_GROUP: SeedGroup = {
  slug: "face-filler",
  icon: "facial",
  image: IMG.filler,
  displayOrder: 1,
  i18n: [
    {
      locale: "fa",
      name: "فیلر صورت",
      description:
        "زیبایی طبیعی خود را با فیلرهای ظریف و حرفه‌ای برجسته‌تر کنید.\nبا بازگرداندن حجم از دست‌رفته، کاهش خطوط ظریف و فرم‌دهی لب، گونه یا چانه، چهره‌ای شاداب‌تر و متعادل‌تر داشته باشید؛ طوری که همچنان خودِ واقعی شما باشید.",
      seoTitle: "فیلر صورت | فرم‌دهی طبیعی و ظریف چهره",
      seoDescription:
        "با فیلر صورت، حجم از دست‌رفته را بازگردانید، خطوط ظریف را کاهش دهید و لب، گونه یا چانه را با ظرافت فرم دهید؛ برای چهره‌ای شاداب و متعادل.",
    },
    {
      locale: "en",
      name: "Face Filler",
      description:
        "Enhance your natural beauty with subtle, elegant facial fillers.\nRestore lost volume, soften fine lines, and beautifully define your lips, cheeks, or chin — for a refreshed look that still feels like you.",
      seoTitle: "Face Filler Service | Natural, Refined Results",
      seoDescription:
        "Enhance your natural beauty with expert face filler services. Restore volume, soften lines, and define lips, cheeks, or chin for a refreshed, balanced look.",
    },
  ],
  categories: FACE_FILLER_AREA_CATEGORIES,
};
