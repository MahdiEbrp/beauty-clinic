import { db } from "../index";
import {
  serviceCategories,
  serviceCategoriesI18n,
  serviceGroups,
  serviceGroupsI18n,
  services,
  servicesI18n,
} from "../schema";
import { inArray } from "drizzle-orm";

type PriceService = {
  slug: string;
  faTitle: string;
  enTitle: string;
  price: number | null;
  displayOrder: number;
  priceType: "fixed" | "from" | "on_request";
};

type PriceCategory = {
  slug: string;
  faName: string;
  enName: string;
  faDesc: string;
  enDesc: string;
  displayOrder: number;
  services: PriceService[];
};

type PriceGroup = {
  slug: string;
  faName: string;
  enName: string;
  faDesc: string;
  enDesc: string;
  displayOrder: number;
  categories: PriceCategory[];
};

/**
 * Section order (matching the reference pricing page, 10 sections):
 *
 * Right column (top to bottom):
 *   1. face-filler        -> فیلر صورت (+ فیلر نقاط حساس)
 *   2. pack-contouring    -> پک‌های کانتورینگ و فول فیس
 *   3. botox              -> بوتاکس
 *   4. enzyme             -> آنزیم از بین برنده فیلر
 *   5. body-filler        -> فیلر بدن (باسن و بیکینی)
 *
 * Left column (top to bottom):
 *   6. meso-rejuvenation  -> مizu ژل - مizu مو - جوانساز - درمان پوستی
 *   7. hair-strengthening -> تقویت مو
 *   8. fat-dissolving     -> چربی‌سوزی و لاغری موضعی
 *   9. skin-treatments    -> درمان‌های پوستی
 *  10. thread-lift        -> نخ لیفت صورت
 */
