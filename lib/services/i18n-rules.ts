import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/src/db";
import { rulesI18n } from "@/src/db/schema";
import type { RuleContent } from "./rules-types";
import type { Locale, TranslatedContent } from "./types";
import type { Tx } from "./i18n";

export function emptyRuleContent(): RuleContent {
  return { name: "", description: null };
}

export async function loadRulesTranslations(
  ids: string[],
): Promise<Map<string, TranslatedContent<RuleContent>>> {
  const map = new Map<string, TranslatedContent<RuleContent>>();
  if (ids.length === 0) return map;
  for (const id of ids) map.set(id, { fa: emptyRuleContent(), en: emptyRuleContent() });
  const rows = await db
    .select()
    .from(rulesI18n)
    .where(inArray(rulesI18n.ruleId, ids));
  for (const row of rows) {
    const entry = map.get(row.ruleId);
    if (!entry) continue;
    entry[row.locale as "fa" | "en"] = {
      name: row.name,
      description: row.description,
    };
  }
  return map;
}

export async function upsertRuleTranslation(
  tx: Tx,
  ruleId: string,
  locale: Locale,
  content: Partial<RuleContent>,
): Promise<void> {
  const existing = await tx
    .select()
    .from(rulesI18n)
    .where(and(eq(rulesI18n.ruleId, ruleId), eq(rulesI18n.locale, locale)))
    .limit(1);
  const current = existing[0];
  const values = {
    name: content.name ?? current?.name ?? "",
    description: content.description !== undefined ? content.description ?? null : (current?.description ?? null),
  };
  await tx
    .insert(rulesI18n)
    .values({ ruleId, locale, ...values })
    .onConflictDoUpdate({
      target: [rulesI18n.ruleId, rulesI18n.locale],
      set: values,
    });
}
