"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  AtSign,
  ExternalLink,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStaleFetch } from "@/lib/hooks/use-stale-fetch";
import type { AdminSocialLink } from "@/lib/social/admin";
import { SocialLinkDialog } from "../create-social/SocialLinkDialog";

export function SocialSection({
  searchTerm,
  initialData,
}: {
  searchTerm: string;
  initialData: AdminSocialLink[];
}) {
  const t = useTranslations("socialAdmin");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminSocialLink | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSocialLink | null>(null);

  const {
    data: links,
    isValidating,
    hasLoadFailed,
    revalidate,
  } = useStaleFetch<AdminSocialLink[]>({
    key: "socialLinks:all",
    staleTime: 60_000,
    fetcher: async () => {
      const qs = new URLSearchParams({ page: "1", perPage: "50", status: "all" });
      const response = await fetch(`/api/v1/admin/social-links?${qs.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("load_failed");
      const payload = (await response.json()) as { data: { items: AdminSocialLink[] } };
      return payload.data.items;
    },
    initialData,
  });

  const visibleLinks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return links ?? [];
    return (links ?? []).filter((link) =>
      [link.labelFa, link.labelEn, link.url, link.imageUrl ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [links, searchTerm]);

  const runAction = async (target: AdminSocialLink, patch: { isActive?: boolean }, method: "PATCH" | "DELETE") => {
    setBusyId(target.id);
    setConfirmDelete(null);
    try {
      const response = await fetch(`/api/v1/admin/social-links/${target.id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: method === "DELETE" ? undefined : JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("action_failed");
      await revalidate();
      toast.success(t(method === "DELETE" ? "toast.deleted" : "toast.success"));
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setBusyId(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (link: AdminSocialLink) => {
    setEditing(link);
    setDialogOpen(true);
  };

  return (
    <section aria-label={t("heading")} className="border-t border-border-primary pt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-dash-body font-bold text-content-primary">{t("heading")}</h3>
          <p className="mt-0.5 text-dash-caption text-content-secondary">{t("resultsLabel")}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-2 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("add")}
        </button>
      </div>

      {isValidating && !links && (
        <div className="grid gap-2">
          {[0, 1].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-card border border-border-primary bg-surface-tertiary/60" />
          ))}
        </div>
      )}

      {hasLoadFailed && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-error/30 bg-error/5 p-6 text-center">
          <AlertTriangle className="size-6 text-error" aria-hidden="true" />
          <div>
            <p className="text-dash-body font-bold text-error">{t("errorTitle")}</p>
            <p className="mt-1 text-dash-body-sm text-content-secondary">{t("errorDescription")}</p>
          </div>
          <button
            type="button"
            onClick={() => void revalidate()}
            className="inline-flex min-h-11 items-center justify-center rounded-pill border border-accent px-5 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {!hasLoadFailed && !isValidating && visibleLinks.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border-primary bg-surface-tertiary/40 p-8 text-center">
          <AtSign className="size-7 text-content-tertiary" aria-hidden="true" />
          <p className="text-dash-body font-bold text-content-primary">{t("empty")}</p>
          {searchTerm.trim() && <p className="text-dash-caption text-content-secondary">{t("emptySearch")}</p>}
        </div>
      )}

      {visibleLinks.length > 0 && (
        <ul className="grid gap-2">
          {visibleLinks.map((link) => {
            const disabled = busyId != null;
            const isBusy = busyId === link.id;
            return (
              <li
                key={link.id}
                className={`flex items-center gap-3 rounded-card border border-border-primary bg-surface-primary p-3 transition-opacity sm:p-3.5 ${isBusy ? "opacity-60" : ""}`}
              >
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border-primary bg-surface-tertiary text-copper">
                  {link.imageUrl ? (
                    <img src={link.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <AtSign className="size-5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-dash-body font-bold text-content-primary">{link.labelFa}</p>
                    {!link.isActive && (
                      <span className="rounded-pill border border-border-primary bg-surface-tertiary px-2 py-0.5 text-dash-caption font-bold text-content-secondary">
                        {t("statuses.inactive")}
                      </span>
                    )}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="mt-0.5 inline-flex items-center gap-1 truncate text-start text-dash-caption text-content-secondary transition-colors hover:text-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{link.url}</span>
                  </a>
                </div>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={t("actions.menu")}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
                    >
                      {isBusy ? (
                        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                      ) : (
                        <MoreVertical className="size-5" aria-hidden="true" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={disabled}
                      onSelect={() => openEdit(link)}
                      className="text-accent focus:bg-surface-tertiary focus:text-accent"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      <span>{t("actions.edit")}</span>
                    </DropdownMenuItem>
                    {link.isActive ? (
                      <DropdownMenuItem
                        disabled={disabled}
                        onSelect={() => void runAction(link, { isActive: false }, "PATCH")}
                        className="text-accent focus:bg-surface-tertiary focus:text-accent"
                      >
                        <PowerOff className="size-4" aria-hidden="true" />
                        <span>{t("actions.deactivate")}</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        disabled={disabled}
                        onSelect={() => void runAction(link, { isActive: true }, "PATCH")}
                        className="text-accent focus:bg-surface-tertiary focus:text-accent"
                      >
                        <Power className="size-4" aria-hidden="true" />
                        <span>{t("actions.activate")}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={disabled}
                      onSelect={() => setConfirmDelete(link)}
                      className="text-error focus:bg-error/10 focus:text-error"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      <span>{t("actions.delete")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      )}

      {(dialogOpen || editing != null) && (
        <SocialLinkDialog
          link={editing ?? undefined}
          onOpenChange={(open) => {
            if (!open) {
              setDialogOpen(false);
              setEditing(null);
            }
          }}
          onSaved={() => {
            setDialogOpen(false);
            setEditing(null);
            void revalidate();
          }}
        />
      )}

      <AlertDialog open={confirmDelete != null} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("actions.deleteConfirm", { name: confirmDelete?.labelFa ?? "" })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("bulk.confirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) void runAction(confirmDelete, {}, "DELETE");
              }}
              className="bg-error text-content-contrast hover:bg-error-hover"
            >
              {t("dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}