import type { CartItem, SlotOption } from "@/components/booking/types";
import { areAdjacentSlots } from "./consecutive-slots";

/** Apply only complete plans. Each cart line displays its own first-to-last
 * time range; the payload retains each unit's real slot ID separately. */
export function assignConsecutiveCart(cart: CartItem[], start: SlotOption): CartItem[] | null {
  const plan = start.assignments;
  if (!plan) return null;
  let offset = 0;
  const result: CartItem[] = [];
  for (const line of cart) {
    const assignments = plan.slice(offset, offset + line.quantity);
    if (assignments.length !== line.quantity || assignments.some((a) => a.groupId !== line.group.id)) return null;
    const first = assignments[0]?.slot;
    const last = assignments.at(-1)?.slot;
    if (!first || !last) return null;
    result.push({ ...line, slot: { ...first, endTime: last.endTime, assignments } });
    offset += line.quantity;
  }
  return offset === plan.length && cartSequenceItems(result) ? result : null;
}

/** Reject old shared-slot carts and invalidate plans when groups/quantities
 * change. Old localStorage data must not silently book only the first unit. */
export function cartSequenceItems(cart: CartItem[]) {
  if (cart.length === 0) return null;
  const units = cart.flatMap((line) => line.slot?.assignments ?? []);
  let offset = 0;
  for (const line of cart) {
    const plan = line.slot?.assignments;
    if (!plan || plan.length !== line.quantity || plan.some((a) => a.groupId !== line.group.id)) return null;
    if (line.slot?.id !== plan[0]?.slot.id) return null;
    offset += plan.length;
  }
  if (offset === 0) return null;
  const seen = new Set<string>();
  for (const [index, unit] of units.entries()) {
    if (seen.has(unit.slot.id) || (index > 0 && !areAdjacentSlots(units[index - 1].slot, unit.slot))) return null;
    seen.add(unit.slot.id);
  }
  return units.map(({ groupId, slot }) => ({ groupId, slotId: slot.id, quantity: 1 }));
}
