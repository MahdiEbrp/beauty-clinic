import { desc } from "drizzle-orm";
import { db } from "./src/db";
import { emailProviderChecks, emailProviders } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const rows = await db
    .select({
      id: emailProviderChecks.id,
      providerId: emailProviderChecks.providerId,
      isSuccessful: emailProviderChecks.isSuccessful,
      statusCode: emailProviderChecks.statusCode,
      errorCode: emailProviderChecks.errorCode,
      errorMessage: emailProviderChecks.errorMessage,
      createdAt: emailProviderChecks.createdAt,
    })
    .from(emailProviderChecks)
    .orderBy(desc(emailProviderChecks.createdAt))
    .limit(10);
  const providers = await db
    .select({ id: emailProviders.id, name: emailProviders.name, kind: emailProviders.kind })
    .from(emailProviders);
  const byId = new Map(providers.map((p) => [p.id, `${p.name} (${p.kind})`]));
  console.log(JSON.stringify(rows.map((r) => ({ ...r, provider: byId.get(r.providerId) })), null, 2));
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
