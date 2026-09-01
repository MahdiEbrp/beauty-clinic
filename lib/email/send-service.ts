import { eq } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { logError, logInfo } from "@/lib/log";
import { EMAIL_ERROR_CODES, EMAIL_ERROR_MESSAGES, EMAIL_LIMITS } from "@/lib/email/constants";
import { encryptMessageContent } from "@/lib/email/crypto";
import { normalizeRecipients } from "@/lib/email/email";
import { getEmailLengthLabel } from "@/lib/email/message";
import { createEmailProviderAdapter, EmailProviderError } from "@/lib/email/providers";
import type { SendEmailInput } from "@/lib/validation/email";
import { db } from "@/src/db";
import { emailCampaigns, emailMessages, emailProviders } from "@/src/db/schema";
import { getEmailProviderForUse } from "./provider-service";
import { getEmailTemplateForUse, renderEmailTemplate } from "./template-service";
import {
  updateAcceptedEmailMessages,
  updateFailedEmailMessages,
} from "./send-message-updates";

export type EmailSendSummary = {
  campaignId: string;
  total: number;
  sent: number;
  failed: number;
  status: "sent" | "partial" | "failed";
  subject: string;
  characters: number;
};

export async function sendEmail(input: SendEmailInput, createdBy: string): Promise<EmailSendSummary> {
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

  const provider = await getEmailProviderForUse(input.providerId);
  const resolved = await resolveMessage(input);
  const fromEmail = input.fromEmail ?? provider.fromEmail ?? "";
  const length = getEmailLengthLabel(resolved.message);
  if (length.characters > EMAIL_LIMITS.messageMaxLength) {
    throw new ApiError(400, EMAIL_ERROR_CODES.messageTooLong, EMAIL_ERROR_MESSAGES.messageTooLong);
  }
  if (input.idempotencyKey) {
    const previous = await db.query.emailCampaigns.findFirst({
      where: eq(emailCampaigns.idempotencyKey, input.idempotencyKey),
    });
    if (previous) return summaryFromCampaign(previous, resolved.subject);
  }

  const [campaign] = await db
    .insert(emailCampaigns)
    .values({
      name: input.campaignName ?? null,
      providerId: provider.id,
      templateId: input.templateId ?? null,
      messageType: input.messageType,
      contentFormat: input.contentFormat,
      fromEmail: fromEmail || null,
      totalRecipients: normalized.recipients.length,
      status: "sending",
      idempotencyKey: input.idempotencyKey ?? null,
      createdBy,
    })
    .returning();
  if (!campaign) {
    throw new ApiError(500, EMAIL_ERROR_CODES.campaignCreateFailed, EMAIL_ERROR_MESSAGES.campaignCreateFailed);
  }

  const rows = normalized.recipients.map((recipient) => ({
    campaignId: campaign.id,
    providerId: provider.id,
    templateId: input.templateId ?? null,
    createdBy,
    ...encryptMessageContent(recipient, resolved.subject, resolved.message),
    fromEmail: fromEmail || null,
    status: "queued" as const,
  }));
  const inserted = await db
    .insert(emailMessages)
    .values(rows)
    .returning({ id: emailMessages.id, recipientHash: emailMessages.recipientHash });

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
  try {
    const result = await adapter.send({
      recipients: normalized.recipients,
      subject: resolved.subject,
      message: resolved.message,
      templateType: input.contentFormat,
      fromEmail,
    });
    const accepted = result.accepted;
    const acceptedSet = new Set(accepted.map((item) => item.recipient));
    const rejectedSet = new Set(result.rejected.map((item) => item.recipient));
    const unresolved = normalized.recipients.filter(
      (recipient) => !acceptedSet.has(recipient) && !rejectedSet.has(recipient),
    );
    const failedCount = result.rejected.length + unresolved.length;
    await updateAcceptedEmailMessages(inserted, accepted, result.statusCode);
    await updateFailedEmailMessages(
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
      .update(emailCampaigns)
      .set({
        status,
        sentCount: accepted.length,
        failedCount,
        updatedAt: new Date(),
        completedAt: new Date(),
      })
      .where(eq(emailCampaigns.id, campaign.id))
      .returning();
    if (!updatedCampaign) {
      throw new ApiError(500, EMAIL_ERROR_CODES.campaignUpdateFailed, EMAIL_ERROR_MESSAGES.campaignUpdateFailed);
    }
    await db
      .update(emailProviders)
      .set({
        healthStatus: accepted.length > 0 ? "healthy" : "unhealthy",
        lastHealthCheckedAt: new Date(),
        lastHealthError: accepted.length > 0 ? null : EMAIL_ERROR_MESSAGES.providerNoAcceptance,
        updatedAt: new Date(),
      })
      .where(eq(emailProviders.id, provider.id));
    logInfo("email.send.completed", {
      campaignId: campaign.id,
      providerId: provider.id,
      providerKind: provider.kind,
      contentFormat: input.contentFormat,
      total: normalized.recipients.length,
      sent: accepted.length,
      failed: failedCount,
      status,
      subject: resolved.subject,
    });
    return {
      campaignId: campaign.id,
      total: normalized.recipients.length,
      sent: accepted.length,
      failed: failedCount,
      status,
      subject: resolved.subject,
      characters: length.characters,
    };
  } catch (error) {
    const safe = providerFailure(error);
    await db
      .update(emailMessages)
      .set({
        status: "failed",
        errorCode: safe.code,
        errorMessage: safe.message,
        updatedAt: new Date(),
      })
      .where(eq(emailMessages.campaignId, campaign.id));
    await db
      .update(emailCampaigns)
      .set({
        status: "failed",
        failedCount: normalized.recipients.length,
        updatedAt: new Date(),
        completedAt: new Date(),
      })
      .where(eq(emailCampaigns.id, campaign.id));
    await db
      .update(emailProviders)
      .set({
        healthStatus: "unhealthy",
        lastHealthCheckedAt: new Date(),
        lastHealthError: safe.message,
        updatedAt: new Date(),
      })
      .where(eq(emailProviders.id, provider.id));
    logError("email.send.failed", {
      campaignId: campaign.id,
      providerId: provider.id,
      providerKind: provider.kind,
      code: safe.code,
      message: safe.message,
    });
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, "EMAIL_SEND_FAILED", safe.message);
  }
}

