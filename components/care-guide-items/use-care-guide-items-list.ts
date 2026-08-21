"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListCareGuideItemsResult } from "@/lib/services/care-guides-types";
import type { BulkAction, StatusFilter } from "./types";

export interface FilterParams {
  search: string;
  status: StatusFilter;
  page: number;
  guideId: string;
}

export interface CareGuideItemsListState {
  currentUser: AuthUser;
  canManage: boolean;
  canWrite: boolean;
  search: string;
  setSearch: (value: string) => void;
  status: StatusFilter;
  setStatus: (value: StatusFilter) => void;
  page: number;
  setPage: (value: number | ((prev: number) => number)) => void;
  guideId: string;
  setGuideId: (value: string) => void;
  debouncedSearch: string;
  data: ListCareGuideItemsResult;
  isLoading: boolean;
  hasLoadFailed: boolean;
  load: (params: FilterParams) => Promise<void>;
  visibleIds: string[];
  selectedIds: string[];
  setSelectedIds: (value: string[]) => void;
  selectionScope: "page" | "filtered";
  setSelectionScope: (value: "page" | "filtered") => void;
  selectedVisibleCount: number;
  allVisibleSelected: boolean;
  selectAllRef: React.RefObject<HTMLInputElement | null>;
  toggleItemSelection: (id: string) => void;
  togglePageSelection: () => void;
  selectFilteredResults: () => void;
  clearSelection: () => void;
  bulkAction: BulkAction;
  setBulkAction: (value: BulkAction) => void;
  totalPages: number;
  from: number;
  to: number;
  selectionMode: boolean;
  setSelectionMode: (value: boolean) => void;
  toggleSelectionMode: () => void;
}

export function useCareGuideItemsList(
  currentUser: AuthUser,
  initialData: ListCareGuideItemsResult,
  options: { guideId?: string } = {},
): CareGuideItemsListState {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [guideId, setGuideId] = useState(options.guideId ?? "");
  const [data, setData] = useState<ListCareGuideItemsResult>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionScope, setSelectionScope] = useState<"page" | "filtered">(
    "page",
  );
  const [bulkAction, setBulkAction] = useState<BulkAction>("activate");
  const [selectionMode, setSelectionMode] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const firstRun = useRef(true);

  const canManage = currentUser.permissions.includes("care-guides.manage");
  const canWrite = currentUser.permissions.includes("care-guides.write");

  const visibleIds = data.items.map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate =
      selectedVisibleCount > 0 && !allVisibleSelected;
  }, [selectedVisibleCount, allVisibleSelected]);

  const toggleItemSelection = (id: string) => {
    setSelectionScope("page");
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const togglePageSelection = () => {
    setSelectionScope("page");
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };

  const selectFilteredResults = () => {
    setSelectionScope("filtered");
    setSelectedIds(visibleIds);
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectionScope("page");
  };

  const toggleSelectionMode = () => {
    if (selectionMode) clearSelection();
    setSelectionMode(!selectionMode);
  };

  const load = useCallback(async (params: FilterParams) => {
    setIsLoading(true);
    setHasLoadFailed(false);
    try {
      const qs = new URLSearchParams({
        page: String(params.page),
        perPage: "10",
        status: params.status,
      });
      if (params.search) qs.set("search", params.search);
      if (params.guideId) qs.set("guideId", params.guideId);
      const response = await fetch(`/api/v1/care-guide-items?${qs.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("load_failed");
      const payload = (await response.json()) as {
        data: ListCareGuideItemsResult;
      };
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
    void load({ search: debouncedSearch, status, page, guideId });
  }, [debouncedSearch, status, page, guideId, load]);

  const totalPages = data.totalPages;
  const from = data.total === 0 ? 0 : (page - 1) * data.perPage + 1;
  const to = Math.min(page * data.perPage, data.total);

  return {
    currentUser,
    canManage,
    canWrite,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    guideId,
    setGuideId,
    debouncedSearch,
    data,
    isLoading,
    hasLoadFailed,
    load,
    visibleIds,
    selectedIds,
    setSelectedIds,
    selectionScope,
    setSelectionScope,
    selectedVisibleCount,
    allVisibleSelected,
    selectAllRef,
    toggleItemSelection,
    togglePageSelection,
    selectFilteredResults,
    clearSelection,
    bulkAction,
    setBulkAction,
    totalPages,
    from,
    to,
    selectionMode,
    setSelectionMode,
    toggleSelectionMode,
  };
}
