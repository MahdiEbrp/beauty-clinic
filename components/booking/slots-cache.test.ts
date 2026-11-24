import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAvailableSlots } from "./api";
import { getSlots, invalidateSlots } from "./slots-cache";
import type { SharedSlotQuery } from "./types";

vi.mock("./api", () => ({ fetchAvailableSlots: vi.fn() }));
beforeEach(() => {
  invalidateSlots();
  vi.clearAllMocks();
  vi.mocked(fetchAvailableSlots).mockResolvedValue([]);
});
const query = (groups: string[], quantities = groups.map(() => 1)): SharedSlotQuery => ({
  groupIds: [...groups].sort(), quantity: quantities.reduce((a, b) => a + b, 0),
  items: groups.map((groupId, index) => ({ groupId, quantity: quantities[index] })),
});

describe("consecutive slot cache isolation", () => {
  it("does not reuse a plan when group order changes with the same total", async () => {
    await getSlots("2026-11-19", undefined, query(["a", "b"])).fresh;
    await getSlots("2026-11-19", undefined, query(["b", "a"])).fresh;
    expect(fetchAvailableSlots).toHaveBeenCalledTimes(2);
  });

  it("does not reuse a plan when quantities move between groups", async () => {
    await getSlots("2026-11-19", undefined, query(["a", "b"], [2, 1])).fresh;
    await getSlots("2026-11-19", undefined, query(["a", "b"], [1, 2])).fresh;
    expect(fetchAvailableSlots).toHaveBeenCalledTimes(2);
  });

  it("reuses identical plans and isolates legacy shared queries", async () => {
    const shared = query(["a", "b"]);
    await getSlots("2026-11-19", undefined, shared).fresh;
    expect(getSlots("2026-11-19", undefined, shared).hit).toBe(true);
    await getSlots("2026-11-19", undefined, { groupIds: ["a", "b"], quantity: 2 }).fresh;
    expect(fetchAvailableSlots).toHaveBeenCalledTimes(2);
  });
});