async function resolveMessage(input: SendEmailInput): Promise<{
  subject: string;
  message: string;
}> {
  if (input.templateId && input.message) {
    throw new ApiError(400, EMAIL_ERROR_CODES.messageConflict, EMAIL_ERROR_MESSAGES.messageConflict);
  }
  if (input.templateId) {
    const template = await getEmailTemplateForUse(input.templateId);
    const translation = template.translations[input.locale];
    if (!translation) {
      throw new ApiError(400, EMAIL_ERROR_CODES.templateLocaleMissing, EMAIL_ERROR_MESSAGES.templateLocaleMissing);
    }
    return {
      subject: renderEmailTemplate(translation.subject, input.variables),
      message: renderEmailTemplate(translation.content, input.variables),
    };
  }
  if (!input.message) {
    throw new ApiError(400, EMAIL_ERROR_CODES.messageRequired, EMAIL_ERROR_MESSAGES.messageRequired);
  }
  if (!input.subject || input.subject.length === EMAIL_LIMITS.emptyLength) {
    throw new ApiError(400, EMAIL_ERROR_CODES.messageRequired, EMAIL_ERROR_MESSAGES.invalidSubject);
  }
  return { subject: input.subject, message: input.message };
}

function providerFailure(error: unknown): { code: string; message: string } {
  if (error instanceof EmailProviderError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof ApiError) {
    return { code: error.code, message: error.message };
  }
  return { code: EMAIL_ERROR_CODES.providerNetworkError, message: EMAIL_ERROR_MESSAGES.providerNetworkError };
}

function summaryFromCampaign(
  campaign: typeof emailCampaigns.$inferSelect,
  subject: string,
): EmailSendSummary {
  const status = campaign.status === "sent" || campaign.status === "partial" || campaign.status === "failed"
    ? campaign.status
    : "failed";
  return {
    campaignId: campaign.id,
    total: campaign.totalRecipients,
    sent: campaign.sentCount,
    failed: campaign.failedCount,
    status,
    subject,
    characters: subject.length,
  };
}