import { z } from "zod";

export const emailSchema = z.email().trim().toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "at least 8 characters")
  .max(128, "at most 128 characters")
  .regex(/[a-z]/, "a lowercase letter")
  .regex(/[A-Z]/, "an uppercase letter")
  .regex(/[0-9]/, "a number")
  .regex(/[^a-zA-Z0-9]/, "a special character");

export const phoneSchema = z.string().trim().regex(/^\+?[0-9]{7,15}$/);

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: emailSchema,
    phone: z
      .union([phoneSchema, z.literal("")])
      .transform((value) => (value === "" ? null : value)),
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();

/** Admin user listing query (search, status filter, pagination). */
export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    perPage: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["all", "active", "inactive", "banned"]).default("all"),
    role: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

/** Admin mutation of a user's account state. */
export const updateUserStatusSchema = z
  .object({
    isActive: z.boolean().optional(),
    isBanned: z.boolean().optional(),
    banReason: z.string().trim().max(500).nullish(),
  })
  .strict()
  .refine((data) => data.isActive !== undefined || data.isBanned !== undefined, {
    message: "Nothing to update.",
  });

export const createUserSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: emailSchema,
    phone: z.union([phoneSchema, z.literal("")]).transform((value) => (value === "" ? null : value)),
    password: passwordSchema,
    roleKey: z.string().trim().min(1).max(50),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserStatusFilter = NonNullable<ListUsersQuery["status"]>;
