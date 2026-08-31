"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { msgKey } from "@/src/i18n/message-key";
import {
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  Shield,
  User,
} from "lucide-react";

type Notification = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  meta: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
};

const ENTITY_ICONS: Record<string, typeof Bell> = {
  booking: Calendar,
  user: User,
  service: FileText,
  service_category: FileText,
  service_group: FileText,
  sms_provider: CreditCard,
  sms_template: FileText,
  setting: Settings,
  role: Shield,
};

function relativeTime(dateStr: string, locale: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (locale === "fa") {
    if (diffSec < 60) return "همین الان";
    if (diffMin < 60) return `${diffMin} دقیقه پیش`;
    if (diffHr < 24) return `${diffHr} ساعت پیش`;
    return `${diffDay} روز پیش`;
  }
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export function NotificationDropdown({
  open,
  onCountChange,
}: {
  open: boolean;
  onCountChange?: (count: number) => void;
}) {
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const json = await res.json() as { data: { items: Notification[]; unreadCount: number } };
        setNotifications(json.data.items);
        setUnreadCount(json.data.unreadCount);
        onCountChange?.(json.data.unreadCount);
      }
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  const markAllRead = useCallback(async () => {
    try {
      await fetch("/api/v1/notifications/read", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onCountChange?.(0);
    } catch {}
  }, [onCountChange]);

  const openNotifications = useCallback(async () => {
    await fetchNotifications();
    await markAllRead();
  }, [fetchNotifications, markAllRead]);

  useEffect(() => {
    if (open && !fetchedRef.current) {
      fetchedRef.current = true;
      void openNotifications();
    }
    if (!open) {
      fetchedRef.current = false;
    }
  }, [open, openNotifications]);

  const handleMarkAllRead = useCallback(() => {
    void markAllRead();
  }, [markAllRead]);

  if (!open) return null;

  return (
    <div className="absolute inset-e-0 top-12 z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-card border border-border-primary bg-surface-secondary shadow-elevation-3">
      <div className="flex items-center justify-between border-b border-border-primary px-4 py-3">
        <span className="text-dash-body-sm font-bold text-content-primary">
          {t("dashboard.topbar.notifications")}
        </span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-dash-caption text-accent transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("dashboard.topbar.markAllRead")}
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-5 animate-spin rounded-full border-2 border-border-primary border-t-accent" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => {
            const Icon = ENTITY_ICONS[n.entityType] ?? Bell;
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 border-b border-border-primary px-4 py-3 last:border-b-0"
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-tertiary">
                  <Icon className="size-4 text-content-secondary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-dash-body-sm text-content-primary">
                    {n.entityLabel}
                  </p>
                  <p className="text-dash-caption text-content-tertiary">
                    {t(msgKey(`notifications.actions.${n.action}`))} ·{" "}
                    {relativeTime(n.createdAt, "fa")}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-accent" />
                )}
              </div>
            );
          })
        ) : (
          <p className="px-4 py-8 text-center text-dash-caption text-content-tertiary">
            {t("dashboard.topbar.noNotifications")}
          </p>
        )}
      </div>
    </div>
  );
}
