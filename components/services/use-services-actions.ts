"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type {
  AdminService,
  AdminServiceCategory,
  AdminServiceGroup,
  ServiceCatalogSummary,
} from "@/lib/services/types";
import type {
  CategoryDialogState,
  DeleteTarget,
  GroupDialogState,
  ServiceDialogState,
} from "./types";
import type { ServicesListState } from "./use-services-list";

export interface ServicesActionsState {
  busyId: string | null;
  serviceDialog: ServiceDialogState;
  openCreateService: () => void;
  openEditService: (service: AdminService) => void;
  closeServiceDialog: () => void;
  groupDialog: GroupDialogState;
  openCreateGroup: () => void;
  openEditGroup: (group: AdminServiceGroup) => void;
  closeGroupDialog: () => void;
  categoryDialog: CategoryDialogState;
  openCreateCategory: () => void;
  openEditCategory: (category: AdminServiceCategory) => void;
  closeCategoryDialog: () => void;
  deleteTarget: DeleteTarget | null;
  requestDelete: (target: DeleteTarget) => void;
  closeDelete: () => void;
  confirmDelete: () => Promise<void>;
  summary: ServiceCatalogSummary;
  summaryLoading: boolean;
  summaryFailed: boolean;
  refreshSummary: () => Promise<void>;
  createService: (values: {
    categoryId: string;
    title: string;
    slug: string;
    shortDesc: string | null;
    fullDesc: string | null;
    price: number | null;
    priceType: "fixed" | "from" | "on_request";
    durationMin: number | null;
    sessionsCount: number;
    coverImage: string | null;
    isActive: boolean;
    isFeatured: boolean;
    displayOrder: number;
    images?: Array<{
      imageUrl: string;
      type: "before" | "after" | "gallery";
      displayOrder: number;
    }>;
    faqs?: Array<{ question: string; answer: string; displayOrder: number }>;
  }) => Promise<{ ok: boolean; errorCode?: string }>;
  updateService: (
    id: string,
    values: Parameters<ServicesActionsState["createService"]>[0],
  ) => Promise<{ ok: boolean; errorCode?: string }>;
  createGroup: (values: {
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    image: string | null;
    displayOrder: number;
    isActive: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
  }) => Promise<{ ok: boolean; errorCode?: string }>;
  updateGroup: (
    id: string,
    values: Parameters<ServicesActionsState["createGroup"]>[0],
  ) => Promise<{ ok: boolean; errorCode?: string }>;
  createCategory: (values: {
    groupId: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    image: string | null;
    displayOrder: number;
    isActive: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
  }) => Promise<{ ok: boolean; errorCode?: string }>;
  updateCategory: (
    id: string,
    values: Parameters<ServicesActionsState["createCategory"]>[0],
  ) => Promise<{ ok: boolean; errorCode?: string }>;
}

