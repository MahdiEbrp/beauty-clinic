"use client";

import { useEffect, useState } from "react";

import type { GroupOption } from "../bookings/group-multi-select";

/**
 * Loads the active service groups once for a slot editor. Shared by the
 * working-hours day form and the dedicated per-day slot editor so the fetch
 * lives in a single place.
 */
export function useSlotGroups(): {
  groups: GroupOption[];
  groupsLoading: boolean;
} {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/service-groups?perPage=100&status=active", {
          credentials: "include",
        });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          data: { items: Array<{ id: string; name: string }> };
        };
        if (active) {
          setGroups(payload.data.items.map((item) => ({ id: item.id, title: item.name })));
        }
      } catch {
        // The group list is optional; patterns still save without it.
      } finally {
        if (active) setGroupsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { groups, groupsLoading };
}
