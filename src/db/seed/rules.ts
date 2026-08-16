/** Seed data for the `rules` / `rules_i18n` tables. */
import type { RuleContent } from "@/lib/services/rules-types";

export interface SeedRule {
  slug: string;
  icon: string;
  image: string | null;
  color: string;
  highlighted: boolean;
  displayOrder: number;
  isActive: boolean;
  i18n: { locale: "fa" | "en"; name: string; description: string | null }[];
}

export const RULES_SEED: SeedRule[] = [
  {
    slug: "respect-appointments",
    icon: "clock",
    image: null,
    color: "gold",
    highlighted: false,
    displayOrder: 1,
    isActive: true,
    i18n: [
      {
        locale: "fa",
        name: "احترام به وقت",
        description:
          "لطفاً در رعایت نوبت خود دقیق باشید و سر وقت مراجعه فرمایید تا بتوانیم بدون تأخیر به همه مراجعین خدمت‌رسانی کنیم.",
      },
      {
        locale: "en",
        name: "Respect Appointments",
        description:
          "Please be punctual and respect your appointment time so we can serve all patients without delay.",
      },
    ],
  },
  {
    slug: "keep-environment-clean",
    icon: "sparkles",
    image: null,
    color: "copper",
    highlighted: false,
    displayOrder: 2,
    isActive: true,
    i18n: [
      {
        locale: "fa",
        name: "محیط تمیز نگه داشته شود",
        description:
          "لطفاً در حفظ نظافت راهرو، آسانسور و مشاعات ساختمان نهایت همکاری را داشته باشید.",
      },
      {
        locale: "en",
        name: "Keep Environment Clean",
        description:
          "Please cooperate in maintaining the cleanliness of hallways, elevators and shared building spaces.",
      },
    ],
  },
  {
    slug: "parking-rules",
    icon: "car",
    image: null,
    color: "copper-strong",
    highlighted: false,
    displayOrder: 3,
    isActive: true,
    i18n: [
      {
        locale: "fa",
        name: "قوانین پارک",
        description:
          "لطفاً از پارک خودرو در کوچه، مقابل درب همسایگان و ایجاد مزاحمت برای ساکنین خودداری نمایید.",
      },
      {
        locale: "en",
        name: "Parking Rules",
        description:
          "Please avoid parking in the alley, in front of neighbors' doors and causing inconvenience to residents.",
      },
    ],
  },
  {
    slug: "companion-policy",
    icon: "users",
    image: null,
    color: "copper-deep",
    highlighted: false,
    displayOrder: 4,
    isActive: true,
    i18n: [
      {
        locale: "fa",
        name: "سیاست همراهان",
        description:
          "به منظور حفظ فضای آرام و راحتی بقیه بیماران، لطفاً همراهان غیرضروری به ویژه کودکان را همراه نداشته باشید.",
      },
      {
        locale: "en",
        name: "Companion Policy",
        description:
          "To maintain a peaceful environment and comfort of other patients, please avoid bringing unnecessary companions, especially children.",
      },
    ],
  },
  {
    slug: "wait-time",
    icon: "hourglass",
    image: null,
    color: "accent",
    highlighted: false,
    displayOrder: 5,
    isActive: true,
    i18n: [
      {
        locale: "fa",
        name: "زمان انتظار",
        description:
          "به دلیل ماهیت زمان‌بر برخی خدمات، زمان انتظار ممکن است تا ۳ ساعت طول بکشد. لطفاً برنامه‌ریزی کنید.",
      },
      {
        locale: "en",
        name: "Wait Time",
        description:
          "Due to the time-consuming nature of some services, wait times may be up to 3 hours. Please plan accordingly.",
      },
    ],
  },
  {
    slug: "cancellation-policy",
    icon: "calendar-x",
    image: null,
    color: "accent",
    highlighted: true,
    displayOrder: 6,
    isActive: true,
    i18n: [
      {
        locale: "fa",
        name: "سیاست لغو",
        description:
          "در صورت عدم امکان حضور، خواهشمند است حداقل ۲۴ ساعت قبل جهت لغو یا جابه‌جایی نوبت اطلاع دهید.",
      },
      {
        locale: "en",
        name: "Cancellation Policy",
        description:
          "If you cannot attend, please inform us at least 24 hours in advance for cancellation or rescheduling.",
      },
    ],
  },
];

// Helper for tests.
export function asRuleContent(name: string, description: string | null): RuleContent {
  return { name, description };
}
