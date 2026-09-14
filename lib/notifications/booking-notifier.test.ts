import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MockDb, Row } from "@/lib/test/mock-db";

const mocks = vi.hoisted(() => ({
  smsSend: vi.fn(
    (input: { recipients: string[]; message: string; sender?: string }) => ({
      accepted: input.recipients,
      rejected: [] as string[],
    }),
  ),
  emailSend: vi.fn(
    (input: {
      recipients: string[];
      subject: string;
      message: string;
      templateType: string;
      fromEmail?: string;
    }) => ({
      accepted: input.recipients,
      rejected: [] as string[],
    }),
  ),
  logError: vi.fn(),
  logInfo: vi.fn(),
  getSmsProviderForUse: vi.fn(() => ({
    id: "p-sms",
    kind: "fake",
    name: "Fake SMS",
    isDefault: true,
    isActive: true,
    sender: "Nafas",
    credentials: { lineNumber: "3000", apiKey: "secret" },
  })),
  getEmailProviderForUse: vi.fn(() => ({
    id: "p-email",
    kind: "fake",
    name: "Fake Email",
    isDefault: true,
    isActive: true,
    host: "smtp.example.com",
    port: 587,
    username: "mailer",
    password: "secret",
    encryption: "starttls",
    fromEmail: "no-reply@example.com",
    fromName: "Nafas",
  })),
  loadSettingsMap: vi.fn(() => Promise.resolve(new Map<string, unknown>())),
  translate: vi.fn((key: string, vars?: Record<string, string | number>) =>
    `[${key}]${vars ? `|${JSON.stringify(vars)}` : ""}`,
  ),
}));

// `server-only` throws when imported outside a Server Component runtime, so
// the notifier's guard import must be stubbed in the test environment.
vi.mock("server-only", () => ({}));
vi.mock("@/lib/log", () => ({
  logError: mocks.logError,
  logInfo: mocks.logInfo,
}));
vi.mock("@/lib/sms/provider-service", () => ({
  getSmsProviderForUse: mocks.getSmsProviderForUse,
}));
vi.mock("@/lib/sms/providers", () => ({
  createSmsProviderAdapter: vi.fn(() => ({ send: mocks.smsSend })),
}));
vi.mock("@/lib/email/provider-service", () => ({
  getEmailProviderForUse: mocks.getEmailProviderForUse,
}));
vi.mock("@/lib/email/providers", () => ({
  createEmailProviderAdapter: vi.fn(() => ({ send: mocks.emailSend })),
}));
vi.mock("@/lib/settings/loader", () => ({
  loadSystemSettingsMap: mocks.loadSettingsMap,
}));
vi.mock("@/lib/i18n/api-translations", () => ({
  getApiTranslations: vi.fn(() => Promise.resolve(mocks.translate)),
}));
vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

import { db } from "@/src/db";
import { notifyNewReservation } from "./booking-notifier";

const mockDb = db as unknown as MockDb;

const booking: Row = {
  id: "b1",
  groupRef: "NF-1001",
  status: "paid",
  fullName: "Jane Doe",
  phone: "09121234567",
  email: "jane@example.com",
  groupTitle: "Botox Injection",
  quantity: 1,
  slotStart: undefined,
};

const verifiedTx: Row = {
  id: "tx1",
  bookingGroupRef: "NF-1001",
  status: "verified",
  verifiedAt: new Date(2024, 0, 1, 10),
  amount: 250,
  currency: "Toman",
  refId: "5678",
  authority: "auth-1",
};

function settings(entries: Array<[string, unknown]>): Map<string, unknown> {
  return new Map([["clinic.name", "Nafas"], ...entries]);
}

