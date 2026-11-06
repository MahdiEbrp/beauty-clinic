/* eslint-disable max-lines */
import { z } from "zod";

import { SLUG_PATTERN } from "@/lib/validation/slug";

/* ─────────────────────────────────────────────────────────────
 * Auth
 * ───────────────────────────────────────────────────────────── */

export const webhookAuthSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
});

export type WebhookAuthInput = z.infer<typeof webhookAuthSchema>;

/* ─────────────────────────────────────────────────────────────
 * Bookings
 * ───────────────────────────────────────────────────────────── */

export const bookingItemSchema = z
  .object({
    groupId: z.uuid(),
    slotId: z.uuid(),
    quantity: z.number().int().min(1).max(10).default(1),
  })
  .strict();

export const webhookCreateBookingSchema = z
  .object({
    fullName: z.string().trim().min(2).max(160),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+][0-9\s()-]{6,19}$/, "Enter a valid phone number")
      .max(24),
    email: z.email().trim().max(254).optional().nullable(),
    locale: z.enum(["fa", "en"]).default("fa"),
    notes: z.string().trim().max(1000).optional().nullable(),
    consultationRequired: z.boolean().default(false),
    hasAllergies: z.boolean().default(false),
    isPregnant: z.boolean().default(false),
    /** Webhook clients accept booking terms implicitly via API key. */
    termsAccepted: z.literal(true),
    items: z.array(bookingItemSchema).min(1).max(10),
  })
  .strict();

export type WebhookCreateBookingInput = z.infer<typeof webhookCreateBookingSchema>;

export const webhookListBookingsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "pending", "paid", "waiting", "done", "refunded"]).default("all"),
    slotId: z.uuid().optional(),
  })
  .strict();

export type WebhookListBookingsQuery = z.infer<typeof webhookListBookingsQuerySchema>;

export const webhookUpdateBookingSchema = z
  .object({
    fullName: z.string().trim().min(2).max(160).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+][0-9\s()-]{6,19}$/, "Enter a valid phone number")
      .max(24)
      .optional(),
    email: z.email().trim().max(254).optional().nullable(),
    notes: z.string().trim().max(1000).optional().nullable(),
    status: z.enum(["pending", "paid", "waiting", "done", "refunded"]).optional(),
  })
  .strict();

export type WebhookUpdateBookingInput = z.infer<typeof webhookUpdateBookingSchema>;

/* ─────────────────────────────────────────────────────────────
 * Services
 * ───────────────────────────────────────────────────────────── */

export const webhookListServicesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    categoryId: z.uuid().optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
    featured: z.enum(["all", "yes", "no"]).default("all"),
  })
  .strict();

export type WebhookListServicesQuery = z.infer<typeof webhookListServicesQuerySchema>;

const priceTypeSchema = z.enum(["fixed", "from", "on_request"]);

export const serviceGroupI18nSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    description: z.string().trim().max(1000).optional().nullable(),
    seoTitle: z.string().trim().max(256).optional().nullable(),
    seoDescription: z.string().trim().max(512).optional().nullable(),
  })
  .strict();

export const webhookCreateServiceGroupSchema = z
  .object({
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case"),
    icon: z.string().trim().max(100).optional().nullable(),
    image: z.string().trim().max(2048).optional().nullable(),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    isActive: z.boolean().default(true),
    translations: z
      .object({
        fa: serviceGroupI18nSchema,
        en: serviceGroupI18nSchema,
      })
      .strict(),
  })
  .strict();

export type WebhookCreateServiceGroupInput = z.infer<typeof webhookCreateServiceGroupSchema>;