const GROUPS: PriceGroup[] = [
  // ===== RIGHT COLUMN =====
  {
    slug: "face-filler",
    faName: "فیلر صورت",
    enName: "Face Filler",
    faDesc:
      "زیبایی طبیعی خود را با فیلرهای ظریف و حرفه‌ای برجسته‌تر کنید. با بازگرداندن حجم از دست‌رفته، کاهش خطوط ظریف و فرم‌دهی لب، گونه یا چانه، چهره‌ای شاداب‌تر و متعادل‌تر داشته باشید؛ طوری که همچنان خودِ واقعی شما باشید.",
    enDesc:
      "Enhance your natural beauty with subtle, elegant facial fillers. Restore lost volume, soften fine lines, and beautifully define your lips, cheeks, or chin.",
    displayOrder: 1,
    categories: [
      {
        slug: "face-filler-brands",
        faName: "برندهای فیلر لب و صورت",
        enName: "Face Filler Brands",
        faDesc: "فیلر لب و صورت با برندهای معتبر و متنوع.",
        enDesc: "Face filler with reputable and diverse brands.",
        displayOrder: 1,
        services: [
          // Order: highest price first (per reference image)
          { slug: "face-filler-juvederm", faTitle: "ژوویدرم", enTitle: "Juvederm", price: 26_490_000, displayOrder: 1, priceType: "fixed" },
          { slug: "face-filler-illunse", faTitle: "الانس", enTitle: "Illunse", price: 24_900_000, displayOrder: 2, priceType: "fixed" },
          { slug: "face-filler-stylage", faTitle: "استایلیج", enTitle: "Stylage", price: 23_900_000, displayOrder: 3, priceType: "fixed" },
          { slug: "face-filler-revolax", faTitle: "ریلن", enTitle: "Revolax", price: 15_900_000, displayOrder: 4, priceType: "fixed" },
          { slug: "face-filler-perfecta", faTitle: "پرفکتا", enTitle: "Perfecta", price: 10_900_000, displayOrder: 5, priceType: "fixed" },
          { slug: "face-filler-restylane-plus", faTitle: "رووفیل پلاس", enTitle: "Restylane Plus", price: 9_900_000, displayOrder: 6, priceType: "fixed" },
          { slug: "face-filler-innosense", faTitle: "اینووسنس", enTitle: "Innosense", price: 6_590_000, displayOrder: 7, priceType: "fixed" },
          { slug: "face-filler-fillorga", faTitle: "فیورج", enTitle: "Fillorga", price: 6_290_000, displayOrder: 8, priceType: "fixed" },
          { slug: "face-filler-de-moi", faTitle: "دی می", enTitle: "De Moi", price: 5_990_000, displayOrder: 9, priceType: "fixed" },
          { slug: "face-filler-derm-arcane", faTitle: "درم آرکان", enTitle: "Derm Arcane", price: 5_390_000, displayOrder: 10, priceType: "fixed" },
          { slug: "face-filler-eptq", faTitle: "اپی تی کیو", enTitle: "eptq", price: 2_990_000, displayOrder: 11, priceType: "fixed" },
          { slug: "face-filler-zishal", faTitle: "زیشل", enTitle: "Zishal", price: 2_690_000, displayOrder: 12, priceType: "fixed" },
          { slug: "face-filler-deneb", faTitle: "دنبی", enTitle: "Deneb", price: 2_490_000, displayOrder: 13, priceType: "fixed" },
          { slug: "face-filler-restylane", faTitle: "رووفیل", enTitle: "Restylane", price: 2_190_000, displayOrder: 14, priceType: "fixed" },
          { slug: "face-filler-audry", faTitle: "اودری", enTitle: "Audry", price: 1_890_000, displayOrder: 15, priceType: "fixed" },
        ],
      },
      {
        slug: "face-filler-sensitive",
        faName: "فیلر نقاط حساس",
        enName: "Sensitive Areas Filler",
        faDesc: "فیلر برای نقاط حساس چهره با برندهای معتبر.",
        enDesc: "Filler for sensitive facial areas with reputable brands.",
        displayOrder: 2,
        services: [
          { slug: "sensitive-innosense", faTitle: "اینووسنس (فیلر نقاط حساس)", enTitle: "Innosense (Sensitive)", price: 6_790_000, displayOrder: 1, priceType: "fixed" },
          { slug: "sensitive-fillorga", faTitle: "فیورج (فیلر نقاط حساس)", enTitle: "Fillorga (Sensitive)", price: 6_390_000, displayOrder: 2, priceType: "fixed" },
          { slug: "sensitive-de-moi", faTitle: "دی می (فیلر نقاط حساس)", enTitle: "De Moi (Sensitive)", price: 6_190_000, displayOrder: 3, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "pack-contouring",
    faName: "پک‌های کانتورینگ و فول فیس",
    enName: "Contouring & Full Face Packs",
    faDesc: "ترIMITاز چهره را بازگردانید و زیبایی طبیعی خود را ظریف‌تر برجسته کنید. فیلر فول فیس با ترکیب فرم‌دهی دقیق و بهبود حجم نواحی مختلف صورت، به ایجاد چهره‌ای هماهنگ‌تر، شاداب‌تر و متعادل‌تر کمک می‌کند.",
    enDesc: "Restore facial balance and highlight your natural beauty more subtly. Full face filler with precise contouring and volume enhancement across different areas helps create a more harmonious, radiant, and balanced face.",
    displayOrder: 2,
    categories: [
      {
        slug: "full-face-packs",
        faName: "پکیج‌های فول فیس",
        enName: "Full Face Packs",
        faDesc: "پکیج‌های حجم‌دهی و فرم‌دهی کامل صورت با ترکیب چند ناحیه؛ متناسب با نیاز چهره شما و با نتیجه‌ای هماهنگ و طبیعی.",
        enDesc: "Full face volume and contouring packages combining multiple areas; tailored to your face's needs with a harmonious and natural result.",
        displayOrder: 1,
        services: [
          { slug: "ffp-3cc", faTitle: "پک فول فیس ۳ سی‌سی", enTitle: "Full Face Pack 3cc", price: 12_900_000, displayOrder: 1, priceType: "fixed" },
          { slug: "ffp-5cc", faTitle: "پک فول فیس ۵ سی‌سی", enTitle: "Full Face Pack 5cc", price: 19_900_000, displayOrder: 2, priceType: "fixed" },
          { slug: "ffp-8cc", faTitle: "پک فول فیس ۸ سی‌سی", enTitle: "Full Face Pack 8cc", price: 29_900_000, displayOrder: 3, priceType: "fixed" },
          { slug: "ffp-custom", faTitle: "پک فول فیس اختصاصی", enTitle: "Full Face Pack Custom", price: 39_900_000, displayOrder: 4, priceType: "from" },
        ],
      },
      {
        slug: "pack-10cc-brands",
        faName: "برندهای پک ۱۰ سی سی",
        enName: "Pack 10cc Brands",
        faDesc: "پک ۱۰ سیسی با برندهای مختلف.",
        enDesc: "Pack 10cc with different brands.",
        displayOrder: 2,
        services: [
          { slug: "pack-10cc-eptq", faTitle: "اپی تی کیو", enTitle: "Pack eptq", price: 24_900_000, displayOrder: 1, priceType: "fixed" },
          { slug: "pack-10cc-zishal", faTitle: "زیشل", enTitle: "Pack Zishal", price: 20_900_000, displayOrder: 2, priceType: "fixed" },
          { slug: "pack-10cc-deneb", faTitle: "دنبی", enTitle: "Pack Deneb", price: 18_900_000, displayOrder: 3, priceType: "fixed" },
          { slug: "pack-10cc-restylane", faTitle: "رووفیل", enTitle: "Pack Restylane", price: 15_900_000, displayOrder: 4, priceType: "fixed" },
          { slug: "pack-10cc-audry", faTitle: "اودری", enTitle: "Pack Audry", price: 13_900_000, displayOrder: 5, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "botox",
    faName: "بوتاکس",
    enName: "Botox",
    faDesc: "با بوتاکس، خطوط صورت را نرم‌تر کرده و فرم و تعادل چهره را متناسب با ویژگی‌های شما بهبود دهید.",
    enDesc: "Refine your features, soften expression lines, and restore facial balance with personalized Botox treatments.",
    displayOrder: 3,
    categories: [
      {
        slug: "botox-areas",
        faName: "نواحی بوتاکس",
        enName: "Botox Areas",
        faDesc: "بوتاکس برای نواحی مختلف چهره و بدن.",
        enDesc: "Botox for different face and body areas.",
        displayOrder: 1,
        services: [
          { slug: "botox-full-face", faTitle: "فول فیس", enTitle: "Full Face", price: 1_890_000, displayOrder: 1, priceType: "fixed" },
          { slug: "botox-cat-eye", faTitle: "چشم گربه ای", enTitle: "Cat Eye", price: 1_690_000, displayOrder: 2, priceType: "fixed" },
          { slug: "botox-gummy-smile", faTitle: "لبخند لثه ای", enTitle: "Gummy Smile", price: 890_000, displayOrder: 3, priceType: "fixed" },
          { slug: "botox-sweating", faTitle: "تعریق", enTitle: "Sweating", price: 3_290_000, displayOrder: 4, priceType: "fixed" },
          { slug: "botox-migraine", faTitle: "میگرن", enTitle: "Migraine", price: 2_390_000, displayOrder: 5, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "enzyme",
    faName: "آنزیم از بین برنده فیلر",
    enName: "Enzyme - Filler Dissolver",
    faDesc: "خدمات انزیم برای حذف مواد تزریقی.",
    enDesc: "Enzyme for dissolving injected materials.",
    displayOrder: 4,
    categories: [
      {
        slug: "enzyme-services",
        faName: "خدمات انزیم",
        enName: "Enzyme Services",
        faDesc: "انزیم هیالورونیداز برای از بین بردن فیلر.",
        enDesc: "Hyaluronidase enzyme for filler removal.",
        displayOrder: 1,
        services: [
          { slug: "enzyme-anzyne", faTitle: "آنزیم هیالورونیداز (انگلیسی)", enTitle: "Hyaluronidase (English)", price: 2_190_000, displayOrder: 1, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "body-filler",
    faName: "فیلر بدن (باسن و بیکینی)",
    enName: "Body Filler (Hips & Bikini)",
    faDesc: "فرم طبیعی بدن خود را با روشی ظریف و متناسب با ویژگی‌های شما زیباتر کنید. با هدف بهبود حجم، تناسب و فرم در نواحی منتخب، برای ایجاد ظاهری متعادل‌تر، هماهنگ‌تر و جذاب‌تر.",
    enDesc: "Enhance your body's natural contours with a refined, personalized approach. Aiming to improve volume, proportion, and shape in selected areas, to create a more balanced, harmonious, and attractive appearance.",
    displayOrder: 5,
    categories: [
      {
        slug: "body-filler-hips",
        faName: "فیلر باسن",
        enName: "Hips Filler",
        faDesc: "فرم‌دهی و حجم‌دهی طبیعی باسن با فیلر؛ تناسب و کانتور بهتر متناسب با اندام شما.",
        enDesc: "Natural shaping and volumizing of hips with filler; better proportion and contour tailored to your body.",
        displayOrder: 1,
        services: [
          { slug: "body-filler-hips-per-cc", faTitle: "فیلر باسن هر سی‌سی", enTitle: "Hips Filler per cc", price: 390_000, displayOrder: 1, priceType: "from" },
          { slug: "body-filler-hips-50cc", faTitle: "فیلر باسن ۵۰ سی‌سی", enTitle: "Hips Filler 50cc", price: 18_500_000, displayOrder: 2, priceType: "fixed" },
          { slug: "body-filler-hips-100cc", faTitle: "فیلر باسن ۱۰۰ سی‌سی", enTitle: "Hips Filler 100cc", price: 34_900_000, displayOrder: 3, priceType: "fixed" },
        ],
      },
      {
        slug: "body-filler-bikini",
        faName: "فیلر بیکینی",
        enName: "Bikini Filler",
        faDesc: "فرم‌دهی و حجم‌دهی ناحیه بیکینی با فیلر؛ رویکردی ظریف، ایمن و متناسب.",
        enDesc: "Shaping and volumizing the bikini area with filler; a refined, safe, and tailored approach.",
        displayOrder: 2,
        services: [
          { slug: "body-filler-bikini-per-cc", faTitle: "فیلر بیکینی هر سی‌سی", enTitle: "Bikini Filler per cc", price: 390_000, displayOrder: 1, priceType: "from" },
          { slug: "body-filler-bikini-50cc", faTitle: "فیلر بیکینی ۵۰ سی‌سی", enTitle: "Bikini Filler 50cc", price: 18_500_000, displayOrder: 2, priceType: "fixed" },
          { slug: "body-filler-bikini-100cc", faTitle: "فیلر بیکینی ۱۰۰ سی‌سی", enTitle: "Bikini Filler 100cc", price: 34_900_000, displayOrder: 3, priceType: "fixed" },
        ],
      },
    ],
  },
  // ===== LEFT COLUMN =====
  {
    slug: "meso-rejuvenation",
    faName: "مizu ژل - مizu مو - جوانساز - درمان پوستی",
    enName: "Meso Gel - Meso Hair - Rejuvenation - Skin Treatment",
    faDesc: "سرویس‌های مizuتراپی و جوانساز پوستی با برندهای معتبر.",
    enDesc: "Mesotherapy and skin rejuvenation services with reputable brands.",
    displayOrder: 6,
    categories: [
      {
        slug: "meso-services",
        faName: "خدمات مizuتراپی",
        enName: "Mesotherapy Services",
        faDesc: "مizuتراپی، پلازما، و جوانسازی پوستی.",
        enDesc: "Mesotherapy, PRP, and skin rejuvenation.",
        displayOrder: 1,
        services: [
          { slug: "meso-keyara-gel", faTitle: "مizu 젤 کیارا", enTitle: "Meso Gel Keyara", price: 3_900_000, displayOrder: 1, priceType: "fixed" },
          { slug: "meso-provoyaj", faTitle: "مizu 젤 پروایج", enTitle: "Meso Gel Provoyaj", price: 5_790_000, displayOrder: 2, priceType: "fixed" },
          { slug: "meso-face", faTitle: "مizuتراپی صورت", enTitle: "Meso Face", price: 1_990_000, displayOrder: 3, priceType: "fixed" },
          { slug: "meso-undereye", faTitle: "مizuتراپی زیر چشم", enTitle: "Meso Undereye", price: 1_990_000, displayOrder: 4, priceType: "fixed" },
          { slug: "meso-prp-skin", faTitle: "پی آر پی پوست", enTitle: "PRP Skin", price: 3_400_000, displayOrder: 5, priceType: "fixed" },
          { slug: "meso-eyebrow", faTitle: "مizu ابرو", enTitle: "Meso Eyebrow", price: 1_990_000, displayOrder: 6, priceType: "fixed" },
          { slug: "meso-hair", faTitle: "مizu مو", enTitle: "Meso Hair", price: 1_990_000, displayOrder: 7, priceType: "fixed" },
          { slug: "meso-fatburn-neck", faTitle: "مizu چربی‌سوز غبغب", enTitle: "Meso Fatburn Neck", price: 1_690_000, displayOrder: 8, priceType: "fixed" },
          { slug: "meso-prp-hair", faTitle: "پی آر پی مو", enTitle: "PRP Hair", price: 3_300_000, displayOrder: 9, priceType: "fixed" },
          { slug: "meso-hair-filler", faTitle: "هیر فیلر", enTitle: "Hair Filler", price: 5_990_000, displayOrder: 10, priceType: "fixed" },
          { slug: "meso-needling", faTitle: "مزونیدلینگ", enTitle: "Meso Needling", price: 2_390_000, displayOrder: 11, priceType: "fixed" },
          { slug: "meso-sabcizhen", faTitle: "سابسیژن", enTitle: "Sabcizhen", price: 5_900_000, displayOrder: 12, priceType: "fixed" },
          { slug: "meso-jalbro-hmw", faTitle: "جالبرو HMW (جوانساز و آبرسان)", enTitle: "Jalbro HMW", price: 14_900_000, displayOrder: 13, priceType: "fixed" },
          { slug: "meso-jalbro-classic", faTitle: "جالبرو کلاسیک (بازسازی بافت‌های خشک و آسیب‌دیده پوست)", enTitle: "Jalbro Classic", price: 13_900_000, displayOrder: 14, priceType: "fixed" },
          { slug: "meso-super-hydro", faTitle: "جالبرو سوپر هیدرو (کلاژن‌ساز و جوانساز قوی)", enTitle: "Jalbro Super Hydro", price: 22_900_000, displayOrder: 15, priceType: "fixed" },
          { slug: "meso-proflo-astral", faTitle: "پروفایلو استراکچرا (لیفت و جوانسازی صورت)", enTitle: "Profhilo AstraFill", price: 23_900_000, displayOrder: 16, priceType: "fixed" },
          { slug: "meso-proflo-classic", faTitle: "پروفایلو کلاسیک (آبرسان و جوانساز قوی)", enTitle: "Proflo Classic", price: 19_900_000, displayOrder: 17, priceType: "fixed" },
          { slug: "meso-liquid-thread", faTitle: "نخ مایع (PLLA - کلاژن‌ساز تزریقی)", enTitle: "Liquid Thread PLLA", price: 23_900_000, displayOrder: 18, priceType: "fixed" },
          { slug: "meso-luxyva", faTitle: "لوکسیوا (بهبود بافت و کاهش خطوط ریز)", enTitle: "Luxyva", price: 5_900_000, displayOrder: 19, priceType: "fixed" },
          { slug: "meso-dymono", faTitle: "دیمونو (مizu 젤 با اثر شبیه بوتاکس)", enTitle: "Dymono", price: 18_900_000, displayOrder: 20, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "hair-strengthening",
    faName: "تقویت مو",
    enName: "Hair Strengthening",
    faDesc: "مizuتراپی و خدمات تخصصی برای تقویت ریشه، کاهش ریزش و بهبود کیفیت و تراکم مو؛ متناسب با نیاز و وضعیت موی شما.",
    enDesc: "Mesotherapy and specialized services for root strengthening, hair loss reduction, and improved hair quality and density; tailored to your hair's needs and condition.",
    displayOrder: 7,
    categories: [
      {
        slug: "hair-services",
        faName: "مizuتراپی و تقویت مو",
        enName: "Mesotherapy & Hair Strengthening",
        faDesc: "مizuتراپی و خدمات تقویتی مو برای کاهش ریزش، تقویت ریشه و بهبود کیفیت و تراکم مو؛ متناسب با وضعیت موی شما.",
        enDesc: "Mesotherapy and hair strengthening services for hair loss reduction, root strengthening, and improved hair quality and density; tailored to your hair condition.",
        displayOrder: 1,
        services: [
          { slug: "hair-meso-per-session", faTitle: "مizuتراپی مو (هر جلسه)", enTitle: "Hair Meso (per session)", price: 1_990_000, displayOrder: 1, priceType: "fixed" },
          { slug: "hair-meso-4-pack", faTitle: "پکیج ۴ جلسه مizuتراپی مو", enTitle: "Hair Meso 4-Session Pack", price: 5_490_000, displayOrder: 2, priceType: "fixed" },
          { slug: "hair-filler-per-session", faTitle: "هیر فیلر (هر جلسه)", enTitle: "Hair Filler (per session)", price: 5_990_000, displayOrder: 3, priceType: "fixed" },
          { slug: "hair-prp", faTitle: "پی آر پی مو", enTitle: "PRP Hair", price: 3_300_000, displayOrder: 4, priceType: "fixed" },
          { slug: "hair-booster", faTitle: "بوستر تقویت مو", enTitle: "Hair Booster", price: 2_890_000, displayOrder: 5, priceType: "fixed" },
          { slug: "hair-scalp-meso", faTitle: "مizuتراپی آبرسانی پوست سر", enTitle: "Scalp Meso", price: 1_690_000, displayOrder: 6, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "fat-dissolving",
    faName: "چربی‌سوزی و لاغری موضعی",
    enName: "Fat Dissolving & Local Slimming",
    faDesc: "مizuچربی‌سوز برای کاهش موضعی چربی و فرم‌دهی نواحی موردنظر؛ متناسب با ناحیه و نیاز شما.",
    enDesc: "Meso fat-dissolving for localized fat reduction and shaping of target areas; tailored to the area and your needs.",
    displayOrder: 8,
    categories: [
      {
        slug: "fat-dissolving-services",
        faName: "مizuچربی‌سوز",
        enName: "Meso Fat Dissolving",
        faDesc: "مizuچربی‌سوز برای کاهش موضعی چربی در نواحی مختلف بدن؛ متناسب با ناحیه و نیاز شما و با رویکردی تدریجی و ایمن.",
        enDesc: "Meso fat-dissolving for localized fat reduction in different body areas; tailored to the area and your needs with a gradual and safe approach.",
        displayOrder: 1,
        services: [
          { slug: "fat-dissolve-per-session", faTitle: "مizu چربی‌سوز (هر جلسه)", enTitle: "Meso Fat Dissolve (per session)", price: 1_890_000, displayOrder: 1, priceType: "fixed" },
          { slug: "fat-dissolve-4-pack", faTitle: "پکیج ۴ جلسه مizu چربی‌سوز", enTitle: "Meso Fat Dissolve 4-Session Pack", price: 6_900_000, displayOrder: 2, priceType: "fixed" },
          { slug: "fat-dissolve-abdomen", faTitle: "مizu چربی‌سوز شکم و پهلو", enTitle: "Meso Fat Dissolve Abdomen & Flanks", price: 2_290_000, displayOrder: 3, priceType: "fixed" },
          { slug: "fat-dissolve-arm", faTitle: "مizu چربی‌سوز بازو", enTitle: "Meso Fat Dissolve Arm", price: 1_990_000, displayOrder: 4, priceType: "fixed" },
          { slug: "fat-dissolve-thigh", faTitle: "مizu چربی‌سوز ران", enTitle: "Meso Fat Dissolve Thigh", price: 2_190_000, displayOrder: 5, priceType: "fixed" },
          { slug: "fat-dissolve-neck", faTitle: "مizu چربی‌سوز غبغب", enTitle: "Meso Fat Dissolve Neck", price: 1_690_000, displayOrder: 6, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "skin-treatments",
    faName: "درمان‌های پوستی",
    enName: "Skin Treatments",
    faDesc: "خدمات تخصصی درمان پوست برای بهبود بافت، لک، جوش و شادابی؛ متناسب با نوع پوست و نیاز شما.",
    enDesc: "Specialized skin treatment services for texture improvement, blemishes, acne, and radiance; tailored to your skin type and needs.",
    displayOrder: 9,
    categories: [
      {
        slug: "skin-services",
        faName: "درمان‌های پوستی",
        enName: "Skin Treatments",
        faDesc: "خدمات تخصصی درمان پوست برای بهبود بافت، لک، جوش و شادابی؛ متناسب با نوع پوست و نیاز شما.",
        enDesc: "Specialized skin treatment services for texture improvement, blemishes, acne, and radiance; tailored to your skin type and needs.",
        displayOrder: 1,
        services: [
          { slug: "skin-hifu-face", faTitle: "هایفوتراپی صورت", enTitle: "HIFU Face", price: 8_900_000, displayOrder: 1, priceType: "from" },
          { slug: "skin-microneedling", faTitle: "میکرونیدلینگ", enTitle: "Microneedling", price: 2_490_000, displayOrder: 2, priceType: "fixed" },
          { slug: "skin-hydrafacial", faTitle: "هیدرافیشیال", enTitle: "HydraFacial", price: 2_900_000, displayOrder: 3, priceType: "fixed" },
          { slug: "skin-peel", faTitle: "پیلینگ شیمیایی", enTitle: "Chemical Peel", price: 1_890_000, displayOrder: 4, priceType: "fixed" },
          { slug: "skin-fractional-laser", faTitle: "لیزر فراکشنال", enTitle: "Fractional Laser", price: 4_900_000, displayOrder: 5, priceType: "from" },
          { slug: "skin-brightening-meso", faTitle: "مizuتراپی شفاف‌سازی پوست", enTitle: "Skin Brightening Meso", price: 2_100_000, displayOrder: 6, priceType: "fixed" },
          { slug: "skin-acne", faTitle: "درمان آکنه و جوش", enTitle: "Acne Treatment", price: 2_490_000, displayOrder: 7, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "thread-lift",
    faName: "نخ لیفت صورت",
    enName: "Thread Lift Face",
    faDesc: "با نخ لیفت صورت، افتادگی خفیف پوست را بدون جراحی بهبود دهید و فرم و کانتور صورت را طبیعی‌تر و جوان‌تر کنید.",
    enDesc: "With facial thread lift, improve mild skin sagging without surgery and make facial form and contour more natural and youthful.",
    displayOrder: 10,
    categories: [
      {
        slug: "thread-lift-areas",
        faName: "نخ لیفت صورت",
        enName: "Thread Lift Areas",
        faDesc: "نخ لیفت برای بهبود افتادگی خفیف پوست و فرم‌دهی طبیعی چهره بدون جراحی؛ متناسب با ناحیه و نیاز شما.",
        enDesc: "Thread lift for improving mild skin sagging and natural facial shaping without surgery; tailored to the area and your needs.",
        displayOrder: 1,
        services: [
          { slug: "thread-face", faTitle: "نخ لیفت صورت", enTitle: "Thread Lift Face", price: 18_900_000, displayOrder: 1, priceType: "from" },
          { slug: "thread-jawline", faTitle: "نخ لیفت خط فک و غبغب", enTitle: "Thread Lift Jawline & Neck", price: 14_900_000, displayOrder: 2, priceType: "from" },
          { slug: "thread-neck", faTitle: "نخ لیفت گردن", enTitle: "Thread Lift Neck", price: 13_900_000, displayOrder: 3, priceType: "from" },
          { slug: "thread-brow", faTitle: "نخ لیفت پیشانی و ابرو", enTitle: "Thread Lift Forehead & Brow", price: 16_900_000, displayOrder: 4, priceType: "from" },
          { slug: "thread-cheek", faTitle: "نخ لیفت گونه", enTitle: "Thread Lift Cheek", price: 15_900_000, displayOrder: 5, priceType: "from" },
          { slug: "thread-full-face", faTitle: "نخ لیفت کامل صورت", enTitle: "Thread Lift Full Face", price: 29_900_000, displayOrder: 6, priceType: "from" },
        ],
      },
    ],
  },
];

async function upsertGroup(g: PriceGroup) {
  const [row] = await db
    .insert(serviceGroups)
    .values({
      slug: g.slug,
      icon: null,
      image: null,
      displayOrder: g.displayOrder,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: serviceGroups.slug,
      set: { icon: null, image: null, displayOrder: g.displayOrder, isActive: true },
    })
    .returning({ id: serviceGroups.id });

  for (const locale of ["fa", "en"] as const) {
    const name = locale === "fa" ? g.faName : g.enName;
    const desc = locale === "fa" ? g.faDesc : g.enDesc;
    await db
      .insert(serviceGroupsI18n)
      .values({
        groupId: row.id,
        locale,
        name,
        description: desc,
        seoTitle: `${name} | قیمت`,
        seoDescription: desc,
      })
      .onConflictDoUpdate({
        target: [serviceGroupsI18n.groupId, serviceGroupsI18n.locale],
        set: { name, description: desc, seoTitle: `${name} | قیمت`, seoDescription: desc },
      });
  }

  for (const category of g.categories) {
    await upsertCategory(row.id, category);
  }
}

async function upsertCategory(groupId: string, c: PriceCategory) {
  const [row] = await db
    .insert(serviceCategories)
    .values({
      groupId,
      slug: c.slug,
      icon: null,
      image: null,
      displayOrder: c.displayOrder,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: serviceCategories.slug,
      set: { groupId, icon: null, image: null, displayOrder: c.displayOrder, isActive: true },
    })
    .returning({ id: serviceCategories.id });

  for (const locale of ["fa", "en"] as const) {
    const name = locale === "fa" ? c.faName : c.enName;
    const desc = locale === "fa" ? c.faDesc : c.enDesc;
    await db
      .insert(serviceCategoriesI18n)
      .values({
        categoryId: row.id,
        locale,
        name,
        description: desc,
        seoTitle: `${name} | قیمت`,
        seoDescription: desc,
      })
      .onConflictDoUpdate({
        target: [serviceCategoriesI18n.categoryId, serviceCategoriesI18n.locale],
        set: { name, description: desc, seoTitle: `${name} | قیمت`, seoDescription: desc },
      });
  }

  for (const service of c.services) {
    await upsertService(row.id, service);
  }
}

async function upsertService(categoryId: string, s: PriceService) {
  const [row] = await db
    .insert(services)
    .values({
      categoryId,
      slug: s.slug,
      price: s.price === null ? null : String(s.price),
      priceType: s.priceType,
      durationMin: null,
      sessionsCount: 1,
      displayOrder: s.displayOrder,
      isActive: true,
      isFeatured: false,
    })
    .onConflictDoUpdate({
      target: services.slug,
      set: {
        categoryId,
        price: s.price === null ? null : String(s.price),
        priceType: s.priceType,
        displayOrder: s.displayOrder,
        isActive: true,
        isFeatured: false,
      },
    })
    .returning({ id: services.id });

  for (const locale of ["fa", "en"] as const) {
    const title = locale === "fa" ? s.faTitle : s.enTitle;
    await db
      .insert(servicesI18n)
      .values({
        serviceId: row.id,
        locale,
        title,
        shortDesc: title,
        seoTitle: `${title} | قیمت`,
        seoDescription: title,
      })
      .onConflictDoUpdate({
        target: [servicesI18n.serviceId, servicesI18n.locale],
        set: { title, shortDesc: title, seoTitle: `${title} | قیمت`, seoDescription: title },
      });
  }
}

async function main() {
  const keepGroupSlugs = new Set(GROUPS.map((g) => g.slug));
  const keepCategorySlugs = new Set<string>();
  const keepServiceSlugs = new Set<string>();
  for (const g of GROUPS) {
    for (const c of g.categories) {
      keepCategorySlugs.add(c.slug);
      for (const s of c.services) keepServiceSlugs.add(s.slug);
    }
  }

  for (const g of GROUPS) await upsertGroup(g);

  const allGroups = await db.select({ id: serviceGroups.id, slug: serviceGroups.slug, isActive: serviceGroups.isActive }).from(serviceGroups);
  const toDeactivateGroups = allGroups.filter((r) => !keepGroupSlugs.has(r.slug) && r.isActive).map((r) => r.id);
  if (toDeactivateGroups.length) {
    await db.update(serviceGroups).set({ isActive: false }).where(inArray(serviceGroups.id, toDeactivateGroups));
  }

  const allCategories = await db.select({ id: serviceCategories.id, slug: serviceCategories.slug, isActive: serviceCategories.isActive }).from(serviceCategories);
  const toDeactivateCategories = allCategories.filter((r) => !keepCategorySlugs.has(r.slug) && r.isActive).map((r) => r.id);
  if (toDeactivateCategories.length) {
    await db.update(serviceCategories).set({ isActive: false }).where(inArray(serviceCategories.id, toDeactivateCategories));
  }

  const allServices = await db.select({ id: services.id, slug: services.slug, isActive: services.isActive }).from(services);
  const toDeactivateServices = allServices.filter((r) => !keepServiceSlugs.has(r.slug) && r.isActive).map((r) => r.id);
  if (toDeactivateServices.length) {
    await db.update(services).set({ isActive: false }).where(inArray(services.id, toDeactivateServices));
  }

  const totalServices = GROUPS.reduce((a, g) => a + g.categories.reduce((b, c) => b + c.services.length, 0), 0);
  console.log(`✅ Seeded ${GROUPS.length} groups, ${GROUPS.reduce((a, g) => a + g.categories.length, 0)} categories, ${totalServices} services.`);
}

main().catch((err) => {
  console.error("SEED ERROR:", (err as Error).message);
  process.exit(1);
});
