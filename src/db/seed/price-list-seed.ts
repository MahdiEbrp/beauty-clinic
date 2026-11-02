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
 * Section order (matching the reference pricing page):
 *
 * Right column (top to bottom):
 *   1. face-filler       -> فیلر لب و صورت
 *   2. pack-10cc         -> پک ۱۰ سی سی کانتورینگ
 *   3. enzyme            -> آنزیم از بین برنده فیلر
 *   4. body-filler       -> فیلر بدن (باسن و بیکینی)
 *
 * Left column (top to bottom):
 *   5. meso-rejuvenation -> مizu 젤 - مizu مو - جوانساز - درمان پوستی
 *   6. botox             -> بوتاکس
 *   7. filler-sensitive-areas -> فیلر زیرچشم - شقیقه - بینی - پیشانی
 *   8. laser-hair-removal -> لیزر
 *   9. hifu              -> هifu
 */
const GROUPS: PriceGroup[] = [
  // ===== RIGHT COLUMN =====
  {
    slug: "face-filler",
    faName: "فیلر لب و صورت",
    enName: "Face Filler - Lip & Face",
    faDesc: "زیبایی طبیعی خود را با فیلرهای ظریف و حرفه‌ای برجسته‌تر کنید. با بازگرداندن حجم از دست‌رفته، کاهش خطوط ظریف و فرم‌دهی لب، گونه یا چانه، چهره‌ای شاداب‌تر و متعادل‌تر داشته باشید.",
    enDesc: "Enhance your natural beauty with subtle, elegant facial fillers. Restore lost volume, soften fine lines, and beautifully define your lips, cheeks, or chin.",
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
          // Order: highest price first (per user's list)
          { slug: "face-filler-juvederm", faTitle: "ژوویدرم", enTitle: "Juvederm", price: 26_490_000, displayOrder: 1, priceType: "fixed" },
          { slug: "face-filler-illunse", faTitle: "الانسه", enTitle: "Illunse", price: 24_900_000, displayOrder: 2, priceType: "fixed" },
          { slug: "face-filler-stylage", faTitle: "استایلج", enTitle: "Stylage", price: 23_900_000, displayOrder: 3, priceType: "fixed" },
          { slug: "face-filler-revolax", faTitle: "رپلنژل", enTitle: "Revolax", price: 15_900_000, displayOrder: 4, priceType: "fixed" },
          { slug: "face-filler-perfecta", faTitle: "پرفکتا", enTitle: "Perfecta", price: 10_900_000, displayOrder: 5, priceType: "fixed" },
          { slug: "face-filler-restylane-plus", faTitle: "رووفیل پلاس", enTitle: "Restylane Plus", price: 9_900_000, displayOrder: 6, priceType: "fixed" },
          { slug: "face-filler-innosense", faTitle: "اینووسنس", enTitle: "Innosense", price: 6_590_000, displayOrder: 7, priceType: "fixed" },
          { slug: "face-filler-fillorga", faTitle: "فیورج", enTitle: "Fillorga", price: 6_290_000, displayOrder: 8, priceType: "fixed" },
          { slug: "face-filler-de-moi", faTitle: "دی می", enTitle: "De Moi", price: 5_990_000, displayOrder: 9, priceType: "fixed" },
          { slug: "face-filler-derm-arcane", faTitle: "درم آرکاین", enTitle: "Derm Arcane", price: 5_390_000, displayOrder: 10, priceType: "fixed" },
          { slug: "face-filler-eptq", faTitle: "اپی تی کیو", enTitle: "eptq", price: 2_990_000, displayOrder: 11, priceType: "fixed" },
          { slug: "face-filler-zishal", faTitle: "زیشل", enTitle: "Zishal", price: 2_690_000, displayOrder: 12, priceType: "fixed" },
          { slug: "face-filler-deneb", faTitle: "دنبی", enTitle: "Deneb", price: 2_490_000, displayOrder: 13, priceType: "fixed" },
          { slug: "face-filler-restylane", faTitle: "رووفیل", enTitle: "Restylane", price: 2_190_000, displayOrder: 14, priceType: "fixed" },
          { slug: "face-filler-audry", faTitle: "اودری", enTitle: "Audry", price: 1_890_000, displayOrder: 15, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "pack-10cc",
    faName: "پک ۱۰ سی سی کانتورینگ",
    enName: "Pack 10cc Contouring",
    faDesc: "پک‌های ۱۰ سی‌سی فیلر صورت با برندهای مختلف.",
    enDesc: "10cc face filler packs with different brands.",
    displayOrder: 2,
    categories: [
      {
        slug: "pack-10cc-brands",
        faName: "برندهای پک ۱۰ سی سی",
        enName: "Pack 10cc Brands",
        faDesc: "پک ۱۰ سیسی با برندهای مختلف.",
        enDesc: "Pack 10cc with different brands.",
        displayOrder: 1,
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
    slug: "enzyme",
    faName: "آنزیم از بین برنده فیلر",
    enName: "Enzyme - Filler Dissolver",
    faDesc: "خدمات انزیم برای حذف مواد تزریقی.",
    enDesc: "Enzyme for dissolving injected materials.",
    displayOrder: 3,
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
    faDesc: "فرم طبیعی بدن خود را با روشی ظریف و متناسب با ویژگی‌های شما زیباتر کنید.",
    enDesc: "Enhance your body's natural contours with a refined, personalized approach.",
    displayOrder: 4,
    categories: [
      {
        slug: "body-filler-volumes",
        faName: "حجم‌های فیلر بدن",
        enName: "Body Filler Volumes",
        faDesc: "فیلر بدن به ازای هر سی‌سی و پک‌های ۵۰ و ۱۰۰ سی‌سی.",
        enDesc: "Body filler per cc and 50cc/100cc packs.",
        displayOrder: 1,
        services: [
          { slug: "body-filler-per-cc", faTitle: "فیلر بادی هر سیسی", enTitle: "Body Filler per cc", price: 390_000, displayOrder: 1, priceType: "from" },
          { slug: "body-filler-100cc", faTitle: "فیلر بادی ۱۰۰ سیسی", enTitle: "Body Filler 100cc", price: 34_900_000, displayOrder: 2, priceType: "fixed" },
          { slug: "body-filler-50cc", faTitle: "فیلر بادی ۵۰ سیسی", enTitle: "Body Filler 50cc", price: 18_500_000, displayOrder: 3, priceType: "fixed" },
        ],
      },
    ],
  },
  // ===== LEFT COLUMN =====
  {
    slug: "meso-rejuvenation",
    faName: "مizu 젤 - مizu مو - جوانساز - درمان پوستی",
    enName: "Meso Gel - Meso Hair - Rejuvenation - Skin Treatment",
    faDesc: "سرویس‌های مزوتراپی و جوانساز پوستی با برندهای معتبر.",
    enDesc: "Mesotherapy and skin rejuvenation services with reputable brands.",
    displayOrder: 5,
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
          { slug: "meso-face-undereye", faTitle: "مizuتراپی صورت", enTitle: "Meso Face", price: 1_990_000, displayOrder: 3, priceType: "fixed" },
          { slug: "meso-undereye", faTitle: "مizuتراپی زیر چشم", enTitle: "Meso Undereye", price: 1_990_000, displayOrder: 4, priceType: "fixed" },
          { slug: "meso-prp", faTitle: "پی آر پی پوست", enTitle: "PRP Skin", price: 3_400_000, displayOrder: 5, priceType: "fixed" },
          { slug: "meso-hair-eyebrow", faTitle: "مizu ابرو", enTitle: "Meso Eyebrow", price: 1_990_000, displayOrder: 6, priceType: "fixed" },
          { slug: "meso-hair", faTitle: "مizu مو", enTitle: "Meso Hair", price: 1_990_000, displayOrder: 7, priceType: "fixed" },
          { slug: "meso-fatburn-neck", faTitle: "مizu چربی سوز غبغب", enTitle: "Meso Fatburn Neck", price: 1_990_000, displayOrder: 8, priceType: "fixed" },
          { slug: "meso-prp-hair", faTitle: "پی آر پی مو", enTitle: "PRP Hair", price: 3_300_000, displayOrder: 9, priceType: "fixed" },
          { slug: "meso-hair-filler", faTitle: "هیر فیلر", enTitle: "Hair Filler", price: 5_990_000, displayOrder: 10, priceType: "fixed" },
          { slug: "meso-needling", faTitle: "مizu نیدلینگ", enTitle: "Meso Needling", price: 2_390_000, displayOrder: 11, priceType: "fixed" },
          { slug: "meso-sabcizhen", faTitle: "سابسیژن", enTitle: "Sabcizhen", price: 5_900_000, displayOrder: 12, priceType: "fixed" },
          { slug: "meso-jalbro-hmw", faTitle: "جالبرو HMW (جوانساز و آبرسان)", enTitle: "Jalbro HMW", price: 14_900_000, displayOrder: 13, priceType: "fixed" },
          { slug: "meso-jalbro-classic", faTitle: "جالبرو کلاسیک (بازسازی بافت‌های خشک و آسیب‌دیده پوست)", enTitle: "Jalbro Classic", price: 13_900_000, displayOrder: 14, priceType: "fixed" },
          { slug: "meso-super-hydro", faTitle: "جالبرو سوپر هیدرو (کلاژن‌ساز و جوانساز قوی)", enTitle: "Jalbro Super Hydro", price: 22_900_000, displayOrder: 15, priceType: "fixed" },
          { slug: "meso-aestrafill", faTitle: "پروفایلو استراکچرا (لیفت و جوانسازی صورت)", enTitle: "Profhilo AstraFill", price: 23_900_000, displayOrder: 16, priceType: "fixed" },
          { slug: "meso-proflo-classic", faTitle: "پروفایلو کلاسیک (آبرسان و جوانساز قوی)", enTitle: "Proflo Classic", price: 19_900_000, displayOrder: 17, priceType: "fixed" },
          { slug: "meso-liquid-thread", faTitle: "نخ مایع (PLLA - کلاژن‌ساز تزریقی)", enTitle: "Liquid Thread PLLA", price: 23_900_000, displayOrder: 18, priceType: "fixed" },
          { slug: "meso-luxyva", faTitle: "لوکسیوا (بهبود بافت و کاهش خطوط ریز)", enTitle: "Luxyva", price: 5_900_000, displayOrder: 19, priceType: "fixed" },
          { slug: "meso-dymono", faTitle: "دیمونو (مizu 젤 با اثر شبیه بوتاکس)", enTitle: "Dymono", price: 18_900_000, displayOrder: 20, priceType: "fixed" },
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
    displayOrder: 6,
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
    slug: "filler-sensitive-areas",
    faName: "فیلر زیرچشم - شقیقه - بینی - پیشانی",
    enName: "Sensitive Areas Filler",
    faDesc: "فیلر برای نقاط حساس چهره با برندهای معتبر.",
    enDesc: "Filler for sensitive facial areas with reputable brands.",
    displayOrder: 7,
    categories: [
      {
        slug: "sensitive-filler-brands",
        faName: "برندهای فیلر نواحی حساس",
        enName: "Sensitive Areas Filler Brands",
        faDesc: "فیلر زیرچشم، شقیقه، بینی و پیشانی با برندهای معتبر.",
        enDesc: "Sensitive area face filler with reputable brands.",
        displayOrder: 1,
        services: [
          { slug: "sensitive-innosense", faTitle: "اینووسنس", enTitle: "Innosense", price: 6_790_000, displayOrder: 1, priceType: "fixed" },
          { slug: "sensitive-fillorga", faTitle: "فیورج", enTitle: "Fillorga", price: 6_390_000, displayOrder: 2, priceType: "fixed" },
          { slug: "sensitive-de-moi", faTitle: "دی می", enTitle: "De Moi", price: 6_190_000, displayOrder: 3, priceType: "fixed" },
        ],
      },
    ],
  },
  {
    slug: "laser-hair-removal",
    faName: "لیزر",
    enName: "Laser",
    faDesc: "سرویس‌های لیزر حذف مو و پکیج‌های کاربردی.",
    enDesc: "Laser hair removal and practical packages.",
    displayOrder: 8,
    categories: [
      {
        slug: "laser-packages",
        faName: "پکیج‌های لیزر",
        enName: "Laser Packages",
        faDesc: "پکیج‌های لیزر برای صورت و بدن.",
        enDesc: "Laser packages for face and body.",
        displayOrder: 1,
        services: [
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
    faName: "هifu",
    enName: "HIFU",
    faDesc: "سرویس‌های هifu برای emprison و تناسب چهره و غبغب.",
    enDesc: "HIFU services for face and neck lifting and contouring.",
    displayOrder: 9,
    categories: [
      {
        slug: "hifu-areas",
        faName: "نواحی هifu",
        enName: "HIFU Areas",
        faDesc: "هifu برای صورت، غبغب و صورت و غبغب.",
        enDesc: "HIFU for face, neck, and face & neck.",
        displayOrder: 1,
        services: [
          { slug: "hifu-face", faTitle: "صورت", enTitle: "Face", price: 2_990_000, displayOrder: 1, priceType: "fixed" },
          { slug: "hifu-neck", faTitle: "غبغب", enTitle: "Neck", price: 3_390_000, displayOrder: 2, priceType: "fixed" },
          { slug: "hifu-face-neck", faTitle: "صورت و غبغب", enTitle: "Face & Neck", price: 3_990_000, displayOrder: 3, priceType: "fixed" },
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
