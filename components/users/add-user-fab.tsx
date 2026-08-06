"use client";

import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { useUsers } from "./users-context";

export function AddUserFab() {
  const t = useTranslations();
  const { canWrite, setAddOpen, setAddError } = useUsers();

  if (!canWrite) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed bottom-4 end-4 z-40 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          type="button"
          onClick={() => {
            setAddError(null);
            setAddOpen(true);
          }}
          className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-4 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <UserPlus className="size-5" aria-hidden="true" />
          <span>{t("users.addShort")}</span>
        </button>
      </div>
      <div aria-hidden="true" className="h-24 md:hidden" />
    </>
  );
}
