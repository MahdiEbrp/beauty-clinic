import { describe, expect, it } from "vitest";
import type { CartItem, SelectedGroup, SlotOption } from "@/components/booking/types";
import { assignConsecutiveCart, cartSequenceItems } from "./cart-sequence";
import { consecutiveOptions } from "./consecutive-slots";

function line(id: string, quantity = 1): CartItem {
  const group: SelectedGroup = {
    id, slug: id, title: id, icon: null, image: null, description: null,
    seoTitle: null, seoDescription: null, updatedAt: new Date(), displayOrder: 0, categories: [], groupIndex: 0,
  };
  return { group, quantity, slot: null };
}
const slots: SlotOption[] = [0, 1, 2, 3].map((i) => ({
  id: `slot-${i}`, slotDate: "2026-11-19", startTime: `13:${String(i * 15).padStart(2, "0")}`,
  endTime: i === 3 ? "14:00" : `13:${String((i + 1) * 15).padStart(2, "0")}`,
  capacity: 1, bookedCount: 0, available: true, isActive: true, groupIds: [],
}));
function choose(cart: CartItem[], index = 0) {
  const start = consecutiveOptions(slots, cart.map((l) => ({ groupId: l.group.id, quantity: l.quantity })), 0)[index];
  const assigned = assignConsecutiveCart(cart, start);
  if (!assigned) throw new Error("Expected a valid plan");
  return assigned;
}

describe("cart consecutive allocations", () => {
  it("assigns different slots to different services, including starts shifted by 15 minutes", () => {
    const result = choose([line("a"), line("b")], 1);
    expect(result.map((l) => l.slot?.startTime)).toEqual(["13:15", "13:30"]);
    expect(cartSequenceItems(result)).toEqual([
      { groupId: "a", slotId: "slot-1", quantity: 1 },
      { groupId: "b", slotId: "slot-2", quantity: 1 },
    ]);
  });

  it("expands group quantities into individual units and shows each group's range", () => {
    const result = choose([line("a", 2), line("b")]);
    expect(result[0].slot?.endTime).toBe("13:30");
    expect(result[1].slot?.startTime).toBe("13:30");
    expect(cartSequenceItems(result)?.map((i) => i.slotId)).toEqual(["slot-0", "slot-1", "slot-2"]);
    expect(cartSequenceItems(result)?.every((i) => i.quantity === 1)).toBe(true);
  });

  it("invalidates a plan when quantities or order change or a group is added", () => {
    const assigned = choose([line("a"), line("b")]);
    expect(cartSequenceItems([{ ...assigned[0], quantity: 2 }, assigned[1]])).toBeNull();
    expect(cartSequenceItems([...assigned, line("c")])).toBeNull();
    expect(cartSequenceItems([...assigned].reverse())).toBeNull();
  });

  it("rejects old shared-slot carts and incomplete or mismatched assignments", () => {
    expect(cartSequenceItems([{ ...line("a"), slot: slots[0] }])).toBeNull();
    expect(cartSequenceItems([])).toBeNull();
    const cart = [line("a"), line("b")];
    expect(assignConsecutiveCart(cart, slots[0])).toBeNull();
    const wrong = consecutiveOptions(slots, [{ groupId: "b", quantity: 2 }], 0)[0];
    expect(assignConsecutiveCart(cart, wrong)).toBeNull();
  });

  it("rejects a plan that reuses a slot for the second service", () => {
    const result = choose([line("a"), line("b")]);
    result[1].slot = { ...slots[0], assignments: [{ groupId: "b", slot: slots[0] }] };
    expect(cartSequenceItems(result)).toBeNull();
  });
});
