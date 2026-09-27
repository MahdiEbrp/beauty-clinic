import "server-only";

import { and, gte, inArray, isNotNull, isNull, lte } from "drizzle-orm";
import { format as formatJalali } from "date-fns-jalali";

import { getApiTranslations } from "@/lib/i18n/api-translations";
import { logError, logInfo } from "@/lib/log";
import { createSmsProviderAdapter } from "@/lib/sms/providers";
import { getSmsProviderForUse } from "@/lib/sms/provider-service";
import { normalizeIranianPhone } from "@/lib/sms/phone";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import type { Locale } from "@/lib/services/types";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema";

/**
 * Sends the pre-appointment reminder SMS.
 *
 * Runs from the cron scheduler every 15 minutes: finds paid/waiting bookings
 * whose slot starts within the configured lead window and that have not been
 * reminded yet, sends one SMS per order (`groupRef`) to the customer, then
 * stamps `reminder_sent_at` so a booking is only reminded once.
 *
 * Never throws — the caller (cron) must keep running even if the SMS provider
 * or database is briefly unavailable.
 */
const DEFAULT_LEAD_HOURS = 24;
const MIN_LEAD_HOURS = 1;
const MAX_LEAD_HOURS = 168;

export type ReminderTickResult = { candidates: number; sent: number };

export async function sendUpcomingReminders(): Promise<ReminderTickResult> {
  try {
    const settings = await loadSystemSettingsMap();
    if (settings.get("booking.reminder_sms") === false) {
      return { candidates: 0, sent: 0 };
    }

    const leadHours = clampLeadHours(settings.get("booking.reminder_hours"));
    const now = new Date();
    const until = new Date(now.getTime() + leadHours * 60 * 60 * 1000);

    const rows = await db
      .select()
      .from(bookings)
      .where(
        and(
          inArray(bookings.status, ["paid", "waiting"]),
          isNull(bookings.reminderSentAt),
          isNotNull(bookings.slotStart),
          gte(bookings.slotStart, now),
          lte(bookings.slotStart, until),
        ),
      );

    if (rows.length === 0) return { candidates: 0, sent: 0 };

    // One SMS per order (multiple group lines share a `groupRef`).
    const byRef = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = byRef.get(row.groupRef) ?? [];
      list.push(row);
      byRef.set(row.groupRef, list);
    }

    const clinicName = String(settings.get("clinic.name") ?? "Nafas");
    const clinicPhone = String(settings.get("contact.phone") ?? "");
    const sentIds: string[] = [];
    let sent = 0;

    for (const [groupRef, groupRows] of byRef) {
      const first = groupRows[0];
      const phone = normalizeIranianPhone(first.phone);
      if (!phone) continue;

      const locale = "fa" as Locale;
      const t = await getApiTranslations(locale);
      const message = t("bookingReminder.sms", {
        groupRef,
        groups: formatGroups(groupRows, locale),
        clinicName,
        clinicPhone,
      });

      try {
        const provider = await getSmsProviderForUse();
        const adapter = createSmsProviderAdapter(provider);
        const result = await adapter.send({
          recipients: [phone],
          message,
          sender: provider.sender ?? provider.credentials.lineNumber,
        });
        if (result.accepted.length > 0) {
          sent += 1;
          sentIds.push(...groupRows.map((row) => row.id));
        }
      } catch (error) {
        logError("bookingReminder.sms_failed", {
          groupRef,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (sentIds.length > 0) {
      await db
        .update(bookings)
        .set({ reminderSentAt: new Date(), updatedAt: new Date() })
        .where(inArray(bookings.id, sentIds));
    }

    if (sent > 0) {
      logInfo("bookingReminder.tick", { candidates: rows.length, sent });
    }
    return { candidates: rows.length, sent };
  } catch (error) {
    logError("bookingReminder.failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { candidates: 0, sent: 0 };
  }
}

function clampLeadHours(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_LEAD_HOURS;
  return Math.min(MAX_LEAD_HOURS, Math.max(MIN_LEAD_HOURS, Math.round(parsed)));
}

function formatGroups(rows: (typeof bookings.$inferSelect)[], locale: Locale): string {
  return rows
    .map((row) => {
      const time = row.slotStart ? formatSlot(row.slotStart, locale) : "";
      return time ? `${row.groupTitle} (${time})` : row.groupTitle;
    })
    .join(locale === "fa" ? "، " : ", ");
}

function formatSlot(date: Date, locale: Locale): string {
  if (locale === "fa") return formatJalali(date, "yyyy/MM/dd HH:mm");
  const two = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${date.getUTCFullYear()}/${two(date.getUTCMonth() + 1)}/${two(date.getUTCDate())} ${two(date.getUTCHours())}:${two(date.getUTCMinutes())}`;
}
