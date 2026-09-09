/**
 * Email admin error catalog.
 *
 * Maps server-side error codes (from EMAIL_ERROR_CODES + inline ApiError codes)
 * to i18n keys under `emailAdmin.errors.<key>`. Keys must exist in both
 * `messages/en.json` and `messages/fa.json` under `emailAdmin.errors`.
 */
export type EmailAdminErrorMeta = {
  no: number;
  status: number;
  key: string;
};

export const EMAIL_ADMIN_ERRORS = {
  // Provider errors
  providerCreateFailed: { no: 1, status: 500, key: "providerCreateFailed" },
  providerNotFound: { no: 2, status: 404, key: "providerNotFound" },
  providerNotConfigured: { no: 3, status: 400, key: "providerNotConfigured" },
  providerInactive: { no: 4, status: 400, key: "providerInactive" },
  templateCreateFailed: { no: 5, status: 500, key: "templateCreateFailed" },
  templateNotFound: { no: 6, status: 404, key: "templateNotFound" },
  invalidRecipient: { no: 7, status: 400, key: "invalidRecipient" },
  invalidRecipients: { no: 8, status: 400, key: "invalidRecipients" },
  duplicateRecipients: { no: 9, status: 400, key: "duplicateRecipients" },
  messageTooLong: { no: 10, status: 400, key: "messageTooLong" },
  campaignCreateFailed: { no: 11, status: 500, key: "campaignCreateFailed" },
  campaignUpdateFailed: { no: 12, status: 500, key: "campaignUpdateFailed" },
  providerNoAcceptance: { no: 13, status: 502, key: "providerNoAcceptance" },
  messageConflict: { no: 14, status: 400, key: "messageConflict" },
  templateLocaleMissing: { no: 15, status: 400, key: "templateLocaleMissing" },
  messageRequired: { no: 16, status: 400, key: "messageRequired" },
  providerRejectedRecipient: { no: 17, status: 502, key: "providerRejectedRecipient" },
  providerNetworkError: { no: 18, status: 502, key: "providerNetworkError" },
  providerCheckFailed: { no: 19, status: 502, key: "providerCheckFailed" },
  providerCheckRejected: { no: 20, status: 502, key: "providerCheckRejected" },
  providerSmtpRejected: { no: 21, status: 502, key: "providerSmtpRejected" },
  providerTemporaryUnavailable: { no: 22, status: 503, key: "providerTemporaryUnavailable" },
  providerTimeout: { no: 23, status: 504, key: "providerTimeout" },
  unsafeProviderHost: { no: 24, status: 400, key: "unsafeProviderHost" },
  invalidEmailAddress: { no: 25, status: 400, key: "invalidEmailAddress" },
  passwordEmpty: { no: 26, status: 400, key: "passwordEmpty" },
  messageOrTemplateRequired: { no: 27, status: 400, key: "messageOrTemplateRequired" },
  messageEmpty: { no: 28, status: 400, key: "messageEmpty" },
  templateVariablesNotUnique: { no: 29, status: 400, key: "templateVariablesNotUnique" },
  messageNotFound: { no: 30, status: 404, key: "messageNotFound" },
  invalidSubject: { no: 31, status: 400, key: "invalidSubject" },

  // Inline codes from send-service / template-service / provider-check-service
  sendFailed: { no: 32, status: 502, key: "sendFailed" },
  testFailed: { no: 32, status: 502, key: "testFailed" },
  providerRejected: { no: 34, status: 502, key: "providerRejected" },
  providerSmtpError: { no: 35, status: 502, key: "providerSmtpError" },
  providerTemporaryError: { no: 36, status: 503, key: "providerTemporaryError" },
  invalidProviderId: { no: 39, status: 400, key: "invalidProviderId" },
  invalidTemplateId: { no: 40, status: 400, key: "invalidTemplateId" },
} as const satisfies Record<string, EmailAdminErrorMeta>;

export type EmailAdminErrorCode = keyof typeof EMAIL_ADMIN_ERRORS;

/**
 * Translate an `ApiError` (or any object shaped like one) thrown by the
 * Email admin services into a client-facing message key.
 */
export function emailAdminErrorKey(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in (error as { code?: unknown }) &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    if (code in EMAIL_ADMIN_ERRORS) {
      return EMAIL_ADMIN_ERRORS[code as EmailAdminErrorCode].key;
    }
  }
  return "systemError";
}