export const webhookUpdateServiceGroupSchema = z
  .object({
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case").optional(),
    icon: z.string().trim().max(100).optional().nullable(),
    image: z.string().trim().max(2048).optional().nullable(),
    displayOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
    translations: z
      .object({
        fa: serviceGroupI18nSchema.partial(),
        en: serviceGroupI18nSchema.partial(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type WebhookUpdateServiceGroupInput = z.infer<typeof webhookUpdateServiceGroupSchema>;

export const serviceCategoryI18nSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    description: z.string().trim().max(1000).optional().nullable(),
    seoTitle: z.string().trim().max(256).optional().nullable(),
    seoDescription: z.string().trim().max(512).optional().nullable(),
  })
  .strict();

export const webhookCreateServiceCategorySchema = z
  .object({
    groupId: z.uuid(),
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case"),
    icon: z.string().trim().max(100).optional().nullable(),
    image: z.string().trim().max(2048).optional().nullable(),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    isActive: z.boolean().default(true),
    translations: z
      .object({
        fa: serviceCategoryI18nSchema,
        en: serviceCategoryI18nSchema,
      })
      .strict(),
  })
  .strict();

export type WebhookCreateServiceCategoryInput = z.infer<typeof webhookCreateServiceCategorySchema>;

export const webhookUpdateServiceCategorySchema = z
  .object({
    groupId: z.uuid().optional(),
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case").optional(),
    icon: z.string().trim().max(100).optional().nullable(),
    image: z.string().trim().max(2048).optional().nullable(),
    displayOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
    translations: z
      .object({
        fa: serviceCategoryI18nSchema.partial(),
        en: serviceCategoryI18nSchema.partial(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type WebhookUpdateServiceCategoryInput = z.infer<typeof webhookUpdateServiceCategorySchema>;

export const serviceI18nSchema = z
  .object({
    title: z.string().trim().min(1).max(256),
    shortDesc: z.string().trim().max(512).optional().nullable(),
    fullDesc: z.string().trim().max(4000).optional().nullable(),
    seoTitle: z.string().trim().max(60).optional().nullable(),
    seoDescription: z.string().trim().max(160).optional().nullable(),
  })
  .strict();

export const serviceImageInputSchema = z
  .object({
    imageUrl: z.string().trim().min(1).max(2048),
    type: z.enum(["before", "after", "gallery"]).default("gallery"),
    displayOrder: z.number().int().min(0).max(10000).default(0),
  })
  .strict();

export const serviceFaqI18nSchema = z
  .object({
    question: z.string().trim().min(1).max(512),
    answer: z.string().trim().min(1).max(4000),
  })
  .strict();

export const webhookCreateServiceSchema = z
  .object({
    categoryId: z.uuid(),
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case"),
    price: z.coerce.number().nonnegative().max(1_000_000_000).optional().nullable(),
    priceType: priceTypeSchema.default("fixed"),
    durationMin: z.number().int().min(1).max(1440).optional().nullable(),
    sessionsCount: z.number().int().min(1).max(100).default(1),
    coverImage: z.string().trim().max(2048).optional().nullable(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    translations: z
      .object({
        fa: serviceI18nSchema,
        en: serviceI18nSchema,
      })
      .strict(),
    images: z.array(serviceImageInputSchema).max(50).optional(),
    faqs: z
      .array(
        z.object({
          displayOrder: z.number().int().min(0).max(10000).default(0),
          translations: z
            .object({
              fa: serviceFaqI18nSchema,
              en: serviceFaqI18nSchema,
            })
            .strict(),
        })
      )
      .max(50)
      .optional(),
  })
  .strict();

export type WebhookCreateServiceInput = z.infer<typeof webhookCreateServiceSchema>;

export const webhookUpdateServiceSchema = z
  .object({
    categoryId: z.uuid().optional(),
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case").optional(),
    price: z.coerce.number().nonnegative().max(1_000_000_000).optional().nullable(),
    priceType: priceTypeSchema.optional(),
    durationMin: z.number().int().min(1).max(1440).optional().nullable(),
    sessionsCount: z.number().int().min(1).max(100).optional(),
    coverImage: z.string().trim().max(2048).optional().nullable(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(10000).optional(),
    translations: z
      .object({
        fa: serviceI18nSchema.partial(),
        en: serviceI18nSchema.partial(),
      })
      .strict()
      .optional(),
    images: z.array(serviceImageInputSchema).max(50).optional(),
    faqs: z
      .array(
        z.object({
          displayOrder: z.number().int().min(0).max(10000).default(0),
          translations: z
            .object({
              fa: serviceFaqI18nSchema,
              en: serviceFaqI18nSchema,
            })
            .strict(),
        })
      )
      .max(50)
      .optional(),
  })
  .strict();

export type WebhookUpdateServiceInput = z.infer<typeof webhookUpdateServiceSchema>;

/* ─────────────────────────────────────────────────────────────
 * Users
 * ───────────────────────────────────────────────────────────── */

export const webhookListUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive", "banned"]).default("all"),
    role: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

export type WebhookListUsersQuery = z.infer<typeof webhookListUsersQuerySchema>;

export const webhookCreateUserSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: z.email().trim().toLowerCase(),
    phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "a valid phone number"),
    password: z
      .string()
      .min(8, "at least 8 characters")
      .max(128, "at most 128 characters")
      .regex(/[a-z]/, "a lowercase letter")
      .regex(/[A-Z]/, "an uppercase letter")
      .regex(/[0-9]/, "a number")
      .regex(/[^a-zA-Z0-9]/, "a special character"),
    roleKey: z.string().trim().min(1).max(50),
  })
  .strict();

export type WebhookCreateUserInput = z.infer<typeof webhookCreateUserSchema>;

export const webhookUpdateUserStatusSchema = z
  .object({
    isActive: z.boolean().optional(),
    isBanned: z.boolean().optional(),
    banReason: z.string().trim().max(500).nullish(),
  })
  .strict()
  .refine(
    (data) => data.isActive !== undefined || data.isBanned !== undefined,
    { message: "Nothing to update." }
  );

export type WebhookUpdateUserStatusInput = z.infer<typeof webhookUpdateUserStatusSchema>;

/* ─────────────────────────────────────────────────────────────
 * Working hours
 * ───────────────────────────────────────────────────────────── */

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const webhookWorkingHoursDaySchema = z.enum([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

export const slotPatternSchema = z
  .object({
    startTime: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    capacity: z.number().int().min(1).max(500),
    groupIds: z.array(z.uuid()).max(50).optional(),
  })
  .strict();

export const webhookCreateWorkingHourSchema = z
  .object({
    day: webhookWorkingHoursDaySchema,
    opens: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    closes: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM"),
    capacity: z.number().int().min(1).max(500).default(1),
    displayOrder: z.number().int().min(0).max(1000).default(0),
    isActive: z.boolean().default(true),
    patterns: z.array(slotPatternSchema).max(96).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.closes <= data.opens) {
      ctx.addIssue({
        code: "custom",
        path: ["closes"],
        message: "Closes must be after opens",
      });
    }
  });

export type WebhookCreateWorkingHourInput = z.infer<typeof webhookCreateWorkingHourSchema>;

export const webhookUpdateWorkingHourSchema = z
  .object({
    opens: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM").optional(),
    closes: z.string().trim().regex(TIME_PATTERN, "Time must be HH:MM").optional(),
    capacity: z.number().int().min(1).max(500).optional(),
    displayOrder: z.number().int().min(0).max(1000).optional(),
    isActive: z.boolean().optional(),
    patterns: z.array(slotPatternSchema).max(96).optional(),
  })
  .strict();

export type WebhookUpdateWorkingHourInput = z.infer<typeof webhookUpdateWorkingHourSchema>;

export const webhookListWorkingHoursQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
  })
  .strict();

export type WebhookListWorkingHoursQuery = z.infer<typeof webhookListWorkingHoursQuerySchema>;

/* ─────────────────────────────────────────────────────────────
 * Settings
 * ───────────────────────────────────────────────────────────── */

const jsonValueSchema: z.ZodType<unknown> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.unknown()),
  z.record(z.string(), z.unknown()),
]);

export const localizedValueSchema = z.object({
  fa: z.union([z.string(), z.number()]).optional(),
  en: z.union([z.string(), z.number()]).optional(),
});

export const webhookListSettingsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
  })
  .strict();

export type WebhookListSettingsQuery = z.infer<typeof webhookListSettingsQuerySchema>;

export const webhookCreateSettingSchema = z
  .object({
    key: z.string().trim().min(1).max(128).regex(/^[a-z][a-z0-9_.]*$/),
    value: jsonValueSchema.optional(),
    type: z.enum(["string", "number", "boolean", "json", "localized"]).default("string"),
    isActive: z.boolean().default(true),
    displayOrder: z.number().int().min(0).max(100000).default(0),
    translations: localizedValueSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type === "localized") {
      if (!value.translations) {
        ctx.addIssue({
          code: "custom",
          path: ["translations"],
          message: "Localized settings require fa and en translations.",
        });
        return;
      }
      if (value.translations.fa === undefined && value.translations.en === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["translations"],
          message: "Provide at least one locale translation.",
        });
      }
    } else if (value.value === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "A value is required for non-localized settings.",
      });
    }
  });

