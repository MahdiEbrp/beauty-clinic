"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { msgKey, type MessageKey } from "@/src/i18n/message-key";
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

/**
 * A relative timestamp rendered only on the client (the panel only opens after
 * a user interaction), so the locale-aware formatter never causes a hydration
 * mismatch.
 */
function relativeTimeLabel(
  format: ReturnType<typeof useFormatter>,
  dateStr: string,
): string {
  return format.relativeTime(new Date(dateStr), new Date());
}

/** Entity types that ship a full localized sentence under notifications.labels. */
const LABELED_ENTITY_TYPES = new Set([
  "booking",
  "email_provider",
  "service",
  "service_category",
  "service_group",
  "setting",
  "sms_provider",
  "user",
]);

/**
 * Localized sentence for a notification. Uses the per-(entityType, action)
 * template when one exists, then falls back to the generic action word so
 * legacy or unlabeled rows still read correctly in the active locale.
 */
function notificationLabel(
  t: (key: MessageKey) => string,
  entityType: string,
  action: string,
): string {
  if (LABELED_ENTITY_TYPES.has(entityType)) {
    const labelKey = msgKey(`notifications.labels.${entityType}.${action}`);
    const label = t(labelKey);
    if (label !== labelKey) return label;
  }
  const actionKey = msgKey(`notifications.actions.${action}`);
  const actionText = t(actionKey);
  return actionText === actionKey ? entityType : actionText;
}

export function NotificationDropdown({
  open,
  onCountChange,
}: {
  open: boolean;
  onCountChange?: (count: number) => void;
}) {
  const t = useTranslations();
  const format = useFormatter();
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
                    {notificationLabel(t, n.entityType, n.action)}
                  </p>
                  <p className="text-dash-caption text-content-tertiary">
                    {relativeTimeLabel(format, n.createdAt)}
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
