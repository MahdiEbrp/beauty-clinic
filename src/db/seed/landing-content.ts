import type { Locale } from "@/lib/services/types";

export type Localized<T> = Record<Locale, T>;

export type SeedServiceCard = {
  slug: string;
  icon: string | null;
  image: string | null;
  i18n: Localized<{ title: string; description: string | null; ctaLabel: string | null }>;
};

export type SeedMarqueeItem = { icon: string; i18n: Localized<{ text: string }> };

export type SeedStat = {
  value: number;
  compact: boolean;
  plus: boolean;
  i18n: Localized<{ label: string }>;
};

export type SeedGalleryItem = {
  imageUrl: string;
  i18n: Localized<{ caption: string | null; alt: string }>;
};

export type SeedSection = {
  key: string;
  i18n: Localized<{ heading: string; description: string | null }>;
  services?: SeedServiceCard[];
  stats?: SeedStat[];
  galleryItems?: SeedGalleryItem[];
};

export const LANDING_PAGE_I18N: Localized<{ seoTitle: string; seoDescription: string }> = {
  en: {
    seoTitle: "Nafas Beauty Clinic | Art of Beauty",
    seoDescription:
      "Specialized skin and beauty services tailored to your unique features. Experience the art of transformation in a calm, luxurious environment.",
  },
  fa: {
    seoTitle: "کلینیک زیبایی نفس | هنر زیبایی",
    seoDescription:
      "خدمات تخصصی پوست و زیبایی، متناسب با چهره منحصربه‌فرد شما. هنر تحول را در فضایی آرام و لوکس تجربه کنید.",
  },
};

export const LANDING_HERO_I18N: {
  image: string | null;
  taglineIcon: string;
  i18n: Localized<{
    title: string;
    tagline: string;
    description: string;
    ctaLabel1: string;
    ctaLabel2: string;
  }>;
} = {
  image: null,
  taglineIcon: "Sparkles",
  i18n: {
    en: {
      title: "Natural Beauty\nFind in your breath",
      tagline: "Nafas Aesthetic Clinic",
      description:
        "Specialized skin and beauty services tailored to your unique features. Experience the art of transformation in a calm, luxurious environment.",
      ctaLabel1: "Book Now",
      ctaLabel2: "View Services",
    },
    fa: {
      title: "زیبایی طبیعی\nدر نفس خود بجویید",
      tagline: "کلینیک تخصصی زیبایی نفس",
      description:
        "خدمات تخصصی پوست و زیبایی، متناسب با چهره منحصربه‌فرد شما. هنر تحول را در فضایی آرام و لوکس تجربه کنید.",
      ctaLabel1: "رزرو نوبت",
      ctaLabel2: "مشاهده خدمات",
    },
  },
};

export const LANDING_MARQUEE: SeedMarqueeItem[] = [
  { icon: "Sparkles", i18n: { en: { text: "Clear Skin" }, fa: { text: "پوست شفاف" } } },
  { icon: "Heart", i18n: { en: { text: "Lasting Youth" }, fa: { text: "جوانی ماندگار" } } },
  { icon: "Shield", i18n: { en: { text: "Medical Expertise" }, fa: { text: "تخصص پزشکی" } } },
  { icon: "Zap", i18n: { en: { text: "Advanced Technology" }, fa: { text: "تکنولوژی پیشرفته" } } },
];

const svc = (
  slug: string,
  icon: string | null,
  image: string | null,
  enTitle: string,
  enDescription: string,
  faTitle: string,
  faDescription: string,
): SeedServiceCard => ({
  slug,
  icon,
  image,
  i18n: {
    en: { title: enTitle, description: enDescription, ctaLabel: null },
    fa: { title: faTitle, description: faDescription, ctaLabel: null },
  },
});

