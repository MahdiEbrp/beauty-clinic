export const EMAIL_LIMITS = {
  zero: 0,
  emptyLength: 0,
  pageMin: 1,
  pageDefault: 1,
  passwordMinLength: 1,
  templateKeyMinLength: 1,
  providerNameMinLength: 2,
  providerNameMaxLength: 80,
  providerSearchMaxLength: 100,
  providerListPageMax: 100_000,
  providerListPerPageMax: 50,
  providerListPerPageDefault: 10,
  providerPasswordMaxLength: 512,
  providerUsernameMaxLength: 256,
  providerHostMaxLength: 255,
  providerPortMin: 1,
  providerPortMax: 65_535,
  providerPortDefault: 465,
  providerFromEmailMaxLength: 254,
  providerFromNameMaxLength: 120,
  recipientMinLength: 3,
  recipientMaxLength: 254,
  subjectMinLength: 1,
  subjectMaxLength: 998,
  messageMinLength: 1,
  messageMaxLength: 102_400,
  messageListPageMax: 100_000,
  messageListSearchMaxLength: 254,
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
  requestBodyLimitBytes: 256 * 1024,
  recentMessageCount: 8,
  searchDebounceMs: 400,
  percentageBase: 100,
} as const;

export const EMAIL_NETWORK = {
  connectTimeoutMs: 12_000,
  maxAttempts: 1,
  retryDelayMs: 250,
  responseBodyMaxChars: 2_000,
} as const;

