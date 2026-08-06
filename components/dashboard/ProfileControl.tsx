"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, LogOut } from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import { initials } from "@/lib/utils";

export function ProfileControl({
  user,
  loggingOut,
  onLogout,
}: {
  user: AuthUser;
  loggingOut: boolean;
  onLogout: () => void;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!profileRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={profileRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("dashboard.topbar.openProfile")}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border-primary bg-accent-subtle text-dash-caption font-bold text-accent shadow-elevation-1 transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {initials(user.fullName)}
      </button>
      {open && (
        <div className="absolute inset-e-0 top-12 z-50 w-64 max-w-[calc(100vw-1.5rem)] rounded-card border border-border-primary bg-surface-secondary p-2 shadow-elevation-3">
          <div className="border-b border-border-primary px-3 pb-3 pt-2">
            <p className="truncate text-dash-body-sm font-bold text-accent">
              {user.fullName}
            </p>
            <p
              className="mt-1 truncate text-dash-caption text-content-tertiary"
              dir="ltr"
            >
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-control px-3 text-start text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <LogOut className="size-4" aria-hidden="true" />
            )}
            <span>
              {loggingOut
                ? t("dashboard.sidebar.loggingOut")
                : t("dashboard.sidebar.logout")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