export const LANDING_SERVICE_CARDS: SeedServiceCard[] = [
  svc(
    "face-filler",
    "facial",
    "/images/gallery/hydrafacial.webp",
    "Face Filler",
    "Enhance your natural beauty with subtle, elegant facial fillers. Restore lost volume, soften fine lines, and beautifully define your lips, cheeks, or chin — for a refreshed look that still feels like you.",
    "فیلر صورت",
    "زیبایی طبیعی خود را با فیلرهای ظریف و شیک صورت تقویت کنید. حجم ازدست‌رفته را بازگردانده، خطوط ریز را نرم کرده و لب‌ها، گونه‌ها یا چانه را به‌شکلی زیبا فرم دهید — برای ظاهری شاداب که همچنان شبیه خودتان است.",
  ),
  svc(
    "body-filler",
    "body",
    null,
    "Body Filler",
    "Enhance your body's natural contours with a refined, personalized approach. Designed to improve volume, balance and definition in selected areas for a more harmonious and confident silhouette.",
    "فیلر بادی",
    "فرم طبیعی بدن خود را با روشی ظریف و متناسب با ویژگی‌های شما زیباتر کنید. با هدف بهبود حجم، تناسب و فرم در نواحی منتخب، برای ایجاد ظاهری متعادل‌تر، هماهنگ‌تر و جذاب‌تر.",
  ),
  svc(
    "botox-enzyme-treatments",
    "gelBotox",
    null,
    "Botox & Enzyme Treatments",
    "Refine your features, soften expression lines, and restore facial balance with personalized Botox and filler-correction treatments tailored to your aesthetic goals.",
    "بوتاکس و آنزیم درمانی",
    "ویژگی‌های چهره را ظریف‌تر کنید، خطوط بیان را نرم کرده و با بوتاکس و درمان‌های اصلاح فیلر شخصی‌سازی‌شده متناسب با اهداف زیبایی شما، تعادل صورت را بازگردانید.",
  ),
  svc(
    "full-face-filler",
    "facial",
    null,
    "Full Face Filler",
    "Restore balance, refine your features, and enhance your natural beauty. Full Face Filler combines precise facial contouring and volume enhancement to create a more harmonious, refreshed, and naturally balanced appearance.",
    "فیلر تمام صورت",
    "تعادل را بازگردانده، ویژگی‌های چهره را ظریف کرده و زیبایی طبیعی خود را ارتقا دهید. فیلر تمام صورت، کانتورینگ دقیق و افزایش حجم را تلفیق می‌کند تا ظاهری هماهنگ‌تر، شاداب‌تر و متعادل‌تر خلق کند.",
  ),
  svc(
    "mesotherapy-skin-rejuvenation",
    "rejuvenation",
    "/images/gallery/microneedling.webp",
    "Mesotherapy & Skin Rejuvenation",
    "Refresh, hydrate, and revitalize your skin with personalized rejuvenation treatments designed to improve skin quality, elasticity, radiance, and overall vitality.",
    "مزوتراپی و جوان‌سازی پوست",
    "پوست خود را با درمان‌های جوان‌سازی شخصی‌سازی‌شده طراوت و شادابی ببخشید؛ درمان‌هایی که برای بهبود کیفیت، کشسانی، درخشندگی و نشاط کلی پوست طراحی شده‌اند.",
  ),
  svc(
    "laser-hair-removal",
    "laser",
    "/images/gallery/laser-rejuv.webp",
    "Laser Hair Removal",
    "Smooth, confident skin with personalized laser hair removal treatments tailored to your needs and target areas.",
    "لیزر موهای زائد",
    "پوستی صاف و با اعتمادبه‌نفس با درمان‌های لیزر موهای زائد شخصی‌سازی‌شده متناسب با نیازها و نواحی موردنظر شما.",
  ),
  svc(
    "tattoo-removal-skin-brightening",
    "peel",
    null,
    "Tattoo Removal & Skin Brightening",
    "Reveal clearer, more even-looking skin with targeted Q-switched laser treatments for tattoo fading and pigmentation concerns.",
    "پاک‌سازی تاتو و روشن‌سازی پوست",
    "پوستی شفاف‌تر و یکدست‌تر با درمان‌های هدفمند لیزری Q-switched برای محو تاتو و رفع رنگ‌دانه‌ها.",
  ),
  svc(
    "hifu",
    "hifu",
    null,
    "HIFU",
    "Lift, tighten, and redefine your natural contours with personalized HIFU treatments for the face and body.",
    "هایفو (HIFU)",
    "لیفت، سفت‌کردن و بازتعریف خطوط طبیعی بدن با درمان‌های شخصی‌سازی‌شده هایفو برای صورت و بدن.",
  ),
  svc(
    "skin-care",
    "wellness",
    "/images/gallery/skin-care.webp",
    "Skin Care",
    "Personalized skin treatments designed to refresh, refine, and rejuvenate your complexion — from advanced facials to microneedling and lifting treatments.",
    "مراقبت از پوست",
    "درمان‌های پوستی شخصی‌سازی‌شده برای طراوت، پالایش و جوان‌سازی چهره — از فیشیال‌های پیشرفته تا میکرونیدلینگ و درمان‌های لیفتینگ.",
  ),
];

