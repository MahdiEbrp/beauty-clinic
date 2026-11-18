import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { findSlotIds } from "./slots-admin";

const { where } = vi.hoisted(() => ({ where: vi.fn<(_: SQL | undefined) => Promise<Array<{ id: string }>>>() }));
vi.mock("server-only", () => ({}));
vi.mock("@/src/db", () => ({ db: { select: () => ({ from: () => ({ where }) }) } }));
beforeEach(() => { where.mockReset(); where.mockResolvedValue([{ id: "matched" }]); });

function query() {
  const condition = where.mock.calls[0]?.[0];
  if (!condition) throw new Error("Expected query filters");
  return new PgDialect().sqlToQuery(condition);
}

describe("slot admin SQL filters", () => {
  it("parameterizes the date bounds and includes both linked and unrestricted slots", async () => {
    expect(await findSlotIds({ groupId: "selected-group", from: "2026-11-01", to: "2026-11-30" })).toEqual(["matched"]);
    const { sql, params } = query();
    expect(sql).toContain('"booking_slots"."slot_date" >=');
    expect(sql).toContain('"booking_slots"."slot_date" <=');
    expect(sql).toContain("NOT EXISTS");
    expect(sql).toContain("bsg.group_id =");
    expect(sql).toContain(" or ");
    expect(params).toEqual(["2026-11-01", "2026-11-30", "selected-group"]);
    expect(sql).not.toContain("selected-group");
  });

  it("supports a single date bound without a group restriction", async () => {
    await findSlotIds({ from: "2026-11-01" });
    const { sql, params } = query();
    expect(params).toEqual(["2026-11-01"]);
    expect(sql).not.toContain("EXISTS");
    expect(sql).not.toContain("<=");
  });
});
