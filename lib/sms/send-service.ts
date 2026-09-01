import { eq } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { logError, logInfo } from "@/lib/log";
import { SMS_ERROR_CODES, SMS_ERROR_MESSAGES, SMS_LIMITS } from "@/lib/sms/constants";
import {
  encryptMessageContent,
} from "@/lib/sms/crypto";
import { getSmsLengthLabel } from "@/lib/sms/message";
import { normalizeRecipients } from "@/lib/sms/phone";
import {
  createSmsProviderAdapter,
  SmsProviderError,
} from "@/lib/sms/providers";
import type { SendSmsInput } from "@/lib/validation/sms";
import { db } from "@/src/db";
import { smsCampaigns, smsMessages, smsProviders } from "@/src/db/schema";
import { getSmsProviderForUse } from "./provider-service";
import {
  updateAcceptedSmsMessages,
  updateFailedSmsMessages,
} from "./send-message-updates";
import { getSmsTemplateForUse, renderSmsTemplate } from "./template-service";

export type SmsSendSummary = {
  campaignId: string;
  total: number;
  sent: number;
  failed: number;
  status: "sent" | "partial" | "failed";
  message: string;
  parts: number;
  encoding: "gsm7" | "unicode";
};

export async function sendSms(input: SendSmsInput, createdBy: string): Promise<SmsSendSummary> {
  const normalized = normalizeRecipients(input.recipients);
  if (normalized.invalid.length > 0) {
    throw new ApiError(400, "INVALID_RECIPIENTS", "One or more recipients are invalid.", {
      invalidCount: normalized.invalid.length,
    });
  }
  if (normalized.duplicates.length > 0) {
    throw new ApiError(400, "DUPLICATE_RECIPIENTS", "Duplicate recipients are not allowed.", {
      duplicateCount: normalized.duplicates.length,
    });
  }

  const provider = await getSmsProviderForUse(input.providerId);
  const template = input.templateId
    ? await getSmsTemplateForUse(input.templateId)
    : null;
  const otpTemplateId = resolveOtpTemplateId(provider, template);
  const renderedMessage = otpTemplateId
    ? (template?.translations.fa?.content ?? input.message ?? "")
    : await resolveMessage(input);
  if (!otpTemplateId && renderedMessage.length > SMS_LIMITS.messageMaxLength) {
    throw new ApiError(400, SMS_ERROR_CODES.messageTooLong, SMS_ERROR_MESSAGES.messageTooLong);
  }
  const length = getSmsLengthLabel(renderedMessage);
  const verifyParameters = otpTemplateId
    ? buildVerifyParameters(template, input.variables)
    : [];
  if (input.idempotencyKey) {
    const previous = await db.query.smsCampaigns.findFirst({
      where: eq(smsCampaigns.idempotencyKey, input.idempotencyKey),
    });
    if (previous) return summaryFromCampaign(previous, renderedMessage);
  }

  const [campaign] = await db
    .insert(smsCampaigns)
    .values({
      name: input.campaignName ?? null,
      providerId: provider.id,
      templateId: input.templateId ?? null,
      messageType: input.messageType,
      sender: input.sender ?? provider.sender ?? provider.credentials.lineNumber ?? null,
      totalRecipients: normalized.recipients.length,
      status: "sending",
      idempotencyKey: input.idempotencyKey ?? null,
      createdBy,
    })
    .returning();
  if (!campaign) throw new ApiError(500, SMS_ERROR_CODES.campaignCreateFailed, SMS_ERROR_MESSAGES.campaignCreateFailed);

  const rows = normalized.recipients.map((recipient) => ({
    campaignId: campaign.id,
    providerId: provider.id,
    templateId: input.templateId ?? null,
    createdBy,
    ...encryptMessageContent(recipient, renderedMessage),
    sender: input.sender ?? provider.sender ?? provider.credentials.lineNumber ?? null,
    status: "queued" as const,
  }));
  const inserted = await db
    .insert(smsMessages)
    .values(rows)
    .returning({ id: smsMessages.id, recipientHash: smsMessages.recipientHash });

  const adapter = createSmsProviderAdapter(provider);
  try {
    const result =
      otpTemplateId && adapter.sendVerify
        ? await adapter.sendVerify({
            recipients: normalized.recipients,
            templateId: Number(otpTemplateId),
            parameters: verifyParameters,
          })
        : await adapter.send({
            recipients: normalized.recipients,
            message: renderedMessage,
            sender: input.sender ?? provider.sender ?? provider.credentials.lineNumber,
          });
    const accepted = result.accepted;
    const acceptedSet = new Set(accepted.map((item) => item.recipient));
    const rejectedSet = new Set(result.rejected.map((item) => item.recipient));
    const unresolved = normalized.recipients.filter(
      (recipient) => !acceptedSet.has(recipient) && !rejectedSet.has(recipient),
    );
    const failedCount = result.rejected.length + unresolved.length;
    await updateAcceptedSmsMessages(inserted, accepted, result.statusCode);
    await updateFailedSmsMessages(
      inserted,
      [...result.rejected.map((item) => item.recipient), ...unresolved],
      result.rejected[0]?.code ?? "PROVIDER_NO_ACCEPTANCE",
    );
    const status =
      accepted.length === 0
        ? "failed"
        : failedCount > 0
          ? "partial"
          : "sent";
    const [updatedCampaign] = await db
      .update(smsCampaigns)
      .set({
        status,
        sentCount: accepted.length,
        failedCount,
        updatedAt: new Date(),
        completedAt: new Date(),
      })
      .where(eq(smsCampaigns.id, campaign.id))
      .returning();
    if (!updatedCampaign) throw new ApiError(500, SMS_ERROR_CODES.campaignUpdateFailed, SMS_ERROR_MESSAGES.campaignUpdateFailed);
    await db
      .update(smsProviders)
      .set({
        healthStatus: accepted.length > 0 ? "healthy" : "unhealthy",
        lastHealthCheckedAt: new Date(),
        lastHealthError: accepted.length > 0 ? null : SMS_ERROR_MESSAGES.providerNoAcceptance,
        updatedAt: new Date(),
      })
      .where(eq(smsProviders.id, provider.id));
    logInfo("sms.send.completed", {
      campaignId: campaign.id,
      providerId: provider.id,
      providerKind: provider.kind,
      otpTemplateId: otpTemplateId ?? null,
      total: normalized.recipients.length,
      sent: accepted.length,
      failed: failedCount,
      status,
      parts: length.parts,
      encoding: length.encoding,
    });
    return {
      campaignId: campaign.id,
      total: normalized.recipients.length,
      sent: accepted.length,
      failed: failedCount,
      status,
      message: renderedMessage,
      parts: length.parts,
      encoding: length.encoding,
    };
  } catch (error) {
    const safe = providerFailure(error);
    await db
      .update(smsMessages)
      .set({
        status: "failed",
        errorCode: safe.code,
        errorMessage: safe.message,
        updatedAt: new Date(),
      })
      .where(eq(smsMessages.campaignId, campaign.id));
    await db
      .update(smsCampaigns)
      .set({
        status: "failed",
        failedCount: normalized.recipients.length,
        updatedAt: new Date(),
        completedAt: new Date(),
      })
      .where(eq(smsCampaigns.id, campaign.id));
    await db
      .update(smsProviders)
      .set({
        healthStatus: "unhealthy",
        lastHealthCheckedAt: new Date(),
        lastHealthError: safe.message,
        updatedAt: new Date(),
      })
      .where(eq(smsProviders.id, provider.id));
    logError("sms.send.failed", {
      campaignId: campaign.id,
      providerId: provider.id,
      providerKind: provider.kind,
      code: safe.code,
      message: safe.message,
    });
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, "SMS_SEND_FAILED", safe.message);
  }
}

