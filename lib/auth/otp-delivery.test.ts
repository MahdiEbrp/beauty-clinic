import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OtpDeliveryInput } from "./otp-delivery";

const mocks = vi.hoisted(() => ({
  smsSend: vi.fn(() => ({
    accepted: ["+989121234567"],
    rejected: [] as string[],
  })),
  emailSend: vi.fn(() => ({
    accepted: ["jane@example.com"],
    rejected: [],
  })),
  logError: vi.fn(),
  logInfo: vi.fn(),
  getSmsProviderForUse: vi.fn(
    (): {
      id: string;
      kind: string;
      name: string;
      isDefault: boolean;
      isActive: boolean;
      sender: string | null;
      credentials: { lineNumber: string; apiKey: string };
    } => ({
      id: "p-sms",
      kind: "fake",
      name: "Fake SMS",
      isDefault: true,
      isActive: true,
      sender: "Nafas",
      credentials: { lineNumber: "3000", apiKey: "secret" },
    }),
  ),
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
}));

// `server-only` throws when imported outside a Server Component runtime, so
// the auth service's guard import must be stubbed in the test environment.
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

import { ApiError } from "@/lib/api/errors";
import { sendLoginOtp } from "./otp-delivery";

const base: OtpDeliveryInput = {
  channel: "sms",
  phone: "+989121234567",
  email: "jane@example.com",
  code: "123456",
  smsText: "Your code is 123456",
  emailSubject: "Login code",
  emailHtml: "<p>Your code is <b>123456</b></p>",
};

beforeEach(() => {
  mocks.smsSend.mockClear();
  mocks.emailSend.mockClear();
  mocks.logError.mockClear();
  mocks.logInfo.mockClear();
  mocks.getSmsProviderForUse.mockClear();
  mocks.getEmailProviderForUse.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sendLoginOtp (sms)", () => {
  it("sends the code through the active SMS provider", async () => {
    await expect(sendLoginOtp(base)).resolves.toBeUndefined();

    expect(mocks.getSmsProviderForUse).toHaveBeenCalledOnce();
    expect(mocks.smsSend).toHaveBeenCalledWith({
      recipients: ["+989121234567"],
      message: "Your code is 123456",
      sender: "Nafas",
    });
  });

  it("falls back to the provider line number when there is no sender id", async () => {
    mocks.getSmsProviderForUse.mockResolvedValueOnce({
      id: "p-sms",
      kind: "fake",
      name: "Fake SMS",
      isDefault: true,
      isActive: true,
      sender: null,
      credentials: { lineNumber: "3000", apiKey: "secret" },
    });

    await sendLoginOtp(base);

    expect(mocks.smsSend).toHaveBeenCalledWith(
      expect.objectContaining({ sender: "3000" }),
    );
  });

  it("normalizes Iranian mobile formats to +98 before sending", async () => {
    await sendLoginOtp({ ...base, phone: "09121234567" });

    expect(mocks.smsSend).toHaveBeenCalledWith(
      expect.objectContaining({ recipients: ["+989121234567"] }),
    );
  });

  it("throws OTP_PROVIDER_UNAVAILABLE when the provider rejects the send", async () => {
    mocks.smsSend.mockResolvedValueOnce({ accepted: [], rejected: ["+989121234567"] });

    await expect(sendLoginOtp(base)).rejects.toMatchObject({
      status: 502,
      code: "OTP_PROVIDER_UNAVAILABLE",
    });
  });

  it("maps provider not-configured errors to OTP_PROVIDER_UNAVAILABLE", async () => {
    mocks.getSmsProviderForUse.mockRejectedValueOnce(
      new ApiError(503, "SMS_PROVIDER_NOT_CONFIGURED", "No SMS provider."),
    );

    await expect(sendLoginOtp(base)).rejects.toMatchObject({
      status: 502,
      code: "OTP_PROVIDER_UNAVAILABLE",
    });
  });
});

describe("sendLoginOtp (email)", () => {
  it("sends the HTML code email through the active email provider", async () => {
    await expect(sendLoginOtp({ ...base, channel: "email" })).resolves.toBeUndefined();

    expect(mocks.getEmailProviderForUse).toHaveBeenCalledOnce();
    expect(mocks.emailSend).toHaveBeenCalledWith({
      recipients: ["jane@example.com"],
      subject: "Login code",
      message: "<p>Your code is <b>123456</b></p>",
      templateType: "html",
      fromEmail: "no-reply@example.com",
    });
  });

  it("maps provider-inactive errors to OTP_PROVIDER_UNAVAILABLE in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.getEmailProviderForUse.mockRejectedValueOnce(
      new ApiError(503, "EMAIL_PROVIDER_INACTIVE", "No active email provider."),
    );

    await expect(
      sendLoginOtp({ ...base, channel: "email" }),
    ).rejects.toMatchObject({ status: 502, code: "OTP_PROVIDER_UNAVAILABLE" });
  });

  it("normalizes unknown delivery failures the same way", async () => {
    mocks.emailSend.mockRejectedValueOnce(new Error("smtp exploded"));

    await expect(
      sendLoginOtp({ ...base, channel: "email" }),
    ).rejects.toMatchObject({ status: 502, code: "OTP_PROVIDER_UNAVAILABLE" });
    expect(mocks.logError).toHaveBeenCalled();
  });

  it("logs the code instead of sending when no provider is configured in dev", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mocks.getEmailProviderForUse.mockRejectedValueOnce(
      new ApiError(503, "EMAIL_PROVIDER_NOT_CONFIGURED", "No email provider."),
    );

    await expect(
      sendLoginOtp({ ...base, channel: "email" }),
    ).resolves.toBeUndefined();

    expect(mocks.emailSend).not.toHaveBeenCalled();
    expect(mocks.logInfo).toHaveBeenCalledWith(
      "otp.email.dev_log",
      expect.objectContaining({
        recipients: ["jane@example.com"],
        subject: "Login code",
        message: "<p>Your code is <b>123456</b></p>",
      }),
    );
  });

  it("still fails when no provider is configured in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.getEmailProviderForUse.mockRejectedValueOnce(
      new ApiError(503, "EMAIL_PROVIDER_NOT_CONFIGURED", "No email provider."),
    );

    await expect(
      sendLoginOtp({ ...base, channel: "email" }),
    ).rejects.toMatchObject({ status: 502, code: "OTP_PROVIDER_UNAVAILABLE" });
    expect(mocks.logInfo).not.toHaveBeenCalled();
  });
});
