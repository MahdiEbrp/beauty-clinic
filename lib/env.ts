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
  // IndexNow protocol key, kept in sync with the key file hosted at the domain
  // root. Leaving it unset disables every submission rather than producing a
  // 403 from the endpoint.
  INDEXNOW_KEY: z
    .string()
    .regex(/^[A-Za-z0-9-]{8,128}$/)
    .optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  throw new Error(`Invalid environment variables:\n${issues.join("\n")}`);
}

export const env = parsed.data;
