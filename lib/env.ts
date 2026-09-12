import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  AUTH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/),
  NEXT_PUBLIC_SITE_URL: z.url(),
  CORS_ORIGINS: z.string().optional(),
  FILE_STORAGE_ROOT: z.string().optional(),
  FILE_MAX_BYTES: z.coerce.number().int().positive().optional(),
  KV_REST_API_URL: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().min(32).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  throw new Error(`Invalid environment variables:\n${issues.join("\n")}`);
}

export const env = parsed.data;
