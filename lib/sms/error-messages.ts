import type { ApiError } from "@/lib/api/errors";

/**
 * SMS admin error catalog.
 *
 * Maps server-side error codes (from SMS_ERROR_CODES + inline ApiError codes)
 * to i18n keys under `smsAdmin.errors.<key>`. Keys must exist in both
 * `messages/en.json` and `messages/fa.json` under `smsAdmin.errors`.
 *
 * Not every scenario is reachable; only codes actually thrown by the
 * SMS service layer and admin endpoints are catalogued.
 */
export type SmsAdminErrorMeta = {
  no: number;
  status: number;
  key: string;
};

export const SMS_ADMIN_ERRORS = {
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
  providerHttpRejected: { no: 21, status: 502, key: "providerHttpRejected" },
  providerTemporaryUnavailable: { no: 22, status: 503, key: "providerTemporaryUnavailable" },
  providerTimeout: { no: 23, status: 504, key: "providerTimeout" },
  unsafeProviderUrl: { no: 24, status: 400, key: "unsafeProviderUrl" },
  invalidIranianMobile: { no: 25, status: 400, key: "invalidIranianMobile" },
  tokenEmpty: { no: 26, status: 400, key: "tokenEmpty" },
  messageOrTemplateRequired: { no: 27, status: 400, key: "messageOrTemplateRequired" },
  messageEmpty: { no: 28, status: 400, key: "messageEmpty" },
  templateVariablesNotUnique: { no: 29, status: 400, key: "templateVariablesNotUnique" },
  messageNotFound: { no: 30, status: 404, key: "messageNotFound" },

  // Inline codes from send-service / template-service / provider-check-service
  sendFailed: { no: 31, status: 502, key: "sendFailed" },
  testFailed: { no: 32, status: 502, key: "testFailed" },
  providerRejected: { no: 34, status: 502, key: "providerRejected" },
  providerHttpError: { no: 35, status: 502, key: "providerHttpError" },
  providerTemporaryError: { no: 36, status: 503, key: "providerTemporaryError" },
  invalidProviderId: { no: 38, status: 400, key: "invalidProviderId" },
  invalidTemplateId: { no: 39, status: 400, key: "invalidTemplateId" },
  otpParamMissing: { no: 39, status: 400, key: "otpParamMissing" },
} as const satisfies Record<string, SmsAdminErrorMeta>;

export type SmsAdminErrorCode = keyof typeof SMS_ADMIN_ERRORS;

const CODE_TO_NO = Object.fromEntries(
  Object.entries(SMS_ADMIN_ERRORS).map(([code, meta]) => [code, meta.no]),
) as Record<SmsAdminErrorCode, number>;

/**
 * Translate an `ApiError` (or any object shaped like one) thrown by the
 * SMS admin services into a client-facing message key. Returns the catalog
 * key when the code is known, otherwise a default system-error key.
 */
export function smsAdminErrorKey(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in (error as ApiError) &&
    typeof (error as ApiError).code === "string"
  ) {
    const code = (error as ApiError).code;
    if (code in SMS_ADMIN_ERRORS) {
      return SMS_ADMIN_ERRORS[code as SmsAdminErrorCode].key;
    }
  }
  return "systemError";
}

export { CODE_TO_NO };
