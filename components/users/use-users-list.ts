"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListUsersResult } from "@/lib/users/service";
import type { BulkAction, RoleFilter, StatusFilter } from "./types";

export interface FilterParams {
  search: string;
  status: StatusFilter;
  role: RoleFilter;
  page: number;
}

export interface UsersListState {
  currentUser: AuthUser;
  canManage: boolean;
  canWrite: boolean;
  search: string;
  setSearch: (value: string) => void;
  status: StatusFilter;
  setStatus: (value: StatusFilter) => void;
  role: RoleFilter;
  setRole: (value: RoleFilter) => void;
  page: number;
  setPage: (value: number | ((prev: number) => number)) => void;
  debouncedSearch: string;
  data: ListUsersResult;
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
  toggleUserSelection: (id: string) => void;
  togglePageSelection: () => void;
  selectFilteredResults: () => void;
  clearSelection: () => void;
  bulkAction: BulkAction;
  setBulkAction: (value: BulkAction) => void;
  bulkRole: string;
  setBulkRole: (value: string) => void;
  totalPages: number;
  from: number;
  to: number;
  statusSummary: string;
  selectionMode: boolean;
  setSelectionMode: (value: boolean) => void;
  toggleSelectionMode: () => void;
}

export function useUsersList(
  currentUser: AuthUser,
  initialData: ListUsersResult,
): UsersListState {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListUsersResult>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionScope, setSelectionScope] = useState<"page" | "filtered">(
    "page",
  );
  const [bulkAction, setBulkAction] = useState<BulkAction>("activate");
  const [bulkRole, setBulkRole] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const firstRun = useRef(true);

  const canManage = currentUser.permissions.includes("users.manage");
  const canWrite = currentUser.permissions.includes("users.write");

  const visibleIds = data.items
    .filter((item) => item.id !== currentUser.id)
    .map((item) => item.id);
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

  const toggleUserSelection = (id: string) => {
    if (id === currentUser.id) return;
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

  const load = useCallback(
    async (params: FilterParams) => {
      setIsLoading(true);
      setHasLoadFailed(false);
      try {
        const qs = new URLSearchParams({
          page: String(params.page),
          perPage: "10",
          status: params.status,
        });
        if (params.role !== "all") qs.set("role", params.role);
        if (params.search) qs.set("search", params.search);
        const response = await fetch(`/api/v1/users?${qs.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("load_failed");
        const payload = (await response.json()) as { data: ListUsersResult };
        setData(payload.data);
      } catch {
        setHasLoadFailed(true);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Debounce the search box.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // Refetch on filter/pagination changes (skip the initial server render).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    load({ search: debouncedSearch, status, role, page });
  }, [debouncedSearch, status, role, page, load]);

  const totalPages = data.totalPages;
  const from = data.total === 0 ? 0 : (page - 1) * data.perPage + 1;
  const to = Math.min(page * data.perPage, data.total);
  const statusSummary =
    status === "all"
      ? t("users.statusAll")
      : t(`users.status${status.charAt(0).toUpperCase()}${status.slice(1)}`);

  return {
    currentUser,
    canManage,
    canWrite,
    search,
    setSearch,
    status,
    setStatus,
    role,
    setRole,
    page,
    setPage,
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
    toggleUserSelection,
    togglePageSelection,
    selectFilteredResults,
    clearSelection,
    bulkAction,
    setBulkAction,
    bulkRole,
    setBulkRole,
    totalPages,
    from,
    to,
    statusSummary,
    selectionMode,
    setSelectionMode,
    toggleSelectionMode,
  };
}