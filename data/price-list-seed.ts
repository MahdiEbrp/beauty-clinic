export type PriceService = {
  slug: string;
  faTitle: string;
  enTitle: string;
  price: number | null;
  displayOrder: number;
  priceType: "fixed" | "from" | "on_request";
};

export type PriceCategory = {
  slug: string;
  faName: string;
  enName: string;
  displayOrder: number;
  services: PriceService[];
};

export type PriceGroup = {
  slug: string;
  faName: string;
  enName: string;
  displayOrder: number;
  categories: PriceCategory[];
};

/**
 * Section order (matching the reference pricing page):
 *
 * Right column (top to bottom):
 *   1. face-filler        -> فیلر صورت (incl. فیلر نقاط حساس as category)
 *   2. pack-10cc          -> پک ۱۰ سیسی کانتورینگ
 *   3. enzyme             -> آنزیم از بین برنده فیلر
 *   4. body-filler        -> فیلر بدن
 *
 * Left column (top to bottom):
 *   5. meso-rejuvenation  -> مizu ژل - مizu مو - جوانساز - درمان پوستی
 *   6. botox              -> بوتاکس
 *   7. laser-hair-removal -> لیزر
 *   8. hifu               -> HIFU
 *
 * Removed per user feedback: پک‌های فول فیس, تقویت مو, چربی‌سوزی,
 * درمان‌های پوستی, نخ لیفت (not in Excel nor poster).
 * filler-sensitive-areas is now a category under face-filler (not separate group).
 */
