export const SMS_LIMITS = {
  zero: 0,
  emptyLength: 0,
  pageMin: 1,
  pageDefault: 1,
  tokenMinLength: 1,
  templateKeyMinLength: 1,
  providerNameMinLength: 2,
  providerNameMaxLength: 80,
  providerSearchMaxLength: 100,
  providerListPageMax: 100_000,
  providerListPerPageMax: 50,
  providerListPerPageDefault: 10,
  providerTokenMaxLength: 4096,
  providerApiKeyMaxLength: 512,
  providerUsernameMaxLength: 256,
  providerPasswordMaxLength: 512,
  providerAuthHeaderMaxLength: 64,
  providerLineNumberMaxLength: 32,
  providerSenderMaxLength: 32,
  recipientMinLength: 5,
  recipientMaxLength: 32,
  messageMinLength: 1,
  messageMaxLength: 2_000,
  messageListPageMax: 100_000,
  messageListSearchMaxLength: 32,
  messageListPerPageMax: 50,
  messageListPerPageDefault: 20,
  templateKeyMaxLength: 80,
  templateNameMaxLength: 120,
  templateVariableMaxLength: 40,
  templateVariableCountMax: 20,
  templateDisplayOrderMin: 0,
  templateDisplayOrderMax: 100_000,
  templateListPageMax: 100_000,
  templateListPerPageMax: 50,
  templateListPerPageDefault: 10,
  templateSearchMaxLength: 100,
  recipientCountMax: 1_000,
  recipientSearchMaxLength: 100,
  recipientListPerPageMax: 50,
  recipientListPerPageDefault: 10,
  variableValueMaxLength: 256,
  campaignNameMaxLength: 120,
  idempotencyKeyMinLength: 8,
  idempotencyKeyMaxLength: 128,
  testRateLimit: 10,
  sendRateLimit: 10,
  rateLimitWindowMs: 60_000,
  requestBodyLimitBytes: 128 * 1024,
  recentMessageCount: 8,
  searchDebounceMs: 400,
  percentageBase: 100,
} as const;

export const SMS_MESSAGE_LIMITS = {
  gsm7Single: 160,
  gsm7Multipart: 153,
  unicodeSingle: 70,
  unicodeMultipart: 67,
} as const;

export const SMS_NETWORK = {
  requestTimeoutMs: 12_000,
  maxAttempts: 3,
  retryDelayMs: 250,
  responseBodyMaxChars: 2_000,
} as const;

export const SMS_HTTP_STATUS = {
  badRequest: 400,
  ok: 200,
  created: 201,
  notFound: 404,
  requestTimeout: 408,
  tooEarly: 425,
  tooManyRequests: 429,
  internalServerError: 500,
  badGateway: 502,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
} as const;

export const SMS_HTTP_RETRYABLE_STATUS_CODES = new Set<number>([
  SMS_HTTP_STATUS.requestTimeout,
  SMS_HTTP_STATUS.tooEarly,
  SMS_HTTP_STATUS.tooManyRequests,
  SMS_HTTP_STATUS.internalServerError,
  SMS_HTTP_STATUS.badGateway,
  SMS_HTTP_STATUS.serviceUnavailable,
  SMS_HTTP_STATUS.gatewayTimeout,
]);

export const SMS_PROVIDER_DEFAULTS = {
  authScheme: "bearer",
  authHeader: "Authorization",
  payloadMode: "bulk",
} as const;

export const SMS_PROVIDER_HTTP = {
  jsonContentType: "application/json",
  formContentType: "application/x-www-form-urlencoded",
  bearerPrefix: "Bearer",
} as const;

export const SMS_API_ROUTES = {
  providers: "/api/v1/admin/sms/providers",
  templates: "/api/v1/admin/sms/templates",
  messages: "/api/v1/admin/sms/messages",
  recipients: "/api/v1/admin/sms/recipients",
  overview: "/api/v1/admin/sms/overview",
} as const;

export const SMS_DASHBOARD_ROUTES = {
  root: "/dashboard/sms",
  providers: "/dashboard/sms/providers",
  addProvider: "/dashboard/sms/providers/add",
  templates: "/dashboard/sms/templates",
  addTemplate: "/dashboard/sms/templates/add",
  send: "/dashboard/sms/send",
  messages: "/dashboard/sms/messages",
} as const;

export const SMS_PERMISSIONS = {
  read: "sms.read",
  write: "sms.write",
  manage: "sms.manage",
  send: "sms.send",
} as const;

export const SMS_SEND_MODES = {
  custom: "custom",
  template: "template",
} as const;

export const SMS_LOCALES = {
  fa: "fa",
  en: "en",
} as const;

export const SMS_UI = {
  maskedTokenPrefix: "•••• ",
  variableSeparator: ", ",
  recipientSeparators: /[\n,\u060c]+/,
  previewMissingVariable: "…",
  templateVariablePattern: /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g,
  selectSideOffset: 4,
  skeletonRows: 3,
} as const;

