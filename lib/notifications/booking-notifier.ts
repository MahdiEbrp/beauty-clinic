import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { format as formatJalali } from "date-fns-jalali";

import { getApiTranslations } from "@/lib/i18n/api-translations";
import { logError, logInfo } from "@/lib/log";
import { createEmailProviderAdapter } from "@/lib/email/providers";
import { getEmailProviderForUse } from "@/lib/email/provider-service";
import { createSmsProviderAdapter } from "@/lib/sms/providers";
import { getSmsProviderForUse } from "@/lib/sms/provider-service";
import { normalizeIranianPhone } from "@/lib/sms/phone";
import { formatNumber } from "@/lib/services/format";
import { loadSystemSettingsMap } from "@/lib/settings/loader";
import type { Locale } from "@/lib/services/types";
import { db } from "@/src/db";
import { bookings, paymentTransactions } from "@/src/db/schema";

/**
 * Sends SMS/email confirmations once a booking group is paid.
 *
 * Mirror of the OTP delivery path: messages are composed from built-in i18n
 * keys and sent directly through the active provider adapters (no campaign
 * rows). Never throws — a failing provider must not break the payment callback
 * flow, so every failure is logged and swallowed.
 *
 * The group is re-read here (not passed from memory) so the notification always
 * reflects what was actually committed by the paying transaction.
 */
export type NewReservationNotificationInput = {
  groupRef: string;
  locale: Locale;
};

export async function notifyNewReservation(
  input: NewReservationNotificationInput,
): Promise<void> {
  try {
    const settings = await loadSystemSettingsMap();
    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.groupRef, input.groupRef));
    if (rows.length === 0) {
      logInfo("bookingNotify.no_group", { groupRef: input.groupRef });
      return;
    }
    const paid = rows.filter((row) => row.status === "paid");
    const source = paid.length > 0 ? paid : rows;
    const first = source[0];

    const [verifiedTx] = await db
      .select()
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.bookingGroupRef, input.groupRef),
          eq(paymentTransactions.status, "verified"),
        ),
      )
      .orderBy(desc(paymentTransactions.verifiedAt))
      .limit(1);

    const deposit = verifiedTx ? Number(verifiedTx.amount) : undefined;
    const currency = verifiedTx?.currency ?? "تومان";
    const paymentReference =
      verifiedTx?.refId ?? verifiedTx?.authority ?? "";

    const t = await getApiTranslations(input.locale);
    const clinicName = String(settings.get("clinic.name") ?? "Nafas");
    const clinicPhone = String(settings.get("contact.phone") ?? "");
    const vars = {
      name: first.fullName,
      groupRef: input.groupRef,
      services: formatServices(source, input.locale),
      deposit: formatNumber(deposit),
      currency,
      paymentReference,
      clinicName,
      clinicPhone,
    };

    const smsResult = await sendGroupSms({
      customerPhone: first.phone,
      adminPhones: splitList(settings.get("contact.admin_phone")),
      notifySms: settings.get("booking.notify_sms") !== false,
      notifyAdminSms: settings.get("booking.notify_admin_sms") !== false,
      message: t("bookingNotify.sms", vars),
    });

    const emailResult = await sendGroupEmail({
      customerEmail: first.email && isRealEmail(first.email) ? first.email : null,
      adminEmails: splitList(settings.get("contact.admin_email")),
      notifyEmail: settings.get("booking.notify_email") !== false,
      notifyAdminEmail: settings.get("booking.notify_admin_email") !== false,
      subject: t("bookingNotify.emailSubject", vars),
      html: t("bookingNotify.emailBody", vars),
    });

    if (smsResult > 0 || emailResult > 0) {
      logInfo("bookingNotify.sent", {
        groupRef: input.groupRef,
        locale: input.locale,
        sms: smsResult,
        email: emailResult,
      });
    }
  } catch (error) {
    logError("bookingNotify.failed", {
      groupRef: input.groupRef,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function formatServices(
  rows: (typeof bookings.$inferSelect)[],
  locale: Locale,
): string {
  const parts = rows.map((row) => {
    const time = row.slotStart ? formatSlot(row.slotStart, locale) : "";
    const label = time ? `${row.serviceTitle} (${time})` : row.serviceTitle;
    return row.quantity > 1 ? `${label} ×${formatNumber(row.quantity)}` : label;
  });
  return parts.join(locale === "fa" ? "، " : ", ");
}

function formatSlot(date: Date, locale: Locale): string {
  if (locale === "fa") return formatJalali(date, "yyyy/MM/dd HH:mm");
  const two = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${date.getUTCFullYear()}/${two(date.getUTCMonth() + 1)}/${two(date.getUTCDate())} ${two(date.getUTCHours())}:${two(date.getUTCMinutes())}`;
}

/** Auto-provisioned placeholder addresses from ensureCustomerUser. */
function isRealEmail(email: string): boolean {
  return !/^\d+@email\.com$/.test(email.trim().toLowerCase());
}

function splitList(value: unknown): string[] {
  return typeof value === "string"
    ? value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
}

async function sendGroupSms(input: {
  customerPhone: string;
  adminPhones: string[];
  notifySms: boolean;
  notifyAdminSms: boolean;
  message: string;
}): Promise<number> {
  const customer = normalizeIranianPhone(input.customerPhone);
  const admins = input.adminPhones
    .map((phone) => normalizeIranianPhone(phone))
    .filter((phone): phone is string => phone !== null && phone !== customer);
  const recipients = input.notifySms && customer ? [customer] : [];
  if (input.notifyAdminSms) recipients.push(...admins);
  const unique = [...new Set(recipients)];
  if (unique.length === 0) return 0;

  try {
    const provider = await getSmsProviderForUse();
    const adapter = createSmsProviderAdapter(provider);
    const result = await adapter.send({
      recipients: unique,
      message: input.message,
      sender: provider.sender ?? provider.credentials.lineNumber,
    });
    return result.accepted.length;
  } catch (error) {
    logError("bookingNotify.sms_failed", {
      recipients: unique,
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

async function sendGroupEmail(input: {
  customerEmail: string | null;
  adminEmails: string[];
  notifyEmail: boolean;
  notifyAdminEmail: boolean;
  subject: string;
  html: string;
}): Promise<number> {
  const recipients =
    input.notifyEmail && input.customerEmail ? [input.customerEmail] : [];
  if (input.notifyAdminEmail) {
    recipients.push(...input.adminEmails.filter((email) => email !== input.customerEmail));
  }
  const unique = [...new Set(recipients)];
  if (unique.length === 0) return 0;

  try {
    const provider = await getEmailProviderForUse();
    const adapter = createEmailProviderAdapter({
      kind: provider.kind,
      host: provider.host,
      port: provider.port,
      username: provider.username,
      password: provider.password,
      encryption: provider.encryption,
      fromEmail: provider.fromEmail,
      fromName: provider.fromName,
    });
    const result = await adapter.send({
      recipients: unique,
      subject: input.subject,
      message: input.html,
      templateType: "html",
      fromEmail: provider.fromEmail ?? undefined,
    });
    return result.accepted.length;
  } catch (error) {
    logError("bookingNotify.email_failed", {
      recipients: unique,
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}