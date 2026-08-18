import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Row, MockDb } from "@/lib/test/mock-db";
import { resetCacheForTests } from "@/lib/cache";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

import { db } from "@/src/db";
import { listRulesAdmin, findRuleIds, getRulesForPublic, bustPublicRulesCache } from "./rules-admin";

const mockDb = db as unknown as MockDb;
const UUID = () => randomUUID();

function makeRule(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    slug: "rule-slug",
    icon: "clock",
    image: null,
    color: "copper",
    highlighted: false,
    displayOrder: 0,
    isActive: true,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

function seedRule(overrides: Partial<Row> = {}, name = "Rule"): Row {
  const row = makeRule(overrides);
  mockDb.seed("rules", [row]);
  mockDb.seed("rules_i18n", [
    { ruleId: row.id, locale: "fa", name: `قانون ${name}`, description: "توضیح" },
    { ruleId: row.id, locale: "en", name: name, description: "Desc" },
  ]);
  return row;
}

beforeEach(() => {
  mockDb.reset();
  resetCacheForTests();
});

describe("rules-admin service", () => {
  it("lists rules with pagination", async () => {
    seedRule({ slug: "rule-1", displayOrder: 1 });
    seedRule({ slug: "rule-2", displayOrder: 2 });

    const result = await listRulesAdmin({ page: 1, perPage: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items[0].slug).toBe("rule-1");
  });

  it("filters rules by status", async () => {
    seedRule({ id: "1", slug: "active", isActive: true });
    seedRule({ id: "2", slug: "inactive", isActive: false });

    const active = await listRulesAdmin({ page: 1, perPage: 10, status: "active" });
    expect(active.items).toHaveLength(1);
    expect(active.items[0].slug).toBe("active");

    const inactive = await listRulesAdmin({ page: 1, perPage: 10, status: "inactive" });
    expect(inactive.items).toHaveLength(1);
    expect(inactive.items[0].slug).toBe("inactive");
  });

  it("finds rule IDs by status", async () => {
    seedRule({ id: "1", slug: "a", isActive: true });
    seedRule({ id: "2", slug: "b", isActive: false });

    const ids = await findRuleIds({ status: "active" });
    expect(ids).toEqual(["1"]);
  });

  it("searches rules by slug", async () => {
    seedRule({ slug: "respect-time" }, "Respect Time");
    seedRule({ slug: "hygiene" }, "Cleanliness");

    const bySlug = await listRulesAdmin({ page: 1, perPage: 10, search: "respect" });
    expect(bySlug.items).toHaveLength(1);
    expect(bySlug.items[0].slug).toBe("respect-time");
  });
});

describe("getRulesForPublic ordering", () => {
  it("puts highlighted rules first, then displayOrder", async () => {
    seedRule({ slug: "normal", highlighted: false, displayOrder: 1 }, "Normal");
    seedRule({ slug: "important", highlighted: true, displayOrder: 2 }, "Important");

    const rules = await getRulesForPublic("fa");
    expect(rules.map((r) => r.slug)).toEqual(["important", "normal"]);
  });
});

describe("getRulesForPublic caching", () => {
  const rulesSelectCount = () =>
    mockDb.log.filter((entry) => entry.type === "select" && entry.table === "rules").length;

  it("serves repeated reads from the cache without hitting the DB", async () => {
    seedRule({ slug: "cache-me" }, "Cache Me");

    const first = await getRulesForPublic("fa");
    expect(first).toHaveLength(1);
    expect(rulesSelectCount()).toBeGreaterThan(0);

    const before = rulesSelectCount();
    const second = await getRulesForPublic("fa");
    expect(second).toEqual(first);
    expect(rulesSelectCount()).toBe(before);
  });

  it("busts the cache so the next read re-queries the DB", async () => {
    seedRule({ slug: "bust-me" }, "Bust Me");

    await getRulesForPublic("fa");
    const before = rulesSelectCount();

    await bustPublicRulesCache();
    await getRulesForPublic("fa");
    expect(rulesSelectCount()).toBe(before + 1);
  });

  it("busts every locale at once via the shared content version", async () => {
    seedRule({ slug: "shared-bust" }, "Shared Bust");

    await getRulesForPublic("fa");
    const before = rulesSelectCount();
    await getRulesForPublic("en");

    // Every cached locale is versioned together, so one bump re-queries all.
    await bustPublicRulesCache();
    await getRulesForPublic("fa");
    await getRulesForPublic("en");
    expect(rulesSelectCount()).toBe(before + 3);
  });
});