beforeEach(() => {
  mockDb.reset();
  mocks.smsSend.mockClear();
  mocks.emailSend.mockClear();
  mocks.logError.mockClear();
  mocks.logInfo.mockClear();
  mocks.getSmsProviderForUse.mockClear();
  mocks.getEmailProviderForUse.mockClear();
  mocks.translate.mockClear();
  mocks.loadSettingsMap.mockResolvedValue(new Map<string, unknown>());
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("notifyNewReservation", () => {
  it("sends SMS and email to the customer", async () => {
    mockDb.seed("bookings", [booking]);
    mockDb.seed("payment_transactions", [verifiedTx]);
    mocks.loadSettingsMap.mockResolvedValue(
      settings([["contact.admin_phone", "09351112233"], ["contact.admin_email", "admin@example.com"]]),
    );

    await notifyNewReservation({ groupRef: "NF-1001", locale: "en" });

    expect(mocks.smsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: ["+989121234567", "+989351112233"],
        sender: "Nafas",
      }),
    );
    expect(mocks.emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: ["jane@example.com", "admin@example.com"],
        subject: expect.any(String) as string,
        templateType: "html",
      }),
    );
    expect(mocks.logInfo).toHaveBeenCalledWith(
      "bookingNotify.sent",
      expect.objectContaining({ groupRef: "NF-1001", sms: 2, email: 2 }),
    );
  });

  it("deduplicates an admin phone that matches the customer", async () => {
    mockDb.seed("bookings", [booking]);
    mockDb.seed("payment_transactions", [verifiedTx]);
    mocks.loadSettingsMap.mockResolvedValue(
      settings([["contact.admin_phone", "09121234567"]]),
    );

    await notifyNewReservation({ groupRef: "NF-1001", locale: "en" });

    expect(mocks.smsSend).toHaveBeenCalledWith(
      expect.objectContaining({ recipients: ["+989121234567"] }),
    );
  });

  it("skips placeholder customer emails but keeps the admin email copy", async () => {
    mockDb.seed("bookings", [{ ...booking, email: "729182@email.com" }]);
    mockDb.seed("payment_transactions", [verifiedTx]);
    mocks.loadSettingsMap.mockResolvedValue(
      settings([["contact.admin_email", "admin@example.com"]]),
    );

    await notifyNewReservation({ groupRef: "NF-1001", locale: "en" });

    expect(mocks.emailSend).toHaveBeenCalledWith(
      expect.objectContaining({ recipients: ["admin@example.com"] }),
    );
  });

  it("honors per-channel toggles", async () => {
    mockDb.seed("bookings", [booking]);
    mockDb.seed("payment_transactions", [verifiedTx]);
    mocks.loadSettingsMap.mockResolvedValue(
      settings([
        ["booking.notify_sms", false],
        ["booking.notify_email", false],
        ["booking.notify_admin_sms", false],
        ["booking.notify_admin_email", false],
      ]),
    );

    await notifyNewReservation({ groupRef: "NF-1001", locale: "en" });

    expect(mocks.smsSend).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
    expect(mocks.logInfo).not.toHaveBeenCalled();
  });

  it("defaults to enabled when toggle settings are missing", async () => {
    mockDb.seed("bookings", [booking]);
    mockDb.seed("payment_transactions", [verifiedTx]);

    await notifyNewReservation({ groupRef: "NF-1001", locale: "fa" });

    expect(mocks.smsSend).toHaveBeenCalledWith(
      expect.objectContaining({ recipients: ["+989121234567"] }),
    );
    expect(mocks.emailSend).toHaveBeenCalledWith(
      expect.objectContaining({ recipients: ["jane@example.com"] }),
    );
  });

  it("swallows provider failures and logs them", async () => {
    mockDb.seed("bookings", [booking]);
    mockDb.seed("payment_transactions", [verifiedTx]);
    mocks.smsSend.mockRejectedValueOnce(new Error("provider down"));
    mocks.emailSend.mockRejectedValueOnce(new Error("smtp down"));

    await expect(
      notifyNewReservation({ groupRef: "NF-1001", locale: "en" }),
    ).resolves.toBeUndefined();

    expect(mocks.logError).toHaveBeenCalledWith("bookingNotify.sms_failed", expect.any(Object));
    expect(mocks.logError).toHaveBeenCalledWith("bookingNotify.email_failed", expect.any(Object));
  });

  it("does nothing when the group does not exist", async () => {
    await notifyNewReservation({ groupRef: "NF-9999", locale: "en" });

    expect(mocks.smsSend).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
    expect(mocks.logInfo).toHaveBeenCalledWith("bookingNotify.no_group", {
      groupRef: "NF-9999",
    });
  });

  it("falls back to unverified rows when nothing is paid yet", async () => {
    mockDb.seed("bookings", [{ ...booking, status: "pending", email: undefined }]);
    mocks.loadSettingsMap.mockResolvedValue(settings([]));

    await notifyNewReservation({ groupRef: "NF-1001", locale: "en" });

    expect(mocks.smsSend).toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });
});