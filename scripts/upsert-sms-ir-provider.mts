/**
 * One-off: upsert an SMS.ir provider as the single active/default SMS sender
 * and register its OTP verify template (external template id).
 *
 * Secrets are never embedded here — the API key is read from the environment.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local --import tsx ./scripts/upsert-sms-ir-provider.mts
 *   node --env-file=.env.local --import tsx ./scripts/upsert-sms-ir-provider.mts --dry-run
 *
 * Env:
 *   DATABASE_URL        loaded from .env.local (required)
 *   ENCRYPTION_KEY      loaded from .env.local (required)
 *   SMSIR_API_KEY       SMS.ir API key (required)
 *   SMSIR_TEMPLATE_ID   SMS.ir verify template id (optional)
 *   SMSIR_LINE_NUMBER   sender line number (optional)
 *   SMSIR_TEMPLATE_KEY  local template key (default "login-otp")
 */
import { createCipheriv, randomBytes } from "node:crypto";
import postgres from "postgres";

const REQUIRED_ENV = ["DATABASE_URL", "ENCRYPTION_KEY", "SMSIR_API_KEY"] as const;
for (const name of REQUIRED_ENV) {
  if (!process.env[name]) {
    console.error(`Missing env var ${name} (run with --env-file=.env.local)`);
    process.exit(2);
  }
}

const DATABASE_URL = process.env.DATABASE_URL as string;
const KEY = Buffer.from(process.env.ENCRYPTION_KEY as string, "hex");
const API_KEY = (process.env.SMSIR_API_KEY as string).trim();
const TEMPLATE_ID = process.env.SMSIR_TEMPLATE_ID?.trim() ?? "";
const LINE_NUMBER = process.env.SMSIR_LINE_NUMBER?.trim() ?? "";
const TEMPLATE_KEY = process.env.SMSIR_TEMPLATE_KEY?.trim() || "login-otp";
const DRY_RUN = process.argv.includes("--dry-run");

const API_URL = "https://api.sms.ir/v1";

/** Mirror of lib/auth/encryption.ts (avoids importing @/lib/env in a script). */
function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

function resolveSslMode(url: string): boolean | "require" | "allow" | "prefer" | "verify-full" {
  const mode = new URL(url).searchParams.get("sslmode") ?? "require";
  if (mode === "disable" || mode === "false") return false;
  if (mode === "allow" || mode === "prefer" || mode === "require" || mode === "verify-full") {
    return mode;
  }
  return "require";
}

async function main() {
  const tokenLast4 = API_KEY.slice(-4);
  const settings = {
    authScheme: "x-api-key",
    payloadMode: "bulk",
    ...(LINE_NUMBER ? { lineNumber: LINE_NUMBER } : {}),
  };

  const provider = {
    name: "SMS.ir",
    kind: "sms_ir",
    api_url_encrypted: encryptSecret(API_URL),
    token_encrypted: encryptSecret(API_KEY),
    settings_encrypted: encryptSecret(JSON.stringify(settings)),
    token_last4: tokenLast4,
    sender: LINE_NUMBER || null,
    is_active: true,
    is_default: true,
    health_status: "unknown",
  };

  const templateTranslations = templateCopy();

  if (DRY_RUN) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          provider: { ...provider, api_url_encrypted: "<enc>", token_encrypted: "<enc>", settings_encrypted: "<enc>" },
          tokenLast4,
          templateId: TEMPLATE_ID || null,
          templateKey: TEMPLATE_ID ? TEMPLATE_KEY : null,
        },
        null,
        2,
      ),
    );
    return;
  }

  const sql = postgres(DATABASE_URL, { max: 1, ssl: resolveSslMode(DATABASE_URL) });
  try {
    const result = await sql.begin(async (tx) => {
      // The partial unique index allows a single non-deleted default row, so
      // demote every current default before promoting SMS.ir.
      await tx`
        update sms_providers
        set is_default = false, updated_at = now()
        where is_default = true and deleted_at is null
      `;

      const [existing] = await tx<{ id: string }[]>`
        select id from sms_providers
        where kind = 'sms_ir' and deleted_at is null
        order by updated_at desc
        limit 1
      `;

      let providerId: string;
      if (existing) {
        providerId = existing.id;
        await tx`
          update sms_providers set
            name = ${provider.name},
            api_url_encrypted = ${provider.api_url_encrypted},
            token_encrypted = ${provider.token_encrypted},
            settings_encrypted = ${provider.settings_encrypted},
            token_last4 = ${provider.token_last4},
            sender = ${provider.sender},
            is_active = true,
            is_default = true,
            health_status = 'unknown',
            last_health_error = null,
            updated_at = now()
          where id = ${providerId}
        `;
      } else {
        const [inserted] = await tx<{ id: string }[]>`
          insert into sms_providers (
            name, kind, api_url_encrypted, token_encrypted, settings_encrypted,
            token_last4, sender, is_active, is_default, health_status
          ) values (
            ${provider.name}, ${provider.kind}, ${provider.api_url_encrypted},
            ${provider.token_encrypted}, ${provider.settings_encrypted},
            ${provider.token_last4}, ${provider.sender}, true, true, 'unknown'
          )
          returning id
        `;
        providerId = inserted.id;
      }

      let templateId: string | null = null;
      if (TEMPLATE_ID) {
        const [existingTemplate] = await tx<{ id: string }[]>`
          select id from sms_templates
          where key = ${TEMPLATE_KEY} and deleted_at is null
          limit 1
        `;
        if (existingTemplate) {
          templateId = existingTemplate.id;
          await tx`
            update sms_templates set
              external_template_id = ${TEMPLATE_ID},
              message_type = 'transactional',
              variables = ${JSON.stringify(["OTP"])}::jsonb,
              is_active = true,
              updated_at = now()
            where id = ${templateId}
          `;
        } else {
          const [insertedTemplate] = await tx<{ id: string }[]>`
            insert into sms_templates (key, external_template_id, message_type, variables, is_active, display_order)
            values (${TEMPLATE_KEY}, ${TEMPLATE_ID}, 'transactional', ${JSON.stringify(["OTP"])}::jsonb, true, 0)
            returning id
          `;
          templateId = insertedTemplate.id;
        }

        for (const [locale, copy] of Object.entries(templateTranslations)) {
          await tx`
            insert into sms_templates_i18n (template_id, locale, name, content)
            values (${templateId}, ${locale}, ${copy.name}, ${copy.content})
            on conflict (template_id, locale) do update
              set name = excluded.name, content = excluded.content
          `;
        }
      }

      return { providerId, templateId };
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          providerId: result.providerId,
          isDefault: true,
          tokenLast4,
          templateId: result.templateId,
          templateKey: result.templateId ? TEMPLATE_KEY : null,
          smsirTemplateId: result.templateId ? TEMPLATE_ID : null,
        },
        null,
        2,
      ),
    );
  } finally {
    await sql.end();
  }
}

function templateCopy(): Record<string, { name: string; content: string }> {
  const content = "کلینیک زیبایی نفس\nرمز یکبار مصرف: {{OTP}}\nnafasbeautyclinic.ir";
  return {
    fa: { name: "رمز یکبار مصرف", content },
    en: { name: "One-time password", content },
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
