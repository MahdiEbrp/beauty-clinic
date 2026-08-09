import { z } from "zod";

export const priceTypeSchema = z.enum(["fixed", "from", "on_request"]);

export const serviceImageTypeSchema = z.enum(["before", "after", "gallery"]);

export const serviceListQuerySchema = z
  .object({
    groupId: z.uuid().optional(),
    categoryId: z.uuid().optional(),
  })
  .strict();

/** Admin services listing query (search, filters, pagination). */
export const listServicesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    categoryId: z.uuid().optional(),
    status: z.enum(["all", "active", "inactive"]).default("all"),
    featured: z.enum(["all", "yes", "no"]).default("all"),
  })
  .strict();

export const createServiceGroupSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
    description: z.string().trim().max(1000).optional().nullable(),
    icon: z.string().trim().max(100).optional().nullable(),
    image: z.string().trim().max(2048).optional().nullable(),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    isActive: z.boolean().default(true),
    seoTitle: z.string().trim().max(256).optional().nullable(),
    seoDescription: z.string().trim().max(512).optional().nullable(),
  })
  .strict();

export const updateServiceGroupSchema = createServiceGroupSchema.partial();

export const createServiceCategorySchema = z
  .object({
    groupId: z.uuid(),
    name: z.string().trim().min(1).max(256),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
    description: z.string().trim().max(1000).optional().nullable(),
    icon: z.string().trim().max(100).optional().nullable(),
    image: z.string().trim().max(2048).optional().nullable(),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    isActive: z.boolean().default(true),
    seoTitle: z.string().trim().max(256).optional().nullable(),
    seoDescription: z.string().trim().max(512).optional().nullable(),
  })
  .strict();

export const updateServiceCategorySchema = createServiceCategorySchema.partial();

export const serviceImageInputSchema = z
  .object({
    imageUrl: z.string().trim().min(1).max(2048),
    type: serviceImageTypeSchema.default("gallery"),
    displayOrder: z.number().int().min(0).max(10000).default(0),
  })
  .strict();

export const serviceFaqInputSchema = z
  .object({
    question: z.string().trim().min(1).max(512),
    answer: z.string().trim().min(1).max(4000),
    displayOrder: z.number().int().min(0).max(10000).default(0),
  })
  .strict();

export const createServiceSchema = z
  .object({
    categoryId: z.uuid(),
    title: z.string().trim().min(1).max(256),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
    shortDesc: z.string().trim().max(512).optional().nullable(),
    fullDesc: z.string().trim().max(4000).optional().nullable(),
    price: z.coerce.number().nonnegative().max(1_000_000_000).optional().nullable(),
    priceType: priceTypeSchema.default("fixed"),
    durationMin: z.number().int().min(1).max(1440).optional().nullable(),
    sessionsCount: z.number().int().min(1).max(100).default(1),
    coverImage: z.string().trim().max(2048).optional().nullable(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    images: z.array(serviceImageInputSchema).max(50).optional(),
    faqs: z.array(serviceFaqInputSchema).max(50).optional(),
  })
  .strict();

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceListQuery = z.infer<typeof serviceListQuerySchema>;
export type CreateServiceGroupInput = z.infer<typeof createServiceGroupSchema>;
export type UpdateServiceGroupInput = z.infer<typeof updateServiceGroupSchema>;
export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>;
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategorySchema>;
export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;