export const EMAIL_HTTP_STATUS = {
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

export const EMAIL_HTTP_RETRYABLE_STATUS_CODES = new Set<number>([
  EMAIL_HTTP_STATUS.requestTimeout,
  EMAIL_HTTP_STATUS.tooEarly,
  EMAIL_HTTP_STATUS.tooManyRequests,
  EMAIL_HTTP_STATUS.internalServerError,
  EMAIL_HTTP_STATUS.badGateway,
  EMAIL_HTTP_STATUS.serviceUnavailable,
  EMAIL_HTTP_STATUS.gatewayTimeout,
]);

export const EMAIL_PROVIDER_DEFAULTS = {
  authMethod: "password",
  encryption: "ssl",
} as const;

export const EMAIL_PROVIDER_SMTP = {
  defaultSmtpPort: 465,
  smtpCommandResponseMaxChars: 2_000,
  lineBreak: "\r\n",
} as const;

export const EMAIL_API_ROUTES = {
  providers: "/api/v1/admin/email/providers",
  templates: "/api/v1/admin/email/templates",
  messages: "/api/v1/admin/email/messages",
  recipients: "/api/v1/admin/email/recipients",
  overview: "/api/v1/admin/email/overview",
} as const;

export const EMAIL_DASHBOARD_ROUTES = {
  root: "/dashboard/email",
  providers: "/dashboard/email/providers",
  addProvider: "/dashboard/email/providers/add",
  templates: "/dashboard/email/templates",
  addTemplate: "/dashboard/email/templates/add",
  send: "/dashboard/email/send",
  messages: "/dashboard/email/messages",
} as const;

export const EMAIL_PERMISSIONS = {
  read: "email.read",
  write: "email.write",
  manage: "email.manage",
  send: "email.send",
} as const;

export const EMAIL_SEND_MODES = {
  custom: "custom",
  template: "template",
} as const;

export const EMAIL_LOCALES = {
  fa: "fa",
  en: "en",
} as const;

export const EMAIL_UI = {
  maskedPasswordPrefix: "•••• ",
  variableSeparator: ", ",
  recipientSeparators: /[\n,\u060c;]+/,
  previewMissingVariable: "…",
  templateVariablePattern: /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g,
  selectSideOffset: 4,
  skeletonRows: 3,
} as const;

export const EMAIL_ERROR_MESSAGES = {
  providerCreateFailed: "Could not create provider.",
  providerNotFound: "Email provider not found.",
  providerNotConfigured: "No active email provider is configured.",
  providerInactive: "The selected email provider is inactive.",
  templateCreateFailed: "Could not create email template.",
  templateNotFound: "Email template not found.",
  invalidRecipient: "Invalid email address.",
  invalidRecipients: "One or more recipients are invalid.",
  duplicateRecipients: "Duplicate recipients are not allowed.",
  messageTooLong: "Message is too long.",
  campaignCreateFailed: "Could not create email campaign.",
  campaignUpdateFailed: "Could not update email campaign.",
  providerNoAcceptance: "Provider did not accept recipients.",
  messageConflict: "Choose a template or enter a message, not both.",
  templateLocaleMissing: "The selected template has no translation for this language.",
  messageRequired: "A message is required.",
  providerRejectedRecipient: "The provider did not accept this recipient.",
  providerNetworkError: "Could not connect to the email provider.",
  providerCheckFailed: "Could not complete the provider check.",
  providerCheckRejected: "The provider did not accept the test message.",
  providerSmtpRejected: "The email provider rejected the request.",
  providerTemporaryUnavailable: "The email provider is temporarily unavailable.",
  providerTimeout: "The email provider did not respond before the timeout.",
  unsafeProviderHost: "Email host must use a secure SMTP connection.",
  invalidEmailAddress: "Enter a valid email address.",
  passwordEmpty: "Password cannot be empty.",
  messageOrTemplateRequired: "Provide a message or choose a template.",
  messageEmpty: "Message cannot be empty.",
  templateVariablesNotUnique: "Template variables must be unique.",
  messageNotFound: "Email message not found.",
  invalidSubject: "Enter a valid subject line.",
} as const;

export const EMAIL_ERROR_CODES = {
  providerCreateFailed: "EMAIL_PROVIDER_CREATE_FAILED",
  providerNotFound: "EMAIL_PROVIDER_NOT_FOUND",
  providerNotConfigured: "EMAIL_PROVIDER_NOT_CONFIGURED",
  providerInactive: "EMAIL_PROVIDER_INACTIVE",
  templateCreateFailed: "EMAIL_TEMPLATE_CREATE_FAILED",
  templateNotFound: "EMAIL_TEMPLATE_NOT_FOUND",
  invalidRecipient: "INVALID_RECIPIENT",
  invalidRecipients: "INVALID_RECIPIENTS",
  duplicateRecipients: "DUPLICATE_RECIPIENTS",
  messageTooLong: "EMAIL_MESSAGE_TOO_LONG",
  campaignCreateFailed: "EMAIL_CAMPAIGN_CREATE_FAILED",
  campaignUpdateFailed: "EMAIL_CAMPAIGN_UPDATE_FAILED",
  providerNoAcceptance: "PROVIDER_NO_ACCEPTANCE",
  messageConflict: "EMAIL_MESSAGE_CONFLICT",
  templateLocaleMissing: "EMAIL_TEMPLATE_LOCALE_MISSING",
  messageRequired: "EMAIL_MESSAGE_REQUIRED",
  providerNetworkError: "PROVIDER_NETWORK_ERROR",
  sendFailed: "EMAIL_SEND_FAILED",
  testFailed: "EMAIL_PROVIDER_TEST_FAILED",
  providerCheckFailed: "PROVIDER_CHECK_FAILED",
  providerRejected: "PROVIDER_REJECTED",
  providerSmtpError: "PROVIDER_SMTP_ERROR",
  providerTemporaryError: "PROVIDER_TEMPORARY_ERROR",
  providerTimeout: "PROVIDER_TIMEOUT",
  unsafeProviderHost: "UNSAFE_PROVIDER_HOST",
  invalidProviderId: "INVALID_EMAIL_PROVIDER_ID",
  invalidTemplateId: "INVALID_EMAIL_TEMPLATE_ID",
  messageNotFound: "EMAIL_MESSAGE_NOT_FOUND",
} as const;

export const EMAIL_ENCRYPTION_OPTIONS = {
  ssl: "ssl",
  starttls: "starttls",
  none: "none",
} as const;

export const EMAIL_LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

export const EMAIL_LOCAL_HOST_SUFFIX = ".local";