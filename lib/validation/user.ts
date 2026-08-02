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

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
