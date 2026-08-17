"use client";

import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import {
  LogOut,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import type { AuthUser, ActiveSession } from "@/lib/auth/dal";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DashboardContentProps {
  user: AuthUser;
  sessions: ActiveSession[];
  currentSessionId: string;
}

function DeviceIcon({ kind }: { kind: ActiveSession["deviceKind"] }) {
  if (kind === "mobile") return <Smartphone className="w-5 h-5" strokeWidth={2} aria-hidden="true" />;
  if (kind === "tablet") return <Tablet className="w-5 h-5" strokeWidth={2} aria-hidden="true" />;
  if (kind === "desktop") return <Monitor className="w-5 h-5" strokeWidth={2} aria-hidden="true" />;
  return <Laptop className="w-5 h-5" strokeWidth={2} aria-hidden="true" />;
}

export default function DashboardContent({
  user,
  sessions,
  currentSessionId,
}: DashboardContentProps) {
  const t = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const handleRevokeOthers = async () => {
    setRevoking(true);
    setRevokeError(null);
    try {
      const response = await fetch("/api/v1/auth/sessions", { method: "DELETE" });
      if (!response.ok) {
        throw new Error("revoke_failed");
      }
      setConfirmOpen(false);
      router.refresh();
    } catch {
      setRevokeError(t("dashboard.sessions.revokeError"));
    } finally {
      setRevoking(false);
    }
  };

  const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

  const dateTime = (date: Date) =>
    format.dateTime(date, { dateStyle: "medium", timeStyle: "short" });

  const roleLabel = (role: string) =>
    t.has(`users.roles.${role}`) ? t(`users.roles.${role}`) : role;

  return (
    <div className="grid gap-8">
      <div className="bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-2 p-8 sm:p-10 relative overflow-hidden">
        {/* Breath mark — the one decorative moment on this surface. Decorative
            only; the reduced-motion blanket rule fast-forwards the pulse. */}
        <div className="relative w-16 h-16 mb-8" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-copper/15 animate-breath" />
          <span className="absolute inset-0 rounded-full border border-copper/40" />
          <span className="absolute inset-2 rounded-full bg-surface-tertiary border border-border-primary flex items-center justify-center">
            <BrandLogo alt="" className="h-6" />
          </span>
        </div>

        <p className="text-dash-caption font-bold uppercase tracking-wider text-copper-strong mb-3">
          {t("dashboard.eyebrow")}
        </p>
        <h1 className="text-dash-display font-bold text-accent mb-2">
          {t("dashboard.hello", { name: user.fullName })}
        </h1>
        <p className="text-dash-body-sm text-content-tertiary" dir="ltr">
          {user.email}
        </p>

        {user.roles.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-3 py-1 bg-accent-subtle text-accent border border-border-primary rounded-pill text-dash-caption font-bold"
              >
                {roleLabel(role)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-2 p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck
            className="w-6 h-6 text-copper shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
          <h2 className="text-dash-title font-bold text-accent">
            {t("dashboard.sessions.heading")}
          </h2>
        </div>
        <p className="text-dash-body-sm text-content-secondary mb-8">
          {t("dashboard.sessions.description")}
        </p>

        <ul className="divide-y divide-border-primary">
          {sessions.map((session) => {
            const isCurrent = session.id === currentSessionId;
            return (
              <li
                key={session.id}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="w-11 h-11 shrink-0 bg-surface-tertiary text-content-secondary rounded-control flex items-center justify-center border border-border-primary">
                  <DeviceIcon kind={session.deviceKind} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-dash-body font-semibold text-accent">
                    <span className="truncate">
                      {session.device || t("dashboard.sessions.unknownDevice")}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-accent-subtle text-accent rounded-pill text-dash-caption font-bold whitespace-nowrap">
                        {t("dashboard.sessions.thisDevice")}
                      </span>
                    )}
                  </p>
                  <p className="text-dash-body-sm text-content-tertiary mt-1">
                    {session.ip && (
                      <span dir="ltr" className="inline-block">
                        {t("dashboard.sessions.ipLabel", { ip: session.ip })}
                        <span className="mx-2 text-border-interactive" aria-hidden="true">
                          ·
                        </span>
                      </span>
                    )}
                    {t.rich("dashboard.sessions.lastSeen", {
                      date: (chunks) => {
                        void chunks;
                        return <RelativeTime key="last-seen" value={session.lastSeenAt} />;
                      },
                    })}
                  </p>
                  <p className="text-dash-caption text-content-tertiary mt-0.5">
                    {t("dashboard.sessions.signedIn", {
                      date: dateTime(session.createdAt),
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {revokeError && (
          <div
            role="alert"
            className="mt-6 bg-error/10 border border-error/40 rounded-control p-4 text-dash-body-sm text-error font-medium"
          >
            {revokeError}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-border-primary">
          {otherSessions.length > 0 ? (
            <Dialog
              open={confirmOpen}
              onOpenChange={(open) => {
                setConfirmOpen(open);
                if (open) setRevokeError(null);
              }}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-12 text-dash-body-sm bg-transparent border border-border-interactive text-accent rounded-pill font-bold transition-all duration-200 hover:bg-surface-tertiary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
                >
                  <LogOut className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
                  <span>{t("dashboard.sessions.revokeOthers")}</span>
                </button>
              </DialogTrigger>
              <DialogContent
                closeLabel={t("dashboard.sessions.cancel")}
                className="max-w-md"
              >
                <DialogHeader>
                  <DialogTitle className="text-accent text-dash-heading">
                    {t("dashboard.sessions.revokeTitle")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("dashboard.sessions.revokeDescription")}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <DialogClose
                    disabled={revoking}
                    className="inline-flex items-center justify-center px-6 py-3 min-h-11 text-dash-body-sm bg-surface-tertiary text-accent rounded-pill font-semibold transition-colors hover:bg-surface-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
                  >
                    {t("dashboard.sessions.cancel")}
                  </DialogClose>
                  <button
                    type="button"
                    onClick={() => void handleRevokeOthers()}
                    disabled={revoking}
                    aria-busy={revoking}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-11 text-dash-body-sm bg-accent text-content-contrast rounded-pill font-bold transition-all duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 disabled:opacity-60"
                  >
                    {revoking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" />
                        <span>{t("dashboard.sessions.revokingOthers")}</span>
                      </>
                    ) : (
                      <span>{t("dashboard.sessions.confirm")}</span>
                    )}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="text-dash-body-sm text-content-tertiary">
              {t("dashboard.sessions.noOthers")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
