import { LOWER_FACE_BRANDS } from "./filler-brands";
import { buildFillerAreaCategories } from "./filler-area-builder";

/** Five separately manageable subcategories requested for face filler. */
export const FACE_FILLER_AREA_CATEGORIES = buildFillerAreaCategories(
  [
    {
      key: "lip",
      faName: "ناحیه لب",
      enName: "Lip Area",
      faDescription: "خدمات فیلر ناحیه لب با امکان مشاهده جزئیات و تصاویر هر خدمت.",
      enDescription: "Filler services for the lips, with individual treatment details and photos.",
    },
    {
      key: "cheek",
      faName: "ناحیه گونه",
      enName: "Cheek Area",
      faDescription: "خدمات فیلر ناحیه گونه با امکان مشاهده جزئیات و تصاویر هر خدمت.",
      enDescription: "Filler services for the cheeks, with individual treatment details and photos.",
    },
    {
      key: "chin",
      faName: "ناحیه چانه",
      enName: "Chin Area",
      faDescription: "خدمات فیلر ناحیه چانه با امکان مشاهده جزئیات و تصاویر هر خدمت.",
      enDescription: "Filler services for the chin, with individual treatment details and photos.",
    },
    {
      key: "jaw-angle",
      faName: "ناحیه زاویه فک",
      enName: "Jaw Angle",
      faDescription: "خدمات فیلر ناحیه زاویه فک با امکان مشاهده جزئیات و تصاویر هر خدمت.",
      enDescription: "Filler services for the jaw angle, with individual treatment details and photos.",
    },
    {
      key: "smile-line",
      faName: "ناحیه خط خنده",
      enName: "Smile Lines",
      faDescription: "خدمات فیلر ناحیه خط خنده با امکان مشاهده جزئیات و تصاویر هر خدمت.",
      enDescription: "Filler services for smile lines, with individual treatment details and photos.",
    },
  ],
  LOWER_FACE_BRANDS,
  "face-filler",
);