export type WebhookCreateSettingInput = z.infer<typeof webhookCreateSettingSchema>;

export const webhookUpdateSettingSchema = z
  .object({
    value: jsonValueSchema.optional(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(100000).optional(),
    translations: localizedValueSchema.optional(),
  })
  .strict();

export type WebhookUpdateSettingInput = z.infer<typeof webhookUpdateSettingSchema>;

/* ─────────────────────────────────────────────────────────────
 * Rules
 * ───────────────────────────────────────────────────────────── */

export const ruleI18nSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    description: z.string().trim().max(2000).optional().nullable(),
  })
  .strict();

export const webhookCreateRuleSchema = z
  .object({
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case"),
    icon: z.string().trim().max(100).optional().nullable(),
    image: z.string().trim().max(2048).optional().nullable(),
    color: z.string().trim().max(50).optional().nullable(),
    highlighted: z.boolean().default(false),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    isActive: z.boolean().default(true),
    translations: z
      .object({
        fa: ruleI18nSchema,
        en: ruleI18nSchema,
      })
      .strict(),
  })
  .strict();

export type WebhookCreateRuleInput = z.infer<typeof webhookCreateRuleSchema>;

export const webhookUpdateRuleSchema = z
  .object({
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case").optional(),
    icon: z.string().trim().max(100).optional().nullable(),
    image: z.string().trim().max(2048).optional().nullable(),
    color: z.string().trim().max(50).optional().nullable(),
    highlighted: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
    translations: z
      .object({
        fa: ruleI18nSchema.partial(),
        en: ruleI18nSchema.partial(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type WebhookUpdateRuleInput = z.infer<typeof webhookUpdateRuleSchema>;

export const webhookListRulesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
  })
  .strict();

export type WebhookListRulesQuery = z.infer<typeof webhookListRulesQuerySchema>;

/* ─────────────────────────────────────────────────────────────
 * Care guides
 * ───────────────────────────────────────────────────────────── */

export const careGuideI18nSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    description: z.string().trim().max(2000).optional().nullable(),
  })
  .strict();

export const webhookCreateCareGuideSchema = z
  .object({
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case"),
    icon: z.string().trim().max(100).optional().nullable(),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    isActive: z.boolean().default(true),
    translations: z
      .object({
        fa: careGuideI18nSchema,
        en: careGuideI18nSchema,
      })
      .strict(),
  })
  .strict();

export type WebhookCreateCareGuideInput = z.infer<typeof webhookCreateCareGuideSchema>;

export const webhookUpdateCareGuideSchema = z
  .object({
    slug: z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Slug must be kebab-case").optional(),
    icon: z.string().trim().max(100).optional().nullable(),
    displayOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
    translations: z
      .object({
        fa: careGuideI18nSchema.partial(),
        en: careGuideI18nSchema.partial(),
      })
      .strict()
      .partial()
      .optional(),
  })
  .strict();

export type WebhookUpdateCareGuideInput = z.infer<typeof webhookUpdateCareGuideSchema>;

export const webhookListCareGuidesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
  })
  .strict();

