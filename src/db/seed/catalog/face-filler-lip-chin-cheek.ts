import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const FILLER_LIP_CHIN_CATEGORY: SeedCategory = {
      slug: "filler-lip-chin-jaw-cheek-smile",
      icon: "syringe",
      displayOrder: 0,
      i18n: [
        {
          locale: "fa",
          name: "فیلر لب - چانه - زاویه - گونه - خط خنده",
          description:
            "فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و رفع خط خنده با برندهای معتبر فیلر؛ برای چهره‌ای متعادل‌تر و طبیعی.",
          seoTitle: "فیلر لب، چانه، زاویه فک، گونه و خط خنده | قیمت",
          seoDescription:
            "قیمت و مشاوره تزریق فیلر برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی و ظریف چهره با برندهای معتبر و نتیجه‌ای ماندگار.",
        },
        {
          locale: "en",
          name: "Lip - Chin - Jaw - Cheek - Smile Line Filler",
          description:
            "Lip, chin, jaw, cheek and smile-line contouring and volumizing with trusted filler brands for a more balanced, natural look.",
          seoTitle: "Lip, Chin, Jaw, Cheek & Smile Line Filler | Prices",
          seoDescription:
            "Lip, chin, jaw, cheek and smile line filler prices and consultation. Refine your facial contours with trusted brands and natural-looking results.",
        },
      ],
      services: [
        withSeo(svc("juvederm", "ژوویدرم", "Juvederm", 23_600_000, 0), {
          fa: {
            shortDesc: "فیلر ژوویدرم برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر ژوویدرم | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر ژوویدرم (Juvéderm) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره با ظاهری ماندگار.",
          },
          en: {
            shortDesc: "Juvederm filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Juvederm Filler | Price & Expert Injection",
            seoDescription:
              "Juvederm (Juvéderm) filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural-looking results.",
          },
        }),
        withSeo(svc("elansse", "الانسه", "Elansse", 22_200_000, 1), {
          fa: {
            shortDesc: "فیلر الانسه برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر الانسه | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر الانسه (Elansse) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی و ماندگار چهره.",
          },
          en: {
            shortDesc: "Elansse filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Elansse Filler | Price & Expert Injection",
            seoDescription:
              "Elansse filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural, long-lasting results.",
          },
        }),
        withSeo(svc("stylage", "استایلج", "Stylage", 19_500_000, 2), {
          fa: {
            shortDesc: "فیلر استایلج برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر استایلج | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر استایلج (Stylage) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی و ظریف چهره.",
          },
          en: {
            shortDesc: "Stylage filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Stylage Filler | Price & Expert Injection",
            seoDescription:
              "Stylage filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural, refined results.",
          },
        }),
        withSeo(svc("repleneal", "رپلنژل", "Repleneal", 15_900_000, 3), {
          fa: {
            shortDesc: "فیلر رپلنژل برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر رپلنژل | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر رپلنژل (Repleneal) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Repleneal filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Repleneal Filler | Price & Expert Injection",
            seoDescription:
              "Repleneal filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural-looking results.",
          },
        }),
        withSeo(svc("perfecta", "پرفکتا", "Perfecta", 7_390_000, 4), {
          fa: {
            shortDesc: "فیلر پرفکتا برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر پرفکتا | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر پرفکتا (Perfecta) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Perfecta filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Perfecta Filler | Price & Expert Injection",
            seoDescription:
              "Perfecta filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("revofil-plus", "رووفیل پلاس", "Revofil Plus", 7_200_000, 5), {
          fa: {
            shortDesc: "فیلر رووفیل پلاس برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر رووفیل پلاس | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر رووفیل پلاس (Revofil Plus) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Revofil Plus filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Revofil Plus Filler | Price & Expert Injection",
            seoDescription:
              "Revofil Plus filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("bella", "بلا", "Bella", 7_100_000, 6), {
          fa: {
            shortDesc: "فیلر بلا برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر بلا | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر بلا (Bella) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Bella filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Bella Filler | Price & Expert Injection",
            seoDescription:
              "Bella filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("innovance-lip-chin-cheek", "اینووسنس", "Innovance", 5_390_000, 7), {
          fa: {
            shortDesc: "فیلر اینووسنس برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر اینووسنس | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر اینووسنس (Innovance) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Innovance filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Innovance Filler | Price & Expert Injection",
            seoDescription:
              "Innovance filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("fillerge-lip-chin-cheek", "فیورج", "Fillerge", 4_790_000, 8), {
          fa: {
            shortDesc: "فیلر فیورج برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر فیورج | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر فیورج (Fillerge) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Fillerge filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Fillerge Filler | Price & Expert Injection",
            seoDescription:
              "Fillerge filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("dime", "دی می", "Dime", 4_690_000, 9), {
          fa: {
            shortDesc: "فیلر دی می برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر دی می | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر دی می (Dime) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Dime filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Dime Filler | Price & Expert Injection",
            seoDescription:
              "Dime filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("neuramis-lip-chin-cheek", "نورامیس", "Neuramis", 4_490_000, 10), {
          fa: {
            shortDesc: "فیلر نورامیس برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر نورامیس | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر نورامیس (Neuramis) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Neuramis filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Neuramis Filler | Price & Expert Injection",
            seoDescription:
              "Neuramis filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("dermarkin", "درم آرکین", "Dermarkin", 4_400_000, 11), {
          fa: {
            shortDesc: "فیلر درم آرکین برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر درم آرکین | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر درم آرکین (Dermarkin) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Dermarkin filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Dermarkin Filler | Price & Expert Injection",
            seoDescription:
              "Dermarkin filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("aptq", "ای.پی.تی.کیو", "APTQ", 2_390_000, 12), {
          fa: {
            shortDesc: "فیلر ای.پی.تی.کیو برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر ای.پی.تی.کیو | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر ای.پی.تی.کیو (APTQ) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "APTQ filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "APTQ Filler | Price & Expert Injection",
            seoDescription:
              "APTQ filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("zeishel", "زیشل", "Zeishel", 2_190_000, 13), {
          fa: {
            shortDesc: "فیلر زیشل برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر زیشل | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر زیشل (Zeishel) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Zeishel filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Zeishel Filler | Price & Expert Injection",
            seoDescription:
              "Zeishel filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("denby", "دنبی", "Denby", 1_990_000, 14), {
          fa: {
            shortDesc: "فیلر دنبی برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر دنبی | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر دنبی (Denby) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Denby filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Denby Filler | Price & Expert Injection",
            seoDescription:
              "Denby filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("revofil", "رووفیل", "Revofil", 1_650_000, 15), {
          fa: {
            shortDesc: "فیلر رووفیل برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر رووفیل | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر رووفیل (Revofil) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Revofil filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Revofil Filler | Price & Expert Injection",
            seoDescription:
              "Revofil filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
        withSeo(svc("audrey", "اودری", "Audrey", 1_350_000, 16), {
          fa: {
            shortDesc: "فیلر اودری برای فرم‌دهی و حجم‌دهی لب، چانه، زاویه فک، گونه و خط خنده.",
            seoTitle: "فیلر اودری | قیمت تزریق فیلر لب و صورت",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر اودری (Audrey) برای لب، چانه، زاویه فک، گونه و خط خنده؛ فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Audrey filler for contouring and volumizing the lips, chin, jawline, cheeks and smile lines.",
            seoTitle: "Audrey Filler | Price & Expert Injection",
            seoDescription:
              "Audrey filler prices and expert consultation for lips, chin, jawline, cheeks and smile lines with natural results.",
          },
        }),
      ],
};
