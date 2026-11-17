"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { GroupOption } from "./group-select-step";

export function useReservationOptions(
  slotDate: string,
  setSlotIds: Dispatch<SetStateAction<string[]>>,
) {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [slots, setSlots] = useState<Array<{ id: string; label: string }>>([]);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/service-groups?perPage=100&status=active", {
          credentials: "include",
        });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          data: {
            items: Array<{ id: string; name: string }>;
          };
        };
        if (active) {
          setGroups(payload.data.items.map((item) => ({ id: item.id, name: item.name })));
        }
      } catch {
        // optional
      } finally {
        if (active) setGroupsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Fetch all available slots for the selected date (no group filter — user picks which slot goes to which service).
  useEffect(() => {
    if (!slotDate) return;
    let active = true;
    void (async () => {
      try {
        const params = new URLSearchParams({ date: slotDate });
        const res = await fetch(`/api/public/slots?${params.toString()}`);
        if (!res.ok) return;
        const payload = (await res.json()) as {
          data: Array<{ id: string; startTime: string; endTime: string }>;
        };
        if (!active) return;
        setSlots(
          payload.data.map((slot) => ({
            id: slot.id,
            label: `${slot.startTime} – ${slot.endTime}`,
          })),
        );
        // Keep only selected slots that still exist.
        setSlotIds((prev) => prev.filter((id) => payload.data.some((s) => s.id === id)));
      } catch {
        if (active) setSlots([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [slotDate, setSlotIds]);

  return { groups, groupsLoading, slots };
}
