import { eq } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import type { CreateRuleInput, UpdateRuleInput } from "@/lib/validation/rules";
import { db } from "@/src/db";
import { rules, rulesI18n } from "@/src/db/schema";
import { assertSlugAvailable, isUniqueViolation, uniqueSlugError } from "./helpers";
import { emptyRuleContent, loadRulesTranslations, upsertRuleTranslation } from "./i18n-rules";
import type { AdminRule, RuleContent } from "./rules-types";
import type { Locale } from "./types";

function mapRuleRow(
  row: typeof rules.$inferSelect,
  tr: { fa: RuleContent; en: RuleContent },
): AdminRule {
  return {
    id: row.id,
    slug: row.slug,
    icon: row.icon,
    image: row.image,
    color: row.color,
    highlighted: row.highlighted,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    name: tr.fa.name,
    description: tr.fa.description,
    translations: tr,
  };
}

export async function getRule(id: string): Promise<AdminRule> {
  const row = await db.query.rules.findFirst({
    where: eq(rules.id, id),
  });
  if (!row) throw new ApiError(404, "RULE_NOT_FOUND", "Rule not found.");
  const tr = (await loadRulesTranslations([id])).get(id) ?? {
    fa: emptyRuleContent(),
    en: emptyRuleContent(),
  };
  return mapRuleRow(row, tr);
}

export async function createRule(
  input: CreateRuleInput,
): Promise<{ id: string }> {
  try {
    const result = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(rules)
        .values({
          slug: input.slug,
          icon: input.icon ?? null,
          image: input.image ?? null,
          color: input.color ?? null,
          highlighted: input.highlighted,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
        })
        .returning({ id: rules.id });
      if (!row) {
        throw new ApiError(500, "RULE_CREATE_FAILED", "Could not create rule.");
      }

      const translations = input.translations;
      await tx.insert(rulesI18n).values([
        {
          ruleId: row.id,
          locale: "fa",
          name: translations.fa.name,
          description: translations.fa.description ?? null,
        },
        {
          ruleId: row.id,
          locale: "en",
          name: translations.en.name,
          description: translations.en.description ?? null,
        },
      ]);

      return { id: row.id };
    });

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("rule");
    throw error;
  }
}

export async function updateRule(
  id: string,
  input: UpdateRuleInput,
): Promise<void> {
  const existing = await db.query.rules.findFirst({
    where: eq(rules.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "RULE_NOT_FOUND", "Rule not found.");
  }

  if (input.slug !== undefined) {
    await assertSlugAvailable("rules", input.slug, id);
  }

  try {
    await db.transaction(async (tx) => {
      const { translations, ...rest } = input;
      if (Object.keys(rest).length > 0) {
        await tx.update(rules).set(rest).where(eq(rules.id, id));
      }
      if (translations) {
        const entries = Object.entries(translations) as [Locale, Partial<RuleContent>][];
        for (const [locale, content] of entries) {
          if (!content) continue;
          await upsertRuleTranslation(tx, id, locale, content);
        }
      }
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("rule");
    throw error;
  }
}

export async function deleteRule(id: string): Promise<void> {
  const existing = await db.query.rules.findFirst({
    where: eq(rules.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "RULE_NOT_FOUND", "Rule not found.");
  }

  await db.delete(rules).where(eq(rules.id, id));
}