export const SMS_ERROR_MESSAGES = {
  providerCreateFailed: "Could not create provider.",
  providerNotFound: "SMS provider not found.",
  providerNotConfigured: "No active SMS provider is configured.",
  providerInactive: "The selected SMS provider is inactive.",
  templateCreateFailed: "Could not create SMS template.",
  templateNotFound: "SMS template not found.",
  invalidRecipient: "Invalid Iranian mobile number.",
  invalidRecipients: "One or more recipients are invalid.",
  duplicateRecipients: "Duplicate recipients are not allowed.",
  messageTooLong: "Message is too long.",
  campaignCreateFailed: "Could not create SMS campaign.",
  campaignUpdateFailed: "Could not update SMS campaign.",
  providerNoAcceptance: "Provider did not accept recipients.",
  messageConflict: "Choose a template or enter a message, not both.",
  templateLocaleMissing: "The selected template has no translation for this language.",
  messageRequired: "A message is required.",
  providerRejectedRecipient: "The provider did not accept this recipient.",
  providerNetworkError: "Could not connect to the SMS provider.",
  providerCheckFailed: "Could not complete the provider check.",
  providerCheckRejected: "The provider did not accept the test message.",
  providerHttpRejected: "The SMS provider rejected the request.",
  providerTemporaryUnavailable: "The SMS provider is temporarily unavailable.",
  providerTimeout: "The SMS provider did not respond before the timeout.",
  unsafeProviderUrl: "Provider URL must use HTTPS.",
  invalidIranianMobile: "Enter a valid Iranian mobile number.",
  tokenEmpty: "Token cannot be empty.",
  messageOrTemplateRequired: "Provide a message or choose a template.",
  messageEmpty: "Message cannot be empty.",
  templateVariablesNotUnique: "Template variables must be unique.",
  messageNotFound: "SMS message not found.",
} as const;

export const SMS_ERROR_CODES = {
  providerCreateFailed: "SMS_PROVIDER_CREATE_FAILED",
  providerNotFound: "SMS_PROVIDER_NOT_FOUND",
  providerNotConfigured: "SMS_PROVIDER_NOT_CONFIGURED",
  providerInactive: "SMS_PROVIDER_INACTIVE",
  templateCreateFailed: "SMS_TEMPLATE_CREATE_FAILED",
  templateNotFound: "SMS_TEMPLATE_NOT_FOUND",
  invalidRecipient: "INVALID_RECIPIENT",
  invalidRecipients: "INVALID_RECIPIENTS",
  duplicateRecipients: "DUPLICATE_RECIPIENTS",
  messageTooLong: "SMS_MESSAGE_TOO_LONG",
  campaignCreateFailed: "SMS_CAMPAIGN_CREATE_FAILED",
  campaignUpdateFailed: "SMS_CAMPAIGN_UPDATE_FAILED",
  providerNoAcceptance: "PROVIDER_NO_ACCEPTANCE",
  messageConflict: "SMS_MESSAGE_CONFLICT",
  templateLocaleMissing: "SMS_TEMPLATE_LOCALE_MISSING",
  messageRequired: "SMS_MESSAGE_REQUIRED",
  providerNetworkError: "PROVIDER_NETWORK_ERROR",
  sendFailed: "SMS_SEND_FAILED",
  testFailed: "SMS_PROVIDER_TEST_FAILED",
  providerCheckFailed: "PROVIDER_CHECK_FAILED",
  providerRejected: "PROVIDER_REJECTED",
  providerHttpError: "PROVIDER_HTTP_ERROR",
  providerTemporaryError: "PROVIDER_TEMPORARY_ERROR",
  providerTimeout: "PROVIDER_TIMEOUT",
  unsafeProviderUrl: "UNSAFE_PROVIDER_URL",
  invalidProviderId: "INVALID_SMS_PROVIDER_ID",
  invalidTemplateId: "INVALID_SMS_TEMPLATE_ID",
  messageNotFound: "SMS_MESSAGE_NOT_FOUND",
} as const;

export const SMS_PROVIDER_PROTOCOL = {
  kavenegar: {
    sendPath: "sms/send.json",
    versionPath: "v1",
    receptorField: "receptor",
    messageField: "message",
    senderField: "sender",
    returnField: "return",
    entriesField: "entries",
  },
  smsIr: {
    lineNumberField: "lineNumber",
    messageTextField: "messageText",
    mobilesField: "mobiles",
    bulkPath: "/send/bulk",
    verifyPath: "/send/verify",
    getCreditPath: "/credit",
    getLinesPath: "/line",
    getMessagePath: "/send/",
    getLatestReceivedPath: "/receive/latest",
    apiKeyHeader: "x-api-key",
    maxMobilesPerBulk: 100,
  },
  ippanel: {
    sendingTypeField: "sending_type",
    sendingType: "webservice",
    fromNumberField: "from_number",
    messageField: "message",
    recipientsField: "recipients",
  },
  melipayamak: {
    usernameField: "username",
    passwordField: "password",
    fromField: "from",
    toField: "to",
    textField: "text",
    tokenField: "token",
  },
  generic: {
    fromField: "from",
    toField: "to",
    messageField: "message",
    tokenField: "token",
  },
} as const;

export const SMS_PROVIDER_RESPONSE_KEYS = {
  success: ["success", "isSuccess", "ok"],
  messageId: ["messageId", "messageid", "bulkId", "batchId", "id"],
  status: ["status", "statusText", "message"],
  error: ["message", "error", "errorMessage"],
} as const;

export const SMS_BOOLEAN_VALUES = {
  true: ["true", "1", 1],
  false: ["false", "0", 0],
} as const;

export const SMS_LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

export const SMS_LOCAL_HOST_SUFFIX = ".local";