async function resolveMessage(input: SendSmsInput): Promise<string> {
  if (input.templateId && input.message) {
    throw new ApiError(400, SMS_ERROR_CODES.messageConflict, SMS_ERROR_MESSAGES.messageConflict);
  }
  if (input.templateId) {
    const template = await getSmsTemplateForUse(input.templateId);
    const translation = template.translations[input.locale];
    if (!translation) {
      throw new ApiError(400, SMS_ERROR_CODES.templateLocaleMissing, SMS_ERROR_MESSAGES.templateLocaleMissing);
    }
    return renderSmsTemplate(translation.content, input.variables);
  }
  if (!input.message) throw new ApiError(400, SMS_ERROR_CODES.messageRequired, SMS_ERROR_MESSAGES.messageRequired);
  return input.message;
}

function providerFailure(error: unknown): { code: string; message: string } {
  if (error instanceof SmsProviderError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof ApiError) {
    return { code: error.code, message: error.message };
  }
  return { code: SMS_ERROR_CODES.providerNetworkError, message: SMS_ERROR_MESSAGES.providerNetworkError };
}

/** SMS.ir OTP uses a remote template id instead of free-text; only for sms_ir. */
function resolveOtpTemplateId(
  provider: { kind: string },
  template: Awaited<ReturnType<typeof getSmsTemplateForUse>> | null,
): string | null {
  return provider.kind === "sms_ir" && template?.externalTemplateId
    ? template.externalTemplateId
    : null;
}

/** Turn the app template's named variables into SMS.ir verify parameters. */
function buildVerifyParameters(
  template: Awaited<ReturnType<typeof getSmsTemplateForUse>> | null,
  variables: Record<string, string> | undefined,
): Array<{ name: string; value: string }> {
  const names = template?.variables ?? [];
  return names.map((name) => {
    const value = variables?.[name]?.trim() ?? "";
    if (value.length === 0) {
      throw new ApiError(400, "SMS_OTP_PARAM_MISSING", `Missing template value: ${name}.`);
    }
    if (value.length > SMS_IR_PARAM_VALUE_MAX) {
      throw new ApiError(
        400,
        "SMS_OTP_PARAM_TOO_LONG",
        `Template value "${name}" exceeds the 25-character limit.`,
      );
    }
    return { name, value };
  });
}

const SMS_IR_PARAM_VALUE_MAX = 25;

function summaryFromCampaign(
  campaign: typeof smsCampaigns.$inferSelect,
  message: string,
): SmsSendSummary {
  const length = getSmsLengthLabel(message);
  const status = campaign.status === "sent" || campaign.status === "partial" || campaign.status === "failed"
    ? campaign.status
    : "failed";
  return {
    campaignId: campaign.id,
    total: campaign.totalRecipients,
    sent: campaign.sentCount,
    failed: campaign.failedCount,
    status,
    message,
    parts: length.parts,
    encoding: length.encoding,
  };
}