export function useServicesActions(
  list: ServicesListState,
  initialSummary: ServiceCatalogSummary,
): ServicesActionsState {
  const t = useTranslations();
  const { load, debouncedSearch, status, featured, categoryId, page } = list;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [serviceDialog, setServiceDialog] = useState<ServiceDialogState>(null);
  const [groupDialog, setGroupDialog] = useState<GroupDialogState>(null);
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialogState>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [summary, setSummary] = useState<ServiceCatalogSummary>(initialSummary);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryFailed, setSummaryFailed] = useState(false);

  const refresh = () =>
    load({ search: debouncedSearch, status, featured, categoryId, page });

  const refreshSummary = async () => {
    setSummaryLoading(true);
    setSummaryFailed(false);
    try {
      const response = await fetch("/api/v1/services/catalog", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("summary_failed");
      const payload = (await response.json()) as {
        data: ServiceCatalogSummary;
      };
      setSummary(payload.data);
    } catch {
      setSummaryFailed(true);
    } finally {
      setSummaryLoading(false);
    }
  };

  const extractError = async (
    response: Response,
  ): Promise<string | undefined> => {
    const payload = (await response.json().catch(() => null)) as {
      error?: { code?: string };
    } | null;
    return payload?.error?.code;
  };

  const handleSubmitError = async (response: Response) => {
    const code = await extractError(response);
    toast.error(
      code === "SLUG_TAKEN"
        ? t("servicesCatalog.errors.slugTaken")
        : t("servicesCatalog.errors.save"),
    );
    return { ok: false as const, errorCode: code };
  };

  const createService: ServicesActionsState["createService"] = async (
    values,
  ) => {
    setBusyId("new");
    const pendingToast = toast.loading(t("servicesCatalog.toasts.saving"));
    try {
      const response = await fetch("/api/v1/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!response.ok) return await handleSubmitError(response);
      await refresh();
      await refreshSummary();
      toast.success(t("servicesCatalog.toasts.created"), { id: pendingToast });
      return { ok: true };
    } catch {
      toast.error(t("servicesCatalog.errors.save"), { id: pendingToast });
      return { ok: false };
    } finally {
      setBusyId(null);
    }
  };

  const updateService: ServicesActionsState["updateService"] = async (
    id,
    values,
  ) => {
    setBusyId(id);
    const pendingToast = toast.loading(t("servicesCatalog.toasts.saving"));
    try {
      const response = await fetch(`/api/v1/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!response.ok) return await handleSubmitError(response);
      await refresh();
      await refreshSummary();
      toast.success(t("servicesCatalog.toasts.updated"), { id: pendingToast });
      return { ok: true };
    } catch {
      toast.error(t("servicesCatalog.errors.save"), { id: pendingToast });
      return { ok: false };
    } finally {
      setBusyId(null);
    }
  };

  const createGroup: ServicesActionsState["createGroup"] = async (values) => {
    setBusyId("new-group");
    const pendingToast = toast.loading(t("servicesCatalog.toasts.saving"));
    try {
      const response = await fetch("/api/v1/service-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!response.ok) return await handleSubmitError(response);
      await refreshSummary();
      toast.success(t("servicesCatalog.toasts.groupCreated"), {
        id: pendingToast,
      });
      return { ok: true };
    } catch {
      toast.error(t("servicesCatalog.errors.save"), { id: pendingToast });
      return { ok: false };
    } finally {
      setBusyId(null);
    }
  };

  const updateGroup: ServicesActionsState["updateGroup"] = async (
    id,
    values,
  ) => {
    setBusyId(id);
    const pendingToast = toast.loading(t("servicesCatalog.toasts.saving"));
    try {
      const response = await fetch(`/api/v1/service-groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!response.ok) return await handleSubmitError(response);
      await refreshSummary();
      toast.success(t("servicesCatalog.toasts.groupUpdated"), {
        id: pendingToast,
      });
      return { ok: true };
    } catch {
      toast.error(t("servicesCatalog.errors.save"), { id: pendingToast });
      return { ok: false };
    } finally {
      setBusyId(null);
    }
  };

  const createCategory: ServicesActionsState["createCategory"] = async (
    values,
  ) => {
    setBusyId("new-category");
    const pendingToast = toast.loading(t("servicesCatalog.toasts.saving"));
    try {
      const response = await fetch("/api/v1/service-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!response.ok) return await handleSubmitError(response);
      await refreshSummary();
      toast.success(t("servicesCatalog.toasts.categoryCreated"), {
        id: pendingToast,
      });
      return { ok: true };
    } catch {
      toast.error(t("servicesCatalog.errors.save"), { id: pendingToast });
      return { ok: false };
    } finally {
      setBusyId(null);
    }
  };

  const updateCategory: ServicesActionsState["updateCategory"] = async (
    id,
    values,
  ) => {
    setBusyId(id);
    const pendingToast = toast.loading(t("servicesCatalog.toasts.saving"));
    try {
      const response = await fetch(`/api/v1/service-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!response.ok) return await handleSubmitError(response);
      await refreshSummary();
      toast.success(t("servicesCatalog.toasts.categoryUpdated"), {
        id: pendingToast,
      });
      return { ok: true };
    } catch {
      toast.error(t("servicesCatalog.errors.save"), { id: pendingToast });
      return { ok: false };
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { kind, item } = deleteTarget;
    const base =
      kind === "service"
        ? `/api/v1/services/${item.id}`
        : kind === "group"
          ? `/api/v1/service-groups/${item.id}`
          : `/api/v1/service-categories/${item.id}`;
    setBusyId(item.id);
    const pendingToast = toast.loading(t("servicesCatalog.toasts.deleting"));
    try {
      const response = await fetch(base, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("delete_failed");
      setDeleteTarget(null);
      await refreshSummary();
      if (kind === "service") await refresh();
      toast.success(t("servicesCatalog.toasts.deleted"), {
        id: pendingToast,
      });
    } catch {
      toast.error(t("servicesCatalog.errors.delete"), { id: pendingToast });
    } finally {
      setBusyId(null);
    }
  };

  return {
    busyId,
    serviceDialog,
    openCreateService: () => setServiceDialog({ mode: "create" }),
    openEditService: (service) => setServiceDialog({ mode: "edit", service }),
    closeServiceDialog: () => setServiceDialog(null),
    groupDialog,
    openCreateGroup: () => setGroupDialog({ mode: "create" }),
    openEditGroup: (group) => setGroupDialog({ mode: "edit", group }),
    closeGroupDialog: () => setGroupDialog(null),
    categoryDialog,
    openCreateCategory: () => setCategoryDialog({ mode: "create" }),
    openEditCategory: (category) =>
      setCategoryDialog({ mode: "edit", category }),
    closeCategoryDialog: () => setCategoryDialog(null),
    deleteTarget,
    requestDelete: setDeleteTarget,
    closeDelete: () => setDeleteTarget(null),
    confirmDelete,
    summary,
    summaryLoading,
    summaryFailed,
    refreshSummary,
    createService,
    updateService,
    createGroup,
    updateGroup,
    createCategory,
    updateCategory,
  };
}
