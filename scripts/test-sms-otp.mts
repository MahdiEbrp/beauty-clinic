/**
 * Live OTP (SMS.ir /send/verify) test against the real SMS provider.
 *
 * Loads the configured provider from the database (decrypting its secrets),
 * builds the adapter, then sends an OTP verification for one or more mobile
 * numbers and reports the provider's actual response.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local --import tsx ./scripts/test-sms-otp.mts \
 *     --mobile=09123456789 \
 *     --template-id=123456 \
 *     --params=CODE:4821,USER:ali
 *
 * Arguments:
 *   --mobile=...     comma-separated Iranian mobile numbers (required)
 *   --template-id=.. SMS.ir verify template id (required)
 *   --params=K:V,... template parameters; split on the first ':' (optional)
 *   --provider=<id>  provider id to test (defaults to active sms_ir provider)
 *   --dry-run        print the request it would send without calling SMS.ir
 *
 * Exit code: 0 on success, 1 on provider/logical failure, 2 on usage error.
 */
import { createDecipheriv } from "node:crypto";
import postgres from "postgres";
import { createSmsProviderAdapter, type SmsProviderConfig } from "@/lib/sms/providers";
import type { SmsProviderKind } from "@/src/db/schema";

const REQUIRED_ENV = ["DATABASE_URL", "ENCRYPTION_KEY"] as const;
for (const name of REQUIRED_ENV) {
  if (!process.env[name]) {
    console.error(`Missing env var ${name} (run with --env-file=.env.local)`);
    process.exit(2);
  }
}
const DATABASE_URL = process.env.DATABASE_URL as string;
const KEY = Buffer.from(process.env.ENCRYPTION_KEY as string, "hex");

function decryptSecret(payload: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split(".");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Unsupported encryption version");
  }
  const decipher = createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** Honor the connection URL's `sslmode` (Liara sets `disable`). */
function resolveSslMode(url: string): boolean | "require" | "allow" | "prefer" | "verify-full" {
  const mode = new URL(url).searchParams.get("sslmode") ?? "require";
  if (mode === "disable" || mode === "false") return false;
  if (mode === "allow" || mode === "prefer" || mode === "require" || mode === "verify-full") {
    return mode;
  }
  return "require";
}

/** The `sms_providers` row fields this script reads. */
interface SmsProviderRow {
  id: string;
  name: string;
  kind: SmsProviderKind;
  sender: string | null;
  settings_encrypted: string;
  api_url_encrypted: string;
  token_encrypted: string;
}

function parseArgs(args: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const arg of args) {
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    if (eq === -1) {
      out[arg.slice(2)] = "true";
    } else {
      out[arg.slice(2, eq)] = arg.slice(eq + 1);
    }
  }
  return out;
}

function parseParams(raw: string | undefined): Array<{ name: string; value: string }> {
  if (!raw) return [];
  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const colon = pair.indexOf(":");
      if (colon === -1) throw new Error(`Expected "NAME:VALUE", got "${pair}"`);
      return { name: pair.slice(0, colon).trim(), value: pair.slice(colon + 1).trim() };
    });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mobileRaw = args.mobile;
  const templateId = Number(args["template-id"]);
  const providerId = args.provider;
  const dryRun = args["dry-run"] === "true";

  if (!mobileRaw) {
    console.error("Missing --mobile=... (comma-separated Iranian mobiles)");
    process.exit(2);
  }
  if (!Number.isInteger(templateId) || templateId <= 0) {
    console.error("Missing/invalid --template-id=... (positive integer)");
    process.exit(2);
  }
  const mobiles = mobileRaw.split(",").map((m) => m.trim()).filter(Boolean);
  const parameters = parseParams(args.params);

  const sql = postgres(DATABASE_URL, { max: 2, ssl: resolveSslMode(DATABASE_URL) });
  let row: SmsProviderRow | undefined;
  try {
    if (providerId) {
      [row] = await sql`
        select * from sms_providers
        where id = ${providerId} and deleted_at is null
      `;
    } else {
      [row] = await sql`
        select * from sms_providers
        where kind = 'sms_ir' and is_active = true and deleted_at is null
        order by is_default desc, updated_at desc
        limit 1
      `;
    }
  } finally {
    await sql.end();
  }

  if (!row) {
    console.error("No matching SMS.ir provider found in the database.");
    process.exit(2);
  }

  const settings = JSON.parse(decryptSecret(row.settings_encrypted)) as Record<string, unknown>;
  const config: SmsProviderConfig = {
    kind: row.kind,
    apiUrl: decryptSecret(row.api_url_encrypted),
    token: decryptSecret(row.token_encrypted),
    credentials: {
      authScheme: settings.authScheme as SmsProviderConfig["credentials"]["authScheme"],
      lineNumber: (settings.lineNumber as string | undefined) ?? undefined,
      payloadMode: (settings.payloadMode as SmsProviderConfig["credentials"]["payloadMode"]) ?? undefined,
    },
    sender: row.sender,
  };

  const summary = {
    provider: { id: row.id, name: row.name, kind: row.kind },
    apiUrl: config.apiUrl,
    sender: config.sender ?? null,
    lineNumber: config.credentials.lineNumber ?? null,
  };

  const request = {
    recipients: mobiles,
    templateId,
    parameters,
  };

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, ...summary, request }, null, 2));
    return;
  }

  const adapter = createSmsProviderAdapter(config);
  const sendVerify = adapter.sendVerify;
  if (!sendVerify) {
    console.error(
      "The selected SMS provider does not support OTP verification (sendVerify).",
    );
    process.exit(2);
  }
  try {
    const startedAt = Date.now();
    const result = await sendVerify(request);
    const durationMs = Date.now() - startedAt;

    console.log(JSON.stringify(
      {
        ...summary,
        templateId,
        parameters,
        durationMs,
        statusCode: result.statusCode,
        accepted: result.accepted,
        rejected: result.rejected,
        ok: result.accepted.length > 0,
      },
      null,
      2,
    ));

    process.exit(result.accepted.length > 0 && result.rejected.length === 0 ? 0 : 1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ ...summary, error: message }, null, 2));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