export const LANDING_ABOUT_STATS: SeedStat[] = [
  {
    value: 10000,
    compact: true,
    plus: true,
    i18n: { en: { label: "Happy Clients" }, fa: { label: "مشتری راضی" } },
  },
  {
    value: 15,
    compact: false,
    plus: true,
    i18n: { en: { label: "Years Experience" }, fa: { label: "سال تجربه" } },
  },
  {
    value: 50,
    compact: false,
    plus: true,
    i18n: { en: { label: "Services" }, fa: { label: "خدمت" } },
  },
];

export const LANDING_GALLERY_ITEMS: SeedGalleryItem[] = [
  {
    imageUrl: "/images/gallery/hydrafacial.webp",
    i18n: {
      en: { alt: "HydraFacial Service", caption: "HydraFacial Service" },
      fa: { alt: "خدمت هیدرافیشیال", caption: "خدمت هیدرافیشیال" },
    },
  },
  {
    imageUrl: "/images/gallery/laser-rejuv.webp",
    i18n: {
      en: { alt: "Laser Skin Rejuvenation", caption: "Laser Skin Rejuvenation" },
      fa: { alt: "جوان‌سازی پوست با لیزر", caption: "جوان‌سازی پوست با لیزر" },
    },
  },
  {
    imageUrl: "/images/gallery/microneedling.webp",
    i18n: { en: { alt: "Microneedling", caption: "Microneedling" }, fa: { alt: "میکرونیدلینگ", caption: "میکرونیدلینگ" } },
  },
  {
    imageUrl: "/images/gallery/skin-care.webp",
    i18n: { en: { alt: "Skin Care", caption: "Skin Care" }, fa: { alt: "مراقبت پوست", caption: "مراقبت پوست" } },
  },
];

export const LANDING_SECTIONS: SeedSection[] = [
  {
    key: "services",
    i18n: {
      en: {
        heading: "Our Expertise, Your Beauty",
        description:
          "Each service is meticulously designed by our experts using the latest technology.",
      },
      fa: {
        heading: "تخصص ما، زیبایی شماست",
        description:
          "هر خدمت با دقت توسط متخصصان مجرب ما و با جدیدترین فناوری‌های روز دنیا طراحی شده است.",
      },
    },
    services: LANDING_SERVICE_CARDS,
  },
  {
    key: "about",
    i18n: {
      en: {
        heading: "Where Science Meets Beauty",
        description:
          "At Nafas Clinic, we believe everyone deserves to shine. We combine advanced medical knowledge with a holistic approach to beauty.",
      },
      fa: {
        heading: "آنجا که علم با زیبایی پیوند می‌خورد",
        description:
          "در کلینیک نفس، باور داریم هر فردی شایسته درخشش است. ما دانش پزشکی پیشرفته را با رویکردی کل‌نگر به زیبایی تلفیق می‌کنیم.",
      },
    },
    stats: LANDING_ABOUT_STATS,
  },
  {
    key: "gallery",
    i18n: {
      en: { heading: "Transformation Gallery", description: null },
      fa: { heading: "گالری تحول‌ها", description: null },
    },
    galleryItems: LANDING_GALLERY_ITEMS,
  },
  {
    key: "contact",
    i18n: {
      en: {
        heading: "Address & Contact",
        description: "Nafas Aesthetic Clinic, at your service",
      },
      fa: {
        heading: "آدرس و ارتباط با ما",
        description: "کلینیک تخصصی زیبایی نفس، در خدمت زیبایی شما",
      },
    },
  },
];
