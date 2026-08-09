"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListServicesResult } from "@/lib/services/types";
import type { FeaturedFilter, StatusFilter, TabKey } from "./types";

export interface ServicesFilterParams {
  search: string;
  status: StatusFilter;
  featured: FeaturedFilter;
  categoryId: string;
  page: number;
}

export interface ServicesListState {
  user: AuthUser;
  canWrite: boolean;
  canManage: boolean;
  tab: TabKey;
  setTab: (value: TabKey) => void;
  search: string;
  setSearch: (value: string) => void;
  status: StatusFilter;
  setStatus: (value: StatusFilter) => void;
  featured: FeaturedFilter;
  setFeatured: (value: FeaturedFilter) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  page: number;
  setPage: (value: number | ((prev: number) => number)) => void;
  debouncedSearch: string;
  data: ListServicesResult;
  isLoading: boolean;
  hasLoadFailed: boolean;
  load: (params: ServicesFilterParams) => Promise<void>;
  syncingIds: Set<string>;
  isSyncing: (id: string) => boolean;
  setSyncing: (id: string, syncing: boolean) => void;
  totalPages: number;
  from: number;
  to: number;
}

export function useServicesList(
  user: AuthUser,
  initialData: ListServicesResult,
): ServicesListState {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState<TabKey>("services");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [featured, setFeatured] = useState<FeaturedFilter>("all");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListServicesResult>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const firstRun = useRef(true);

  const canWrite = user.permissions.includes("services.write");
  const canManage = user.permissions.includes("services.manage");

  const setSyncing = (id: string, syncing: boolean) => {
    setSyncingIds((current) => {
      const next = new Set(current);
      if (syncing) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const isSyncing = (id: string) => syncingIds.has(id);

  const load = useCallback(async (params: ServicesFilterParams) => {
    setIsLoading(true);
    setHasLoadFailed(false);
    try {
      const qs = new URLSearchParams({
        page: String(params.page),
        perPage: "10",
        status: params.status,
        featured: params.featured,
      });
      if (params.categoryId) qs.set("categoryId", params.categoryId);
      if (params.search) qs.set("search", params.search);
      const response = await fetch(`/api/v1/services?${qs.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("load_failed");
      const payload = (await response.json()) as { data: ListServicesResult };
      setData(payload.data);
    } catch {
      setHasLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    void load({ search: debouncedSearch, status, featured, categoryId, page });
  }, [debouncedSearch, status, featured, categoryId, page, load]);

  const totalPages = data.totalPages;
  const from = data.total === 0 ? 0 : (page - 1) * data.perPage + 1;
  const to = Math.min(page * data.perPage, data.total);

  return {
    user,
    canWrite,
    canManage,
    tab,
    setTab,
    search,
    setSearch,
    status,
    setStatus,
    featured,
    setFeatured,
    categoryId,
    setCategoryId,
    page,
    setPage,
    debouncedSearch,
    data,
    isLoading,
    hasLoadFailed,
    load,
    syncingIds,
    isSyncing,
    setSyncing,
    totalPages,
    from,
    to,
  };
}
