/** One selected service unit consumes one whole slot, then the next begins. */
export type ServiceSlotRequest = { groupId: string; quantity: number };

export type ConsecutiveSlot = {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  groupIds: string[];
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  available: boolean;
};

export type SlotAssignment<S = ConsecutiveSlot> = { groupId: string; slot: S };
export type ConsecutiveOption<S> = S & { assignments: SlotAssignment<S>[] };

function seconds(time: string): number {
  const [h, m, s = 0] = time.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export function areAdjacentSlots(
  previous: Pick<ConsecutiveSlot, "id" | "slotDate" | "endTime">,
  next: Pick<ConsecutiveSlot, "id" | "slotDate" | "startTime">,
): boolean {
  return previous.id !== next.id && previous.slotDate === next.slotDate &&
    seconds(previous.endTime) === seconds(next.startTime);
}

/** Sliding starts, not disjoint chunks: two services can start at 13:00 OR
 * 13:15 when both have enough free, contiguous time after them. Each slot
 * needs only one free seat, even when several services are selected. */
export function consecutiveOptions<S extends ConsecutiveSlot>(
  rows: readonly S[],
  requests: readonly ServiceSlotRequest[],
  now = Date.now(),
): ConsecutiveOption<S>[] {
  if (requests.length === 0 || requests.some((r) => !Number.isInteger(r.quantity) || r.quantity < 1)) return [];
  const count = requests.reduce((total, r) => total + r.quantity, 0);
  if (count > 100) return [];
  const groups = requests.flatMap((r) => Array.from({ length: r.quantity }, () => r.groupId));
  const usable = rows.filter((s) => s.isActive && s.available && s.capacity > s.bookedCount &&
    seconds(s.endTime) > seconds(s.startTime) &&
    new Date(`${s.slotDate}T${s.startTime}`).getTime() > now);
  const byStart = new Map(usable.map((s) => [`${s.slotDate}|${seconds(s.startTime)}`, s]));
  const result: ConsecutiveOption<S>[] = [];
  for (const first of usable) {
    const assignments: SlotAssignment<S>[] = [];
    let slot: S | undefined = first;
    for (const groupId of groups) {
      if (!slot || (slot.groupIds.length > 0 && !slot.groupIds.includes(groupId))) break;
      assignments.push({ groupId, slot });
      slot = byStart.get(`${slot.slotDate}|${seconds(slot.endTime)}`);
    }
    if (assignments.length === groups.length) result.push({ ...first, assignments });
  }
  return result.sort((a, b) => a.slotDate.localeCompare(b.slotDate) || seconds(a.startTime) - seconds(b.startTime));
}
