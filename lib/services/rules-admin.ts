import { and, count, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import type { RuleStatusFilter } from "@/lib/validation/rules";
import { db } from "@/src/db";
import { rules, rulesI18n } from "@/src/db/schema";
import { loadRulesTranslations } from "./i18n-rules";
import type { AdminRule, ListRulesResult, PublicRule } from "./rules-types";
import type { Locale } from "./types";

function emptyRuleContent() {
  return { name: "", description: null };
}

function rulesListConditions(opts: {
  search?: string;
  status?: RuleStatusFilter;
}): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(rules.slug, term),
        sql`exists (
          select 1 from ${rulesI18n}
          where ${rulesI18n.ruleId} = ${rules.id}
            and ${rulesI18n.name} ilike ${term}
        )`,
      ),
    );
  }
  if (opts.status === "active") conditions.push(eq(rules.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(rules.isActive, false));
  return conditions;
}

async function toAdminRules(
  rows: typeof rules.$inferSelect[],
): Promise<AdminRule[]> {
  const ids = rows.map((row) => row.id);
  const trMap = await loadRulesTranslations(ids);

  return rows.map((row) => {
    const tr = trMap.get(row.id) ?? {
      fa: emptyRuleContent(),
      en: emptyRuleContent(),
    };
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
  });
}

export async function listRulesAdmin(opts: {
  page: number;
  perPage: number;
  search?: string;
  status?: RuleStatusFilter;
}): Promise<ListRulesResult> {
  const { page, perPage, search, status = "all" } = opts;
  const offset = (page - 1) * perPage;
  const where = and(...rulesListConditions({ search, status }));

  const [countRow] = await db
    .select({ value: count() })
    .from(rules)
    .where(where);
  const total = countRow?.value ?? 0;

  const rows = await db
    .select()
    .from(rules)
    .where(where)
    .orderBy(rules.displayOrder, rules.createdAt)
    .limit(perPage)
    .offset(offset);

  return {
    items: await toAdminRules(rows),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function findRuleIds(opts: {
  search?: string;
  status?: RuleStatusFilter;
}): Promise<string[]> {
  const where = and(...rulesListConditions(opts));
  const rows = await db
    .select({ id: rules.id })
    .from(rules)
    .where(where);
  return rows.map((row) => row.id);
}

/** Fetch all active rules localized for the given locale (public site). */
export async function getRulesForPublic(
  locale: Locale,
  opts: { status?: "active" | "inactive" | "all" } = {},
): Promise<PublicRule[]> {
  const status = opts.status ?? "active";
  const where =
    status === "active"
      ? eq(rules.isActive, true)
      : status === "inactive"
        ? eq(rules.isActive, false)
        : undefined;

  const rows = await db
    .select()
    .from(rules)
    .where(where)
    .orderBy(rules.displayOrder, rules.createdAt);

  const ids = rows.map((row) => row.id);
  const trMap = await loadRulesTranslations(ids);

  return rows.map((row) => {
    const tr = trMap.get(row.id) ?? { fa: emptyRuleContent(), en: emptyRuleContent() };
    const content = locale === "en" ? tr.en : tr.fa;
    return {
      id: row.id,
      slug: row.slug,
      name: content.name,
      description: content.description,
      icon: row.icon,
      image: row.image,
      color: row.color,
      highlighted: row.highlighted,
      displayOrder: row.displayOrder,
    };
  });
}
