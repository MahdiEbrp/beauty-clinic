import { z } from "zod";

export const settingKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[a-z][a-z0-9_.]*$/);

export const SUPPORTED_TYPES = ["string", "number", "boolean", "object", "array"] as const;
export type ValueType = (typeof SUPPORTED_TYPES)[number];

export const SCOPE_VALUES = ["user", "system"] as const;
export type Scope = (typeof SCOPE_VALUES)[number];

const jsonValueSchema: z.ZodType<unknown> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.unknown()),
  z.record(z.string(), z.unknown()),
]);

function inferType(value: unknown): ValueType {
  if (value === null) return "object";
  if (Array.isArray(value)) return "array";
  if (value !== null && typeof value === "object") return "object";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  return "boolean";
}

function typeMatches(type: ValueType, value: unknown): boolean {
  return inferType(value) === type;
}

export const upsertSettingSchema = z
  .object({
    scope: z.enum(SCOPE_VALUES).optional(),
    key: settingKeySchema,
    value: jsonValueSchema.refine(
      (v) => JSON.stringify(v).length <= 10_000,
      "Value exceeds 10 KB",
    ),
    type: z.enum(SUPPORTED_TYPES).optional(),
    userId: z.string().uuid().optional(),
  })
  .strict()
  .refine(
    ({ type, value }) => {
      if (!type) return true;
      return typeMatches(type, value);
    },
    { message: "Value does not match the declared type", path: ["type"] },
  );

export const settingsQuerySchema = z
  .object({
    scope: z.enum(SCOPE_VALUES).optional(),
    page: z
      .string()
      .optional()
      .transform((v) => {
        const n = Number(v ?? "1");
        return Number.isFinite(n) && n >= 1 ? n : 1;
      }),
    limit: z
      .string()
      .optional()
      .transform((v) => {
        const n = Number(v ?? "20");
        return Number.isFinite(n) && n >= 1 && n <= 100 ? n : 20;
      }),
    userId: z.string().uuid().optional(),
  })
  .strict();

export const deleteSettingsQuerySchema = z
  .object({
    scope: z.enum(SCOPE_VALUES).optional(),
    key: settingKeySchema,
    userId: z.string().uuid().optional(),
  })
  .strict();

export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>;
export type SettingsQuery = z.infer<typeof settingsQuerySchema>;
export type DeleteSettingsQuery = z.infer<typeof deleteSettingsQuerySchema>;
