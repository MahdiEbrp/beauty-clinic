import type { SeedGroup } from "./types";
import { UPPER_FACE_BRANDS } from "./filler-brands";
import { buildFillerAreaCategories } from "./filler-area-builder";
import { IMG } from "../images";

export const SENSITIVE_FILLER_GROUP: SeedGroup = {
  slug: "sensitive-filler",
  icon: "facial",
  image: IMG.filler,
  displayOrder: 2,
  i18n: [
    {
      locale: "fa",
      name: "فیلر نواحی حساس",
      description: "خدمات فیلر نواحی حساس صورت شامل زیر چشم، پیشانی، شقیقه و بینی.",
      seoTitle: "فیلر نواحی حساس | زیر چشم، پیشانی، شقیقه و بینی",
      seoDescription: "معرفی خدمات فیلر برای نواحی حساس صورت با جزئیات و تصاویر قابل مدیریت.",
    },
    {
      locale: "en",
      name: "Sensitive Areas Filler",
      description: "Filler services for sensitive facial areas including under-eyes, forehead, temples and nose.",
      seoTitle: "Sensitive Areas Filler | Under-eyes, Forehead, Temples & Nose",
      seoDescription: "Explore filler services for sensitive facial areas with editable details and photos.",
    },
  ],
  categories: buildFillerAreaCategories(
    [
      {
        key: "under-eye",
        faName: "زیر چشم",
        enName: "Under-eye",
        faDescription: "خدمات فیلر زیر چشم با امکان مشاهده جزئیات و تصاویر هر خدمت.",
        enDescription: "Under-eye filler services, with individual treatment details and photos.",
      },
      {
        key: "forehead",
        faName: "پیشانی",
        enName: "Forehead",
        faDescription: "خدمات فیلر پیشانی با امکان مشاهده جزئیات و تصاویر هر خدمت.",
        enDescription: "Forehead filler services, with individual treatment details and photos.",
      },
      {
        key: "temple",
        faName: "شقیقه",
        enName: "Temples",
        faDescription: "خدمات فیلر شقیقه با امکان مشاهده جزئیات و تصاویر هر خدمت.",
        enDescription: "Temple filler services, with individual treatment details and photos.",
      },
      {
        key: "nose",
        faName: "بینی",
        enName: "Nose",
        faDescription: "خدمات فیلر بینی با امکان مشاهده جزئیات و تصاویر هر خدمت.",
        enDescription: "Nose filler services, with individual treatment details and photos.",
      },
    ],
    UPPER_FACE_BRANDS,
    "sensitive-filler",
  ),
};
