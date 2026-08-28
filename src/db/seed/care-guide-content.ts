// ---------------------------------------------------------------------------
// Care guide seed data — reflects the live care guides in the database.
//
// Structure mirrors db schema: care_guides -> care_guide_items, each with
// per-locale (fa/en) i18n. Fa translations are drafts to be reviewed, en is
// the source content supplied by the clinic.
// ---------------------------------------------------------------------------

export type SeedGuideItem = {
  highlighted: boolean;
  displayOrder: number;
  i18n: { locale: "fa" | "en"; title: string; description: string | null }[];
};

export type SeedGuide = {
  slug: string;
  icon: string;
  displayOrder: number;
  i18n: { locale: "fa" | "en"; name: string; description: string | null }[];
  items: SeedGuideItem[];
};

export const CARE_GUIDES_SEED: SeedGuide[] = [
  {
    slug: "pre-injection",
    icon: "CalendarClock",
    displayOrder: 1,
    i18n: [
      {
        locale: "fa",
        name: "دستورالعمل‌های قبل از تزریق",
        description:
          "نکات مهم قبل از مراجعه برای فیلر، بوتاکس و سایر خدمات زیبایی که به بهبود نتیجه کمک می‌کند.",
      },
      {
        locale: "en",
        name: "Pre-Injection Instructions",
        description:
          "Following these instructions will improve your results",
      },
    ],
    items: [
      {
        highlighted: false,
        displayOrder: 1,
        i18n: [
          { locale: "fa", title: "خودداری از مصرف الکل", description: null },
          { locale: "en", title: "Avoid Alcohol", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 2,
        i18n: [
          { locale: "fa", title: "خودداری از رقیق‌کننده‌های خون", description: null },
          { locale: "en", title: "Avoid Blood Thinners", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 3,
        i18n: [
          { locale: "fa", title: "خودداری از ورزش سنگین", description: null },
          { locale: "en", title: "Avoid Heavy Exercise", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 4,
        i18n: [
          { locale: "fa", title: "بدون آرایش غلیظ", description: null },
          { locale: "en", title: "No Heavy Makeup", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 5,
        i18n: [
          { locale: "fa", title: "اطلاع‌رسانی شرایط پزشکی", description: null },
          { locale: "en", title: "Disclose Medical Conditions", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 6,
        i18n: [
          { locale: "fa", title: "نوشیدن آب فراوان", description: null },
          { locale: "en", title: "Drink Plenty of Water", description: null },
        ],
      },
    ],
  },
  {
    slug: "post-filler-care",
    icon: "HeartPulse",
    displayOrder: 2,
    i18n: [
      {
        locale: "fa",
        name: "مراقبت‌های بعد از فیلر",
        description:
          "نکات مهم بعد از تزریق فیلر برای حفظ نتایج و پیشگیری از عوارض.",
      },
      {
        locale: "en",
        name: "Post-Filler Care",
        description:
          "Important tips after filler injection to maintain results and prevent complications",
      },
    ],
    items: [
      {
        highlighted: false,
        displayOrder: 1,
        i18n: [
          { locale: "fa", title: "خودداری از گرمای شدید", description: null },
          { locale: "en", title: "Avoid Extreme Heat", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 2,
        i18n: [
          { locale: "fa", title: "بدون آرایش به مدت ۴۸ ساعت", description: null },
          { locale: "en", title: "No Makeup for 48 Hours", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 3,
        i18n: [
          {
            locale: "fa",
            title: "بدون الکل به مدت یک هفته",
            description: "به مدت یک هفته کاملاً از نوشیدنی‌های الکلی خودداری کنید.",
          },
          {
            locale: "en",
            title: "No Alcohol for One Week",
            description: "Strictly avoid alcoholic beverages for one week.",
          },
        ],
      },
      {
        highlighted: false,
        displayOrder: 4,
        i18n: [
          {
            locale: "fa",
            title: "بدون سیگار به مدت یک هفته",
            description: null,
          },
          { locale: "en", title: "No Smoking for One Week", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 5,
        i18n: [
          {
            locale: "fa",
            title: "بدون ورزش سنگین به مدت ۴۸ ساعت",
            description: null,
          },
          {
            locale: "en",
            title: "No Heavy Exercise for 48 Hours",
            description: null,
          },
        ],
      },
      {
        highlighted: false,
        displayOrder: 6,
        i18n: [
          { locale: "fa", title: "مصرف سفالکسین", description: null },
          { locale: "en", title: "Take Cephalexin", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 7,
        i18n: [
          { locale: "fa", title: "مصرف ویتامین C و آب", description: null },
          { locale: "en", title: "Take Vitamin C & Water", description: null },
        ],
      },
      {
        highlighted: false,
        displayOrder: 8,
        i18n: [
          { locale: "fa", title: "تماس با پزشک خود", description: null },
          { locale: "en", title: "Contact Your Doctor", description: null },
        ],
      },
    ],
  },
  {
    slug: "filler-durability",
    icon: "Clock",
    displayOrder: 3,
    i18n: [
      {
        locale: "fa",
        name: "ماندگاری فیلر",
        description: "نکات مهم درباره طول عمر فیلر.",
      },
      {
        locale: "en",
        name: "Filler Durability",
        description: "Important notes about filler longevity",
      },
    ],
    items: [
      {
        highlighted: false,
        displayOrder: 1,
        i18n: [
          {
            locale: "fa",
            title: "سازگاری بدن با برند",
            description:
              "هر برند متفاوت است. اگر فردی با یک برند نتیجه خوبی گرفته، تضمینی نیست که برای شما هم همان‌طور باشد.",
          },
          {
            locale: "en",
            title: "Body Compatibility with Brand",
            description:
              "Each brand is different. If someone had good results with a brand, it doesn't guarantee the same for you.",
          },
        ],
      },
      {
        highlighted: false,
        displayOrder: 2,
        i18n: [
          {
            locale: "fa",
            title: "ماندگاری بر اساس ناحیه صورت",
            description:
              "نواحی پراستفاده مانند لب‌ها ماندگاری کمتری نسبت به چانه دارند و ماندگاری خط خنده کمتر از فیلر زاویه فک است.",
          },
          {
            locale: "en",
            title: "Durability by Facial Area",
            description:
              "High-use areas like lips have less durability than chin, and smile line durability is less than angle filler.",
          },
        ],
      },
      {
        highlighted: false,
        displayOrder: 3,
        i18n: [
          {
            locale: "fa",
            title: "اهمیت مراقبت‌های بعدی",
            description:
              "ماندگاری به مراقبت شما و رعایت دستورالعمل‌های بعد از تزریق بستگی دارد.",
          },
          {
            locale: "en",
            title: "Importance of Aftercare",
            description:
              "Durability depends on your care and following post-injection instructions.",
          },
        ],
      },
      {
        highlighted: true,
        displayOrder: 4,
        i18n: [
          {
            locale: "fa",
            title: "نکته مهم برای اولین‌بار",
            description:
              "مشتریانی که اولین بار این کار را انجام می‌دهند به یک دوره تطبیق ۲۰ روزه برای جا افتادن ژل نیاز دارند. جذب ژل طبیعی است و برای رسیدن به نتیجه مطلوب حداقل به دو جلسه نیاز دارید.",
          },
          {
            locale: "en",
            title: "Important Note for First-Timers",
            description:
              "First-time clients need a 20-day adaptation period for the gel to adjust. Gel absorption is natural and you need at least two sessions for desired results.",
          },
        ],
      },
    ],
  },
];
