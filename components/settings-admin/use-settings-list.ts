"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { AdminSetting } from "@/lib/settings/admin";
import type { SettingStatusFilter } from "@/lib/validation/settings-admin";

export interface FilterParams {
  search: string;
  status: SettingStatusFilter;
}

export interface SettingsListState {
  currentUser: AuthUser;
  canManage: boolean;
  canWrite: boolean;
  search: string;
  setSearch: (value: string) => void;
  status: SettingStatusFilter;
  setStatus: (value: SettingStatusFilter) => void;
  debouncedSearch: string;
  items: AdminSetting[];
  total: number;
  isLoading: boolean;
  hasLoadFailed: boolean;
  load: (params: FilterParams) => Promise<void>;
  refresh: () => Promise<void>;
}

const PER_PAGE = 50;

export function useSettingsList(
  currentUser: AuthUser,
  initialItems: AdminSetting[],
): SettingsListState {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<SettingStatusFilter>("all");
  const [items, setItems] = useState<AdminSetting[]>(initialItems);
  const [total, setTotal] = useState(initialItems.length);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const firstRun = useRef(true);

  const canManage = currentUser.permissions.includes("settings.manage");
  const canWrite = currentUser.permissions.includes("settings.write");

  const load = useCallback(async ({ search: term, status: filter }: FilterParams) => {
    setIsLoading(true);
    setHasLoadFailed(false);
    try {
      const qs = new URLSearchParams({ page: "1", perPage: String(PER_PAGE), status: filter });
      if (term) qs.set("search", term);
      const response = await fetch(`/api/v1/admin/settings?${qs.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("load_failed");
      const payload = (await response.json()) as { data: { items: AdminSetting[]; total: number } };
      setItems(payload.data.items);
      setTotal(payload.data.total);
    } catch {
      setHasLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(
    () => load({ search: debouncedSearch, status }),
    [load, debouncedSearch, status],
  );

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    void load({ search: debouncedSearch, status });
  }, [debouncedSearch, status, load]);

  return {
    currentUser,
    canManage,
    canWrite,
    search,
    setSearch,
    status,
    setStatus,
    debouncedSearch,
    items,
    total,
    isLoading,
    hasLoadFailed,
    load,
    refresh,
  };
}