export type WebhookListCareGuidesQuery = z.infer<typeof webhookListCareGuidesQuerySchema>;

export const careGuideItemI18nSchema = z
  .object({
    title: z.string().trim().min(1).max(256),
    description: z.string().trim().max(2000).optional().nullable(),
  })
  .strict();

export const webhookCreateCareGuideItemSchema = z
  .object({
    guideId: z.uuid(),
    highlighted: z.boolean().default(false),
    displayOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().default(true),
    translations: z
      .object({
        fa: careGuideItemI18nSchema,
        en: careGuideItemI18nSchema,
      })
      .strict(),
  })
  .strict();

export type WebhookCreateCareGuideItemInput = z.infer<typeof webhookCreateCareGuideItemSchema>;

export const webhookUpdateCareGuideItemSchema = z
  .object({
    guideId: z.uuid().optional(),
    highlighted: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
    translations: z
      .object({
        fa: careGuideItemI18nSchema.partial(),
        en: careGuideItemI18nSchema.partial(),
      })
      .strict()
      .partial()
      .optional(),
  })
  .strict();

export type WebhookUpdateCareGuideItemInput = z.infer<typeof webhookUpdateCareGuideItemSchema>;

export const webhookListCareGuideItemsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
    guideId: z.uuid().optional(),
  })
  .strict();

export type WebhookListCareGuideItemsQuery = z.infer<typeof webhookListCareGuideItemsQuerySchema>;

/* ─────────────────────────────────────────────────────────────
 * SMS
 * ───────────────────────────────────────────────────────────── */

export const webhookSmsProviderSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(["http", "smtp", "api"]),
  baseUrl: z.url().optional().nullable(),
  apiKey: z.string().trim().min(1).max(512).optional().nullable(),
  sender: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type WebhookSmsProviderInput = z.infer<typeof webhookSmsProviderSchema>;

export const webhookSmsTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  locale: z.enum(["fa", "en"]),
  subject: z.string().trim().max(200).optional().nullable(),
  body: z.string().trim().min(1).max(4000),
  variables: z.record(z.string(), z.string()).optional().nullable(),
});

export type WebhookSmsTemplateInput = z.infer<typeof webhookSmsTemplateSchema>;

export const webhookSmsMessageSchema = z.object({
  to: z.string().trim().min(1).max(50),
  body: z.string().trim().min(1).max(4000),
  provider: z.string().trim().min(1).max(100).optional(),
});

export type WebhookSmsMessageInput = z.infer<typeof webhookSmsMessageSchema>;

/* ─────────────────────────────────────────────────────────────
 * Common: UUID param validation
 * ───────────────────────────────────────────────────────────── */

export const uuidParamSchema = z.uuid();
export type UuidParam = z.infer<typeof uuidParamSchema>;
