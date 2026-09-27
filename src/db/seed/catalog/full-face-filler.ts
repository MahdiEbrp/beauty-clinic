import type { SeedGroup } from "./types";
import { FULL_FACE_PACKAGES_CATEGORY } from "./full-face-packages";
import { FILLER_10CC_CATEGORY } from "./face-filler-10cc";
import { IMG } from "../images";

export const FULL_FACE_FILLER_GROUP: SeedGroup = {
  slug: "full-face-filler",
  icon: "facial",
  image: IMG.fullFiller,
  displayOrder: 2,
  i18n: [
    {
      locale: "fa",
      name: "پک‌های کانتورینگ و فول فیس",
      description:
        "تعادل چهره را بازگردانید و زیبایی طبیعی خود را ظریف‌تر برجسته کنید.\nفیلر فول فیس با ترکیب فرم‌دهی دقیق و بهبود حجم نواحی مختلف صورت، به ایجاد چهره‌ای هماهنگ‌تر، شاداب‌تر و متعادل‌تر کمک می‌کند.",
      seoTitle: "پک‌های کانتورینگ و فول فیس | فرم‌دهی و حجم‌دهی صورت",
      seoDescription:
        "با فیلر فول فیس، حجم و فرم نواحی مختلف صورت را متناسب با ویژگی‌های چهره بهبود دهید و به ظاهری متعادل، شاداب و طبیعی برسید.",
    },
    {
      locale: "en",
      name: "Contouring & Full Face Packages",
      description:
        "Restore balance, refine your features, and enhance your natural beauty.\nFull Face Filler combines precise facial contouring and volume enhancement to create a more harmonious, refreshed, and naturally balanced appearance.",
      seoTitle: "Contouring & Full Face Packages | Facial Contouring",
      seoDescription:
        "Enhance facial harmony with personalized full face filler. Refine contours, restore volume, and create a balanced, naturally refreshed appearance.",
    },
  ],
  categories: [FULL_FACE_PACKAGES_CATEGORY, FILLER_10CC_CATEGORY],
};