export const GROUPS: PriceGroup[] = [
  // ===== RIGHT COLUMN =====
  {
    slug: "face-filler",
    faName: "فیلر صورت",
    enName: "Face Filler",
    displayOrder: 1,
    categories: [
      {
        slug: "face-filler-brands",
        faName: "برندهای فیلر لب و صورت",
        enName: "Face Filler Brands",
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
        displayOrder: 2,
        services: [
          // Names WITHOUT "(فیلر نقاط حساس)" suffix
          { slug: "sensitive-innosense", faTitle: "اینووسنس", enTitle: "Innosense (Sensitive)", price: 6_790_000, displayOrder: 1, priceType: "fixed" },
          { slug: "sensitive-fillorga", faTitle: "فیورج", enTitle: "Fillorga (Sensitive)", price: 6_390_000, displayOrder: 2, priceType: "fixed" },
          { slug: "sensitive-de-moi", faTitle: "دی می", enTitle: "De Moi (Sensitive)", price: 6_190_000, displayOrder: 3, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "pack-10cc",
    faName: "پک ۱۰ سیسی کانتورینگ",
    enName: "Pack 10cc Contouring",
    displayOrder: 2,
    categories: [
      {
        slug: "pack-10cc-brands",
        faName: "برندهای پک ۱۰ سیسی",
        enName: "Pack 10cc Brands",
        displayOrder: 1,
        services: [
          { slug: "pack-10cc-eptq", faTitle: "اپی تی کیو", enTitle: "Pack eptq", price: 24_900_000, displayOrder: 1, priceType: "fixed" },
          { slug: "pack-10cc-zishal", faTitle: "زیشال", enTitle: "Pack Zishal", price: 20_900_000, displayOrder: 2, priceType: "fixed" },
          { slug: "pack-10cc-deneb", faTitle: "دنبی", enTitle: "Pack Deneb", price: 18_900_000, displayOrder: 3, priceType: "fixed" },
          { slug: "pack-10cc-restylane", faTitle: "رووفیل", enTitle: "Pack Restylane", price: 15_900_000, displayOrder: 4, priceType: "fixed" },
          { slug: "pack-10cc-audry", faTitle: "اودری", enTitle: "Pack Audry", price: 13_900_000, displayOrder: 5, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "enzyme",
    faName: "آنزیم از بین برنده فیلر",
    enName: "Enzyme - Filler Dissolver",
    displayOrder: 3,
    categories: [
      {
        slug: "enzyme-services",
        faName: "خدمات انزیم",
        enName: "Enzyme Services",
        displayOrder: 1,
        services: [
          { slug: "enzyme-anzyne", faTitle: "آنزیم هیالورونیداز (انگلیسی)", enTitle: "Hyaluronidase (English)", price: 2_190_000, displayOrder: 1, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "body-filler",
    faName: "فیلر بدن",
    enName: "Body Filler",
    displayOrder: 4,
    categories: [
      {
        slug: "body-filler-volumes",
        faName: "حجم‌های فیلر بدن",
        enName: "Body Filler Volumes",
        displayOrder: 1,
        services: [
          // NOT split into باسن/بیکینی — exactly 3 rows
          { slug: "body-filler-per-cc", faTitle: "فیلر بدن هر سی‌سی", enTitle: "Body Filler per cc", price: 390_000, displayOrder: 1, priceType: "from" },
          { slug: "body-filler-50cc", faTitle: "فیلر بدن ۵۰ سی‌سی", enTitle: "Body Filler 50cc", price: 18_500_000, displayOrder: 2, priceType: "fixed" },
          { slug: "body-filler-100cc", faTitle: "فیلر بدن ۱۰۰ سی‌سی", enTitle: "Body Filler 100cc", price: 34_900_000, displayOrder: 3, priceType: "fixed" },
        ],
      },
    ],
  },
  // ===== LEFT COLUMN =====
  {
    slug: "meso-rejuvenation",
    faName: "مizu ژل - مizu مو - جوانساز - درمان پوستی",
    enName: "Meso Gel - Meso Hair - Rejuvenation - Skin Treatment",
    displayOrder: 5,
    categories: [
      {
        slug: "meso-services",
        faName: "خدمات مizuتراپی",
        enName: "Mesotherapy Services",
        displayOrder: 1,
        services: [
          // Fixed pricing; مizu چربی‌سوز غبgebung = 1,990,000 (consistent)
          // مizu مو, هیر فیلر, پی‌آرپی مو appear ONLY here (no duplicates)
          { slug: "meso-keyara-gel", faTitle: "مizuژل کیارا", enTitle: "Meso Gel Keyara", price: 3_900_000, displayOrder: 1, priceType: "fixed" },
          { slug: "meso-provoyaj", faTitle: "مizuژل پروایج", enTitle: "Meso Gel Provoyaj", price: 5_790_000, displayOrder: 2, priceType: "fixed" },
          { slug: "meso-face", faTitle: "مizuتراپی صورت", enTitle: "Meso Face", price: 1_990_000, displayOrder: 3, priceType: "fixed" },
          { slug: "meso-undereye", faTitle: "مizuتراپی زیر چشم", enTitle: "Meso Undereye", price: 1_990_000, displayOrder: 4, priceType: "fixed" },
          { slug: "meso-prp-skin", faTitle: "پی آر پی پوست", enTitle: "PRP Skin", price: 3_400_000, displayOrder: 5, priceType: "fixed" },
          { slug: "meso-eyebrow", faTitle: "مizu ابرو", enTitle: "Meso Eyebrow", price: 1_990_000, displayOrder: 6, priceType: "fixed" },
          { slug: "meso-hair", faTitle: "مizu مو", enTitle: "Meso Hair", price: 1_990_000, displayOrder: 7, priceType: "fixed" },
          { slug: "meso-fatburn-neck", faTitle: "مizu چربی‌سوز غبغب", enTitle: "Meso Fatburn Neck", price: 1_990_000, displayOrder: 8, priceType: "fixed" },
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
          { slug: "meso-dymono", faTitle: "دیمونو (مizu ژل با اثر شبیه بوتاکس)", enTitle: "Dymono", price: 18_900_000, displayOrder: 20, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "botox",
    faName: "بوتاکس",
    enName: "Botox",
    displayOrder: 6,
    categories: [
      {
        slug: "botox-areas",
        faName: "نواحی بوتاکس",
        enName: "Botox Areas",
        displayOrder: 1,
        services: [
          // Service titles do NOT repeat category name
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
    slug: "laser-hair-removal",
    faName: "لیزر",
    enName: "Laser",
    displayOrder: 7,
    categories: [
      {
        slug: "laser-packages",
        faName: "پکیج‌های لیزر",
        enName: "Laser Packages",
        displayOrder: 1,
        services: [
          // No "پک شخصی" (not in Excel)
          { slug: "laser-full-body-pack", faTitle: "پکیج فول بادی", enTitle: "Full Body Pack", price: 990_000, displayOrder: 1, priceType: "fixed" },
          { slug: "laser-full-practical-pack", faTitle: "پکیج فول کاربردی", enTitle: "Full Practical Pack", price: 880_000, displayOrder: 2, priceType: "fixed" },
          { slug: "laser-practical-pack", faTitle: "پکیج کاربردی", enTitle: "Practical Pack", price: 790_000, displayOrder: 3, priceType: "fixed" },
          { slug: "laser-face", faTitle: "صورت", enTitle: "Face", price: 150_000, displayOrder: 4, priceType: "fixed" },
          { slug: "laser-upper-lip", faTitle: "پشت لب", enTitle: "Upper Lip", price: 90_000, displayOrder: 5, priceType: "fixed" },
          { slug: "laser-chin", faTitle: "چانه", enTitle: "Chin", price: 90_000, displayOrder: 6, priceType: "fixed" },
          { slug: "laser-neck", faTitle: "غبغب", enTitle: "Neck", price: 90_000, displayOrder: 7, priceType: "fixed" },
          { slug: "laser-underarm", faTitle: "زیر بغل", enTitle: "Underarm", price: 200_000, displayOrder: 8, priceType: "fixed" },
          { slug: "laser-forearm", faTitle: "ساق دست", enTitle: "Forearm", price: 200_000, displayOrder: 9, priceType: "fixed" },
          { slug: "laser-full-arm", faTitle: "دست کامل", enTitle: "Full Arm", price: 250_000, displayOrder: 10, priceType: "fixed" },
          { slug: "laser-abdomen", faTitle: "شکم", enTitle: "Abdomen", price: 155_000, displayOrder: 11, priceType: "fixed" },
          { slug: "laser-back", faTitle: "کمر", enTitle: "Back", price: 150_000, displayOrder: 12, priceType: "fixed" },
          { slug: "laser-bikini", faTitle: "بیکینی", enTitle: "Bikini", price: 190_000, displayOrder: 13, priceType: "fixed" },
          { slug: "laser-calf", faTitle: "ساق پا", enTitle: "Calf", price: 180_000, displayOrder: 14, priceType: "fixed" },
          { slug: "laser-full-leg", faTitle: "پا کامل", enTitle: "Full Leg", price: 300_000, displayOrder: 15, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "hifu",
    faName: "HIFU",
    enName: "HIFU",
    displayOrder: 8,
    categories: [
      {
        slug: "hifu-areas",
        faName: "نواحی HIFU",
        enName: "HIFU Areas",
        displayOrder: 1,
        services: [
          // 3 rows from Excel: 2,990,000 / 3,390,000 / 3,990,000
          { slug: "hifu-face", faTitle: "صورت", enTitle: "Face", price: 2_990_000, displayOrder: 1, priceType: "fixed" },
          { slug: "hifu-neck", faTitle: "غبغب", enTitle: "Neck", price: 3_390_000, displayOrder: 2, priceType: "fixed" },
          { slug: "hifu-face-neck", faTitle: "صورت و غبغب", enTitle: "Face & Neck", price: 3_990_000, displayOrder: 3, priceType: "fixed" },
        ],
      },
    ],
  },
];

