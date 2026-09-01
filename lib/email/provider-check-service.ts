import { and, eq, isNull } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { decryptProviderSecret } from "@/lib/email/crypto";
import { EMAIL_ERROR_CODES, EMAIL_ERROR_MESSAGES } from "@/lib/email/constants";
import { normalizeEmail } from "@/lib/email/email";
import { createEmailProviderAdapter, EmailProviderError } from "@/lib/email/providers";
import type { TestEmailProviderInput } from "@/lib/validation/email";
import { db } from "@/src/db";
import { emailProviderChecks, emailProviders } from "@/src/db/schema";
import { getEmailProviderRow } from "./provider-service";

export type EmailProviderTestResult = {
  providerId: string;
  successful: boolean;
  responseTimeMs: number;
  providerMessageId?: string;
};

export async function testEmailProvider(
  providerId: string,
  input: TestEmailProviderInput,
  checkedBy: string,
): Promise<EmailProviderTestResult> {
  const row = await getEmailProviderRow(providerId);
  if (!row) {
    throw new ApiError(404, EMAIL_ERROR_CODES.providerNotFound, EMAIL_ERROR_MESSAGES.providerNotFound);
  }
  if (!row.isActive || row.deletedAt) {
    throw new ApiError(400, EMAIL_ERROR_CODES.providerInactive, EMAIL_ERROR_MESSAGES.providerInactive);
  }
  const recipient = normalizeEmail(input.recipient);
  if (!recipient) {
    throw new ApiError(400, EMAIL_ERROR_CODES.invalidRecipient, EMAIL_ERROR_MESSAGES.invalidRecipient);
  }

  const provider = decryptProviderSecret(row);
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
  const startedAt = Date.now();
  try {
    const result = await adapter.send({
      recipients: [recipient],
      subject: input.subject,
      message: input.message,
      templateType: "plain",
      fromEmail: provider.fromEmail,
    });
    const responseTimeMs = Date.now() - startedAt;
    const accepted = result.accepted[0];
    await recordProviderCheck({
      providerId,
      checkedBy,
      isSuccessful: Boolean(accepted) && result.rejected.length === 0,
      responseTimeMs,
      statusCode: result.statusCode,
      providerMessageId: accepted?.providerMessageId,
    });
    if (!accepted || result.rejected.length > 0) {
      throw new ApiError(
        502,
        "EMAIL_PROVIDER_TEST_FAILED",
        "The provider did not accept the test message.",
      );
    }
    return {
      providerId,
      successful: true,
      responseTimeMs,
      providerMessageId: accepted.providerMessageId,
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startedAt;
    const safe = toProviderFailure(error);
    await recordProviderCheck({
      providerId,
      checkedBy,
      isSuccessful: false,
      responseTimeMs,
      statusCode: safe.statusCode,
      errorCode: safe.code,
      errorMessage: safe.message,
    });
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, "EMAIL_PROVIDER_TEST_FAILED", safe.message);
  }
}

async function recordProviderCheck(input: {
  providerId: string;
  checkedBy: string;
  isSuccessful: boolean;
  responseTimeMs: number;
  statusCode?: number;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(emailProviders)
      .set({
        healthStatus: input.isSuccessful ? "healthy" : "unhealthy",
        lastHealthCheckedAt: new Date(),
        lastHealthError: input.isSuccessful ? null : input.errorMessage ?? EMAIL_ERROR_MESSAGES.providerCheckFailed,
        updatedAt: new Date(),
      })
      .where(and(eq(emailProviders.id, input.providerId), isNull(emailProviders.deletedAt)));
    await tx.insert(emailProviderChecks).values({
      providerId: input.providerId,
      checkedBy: input.checkedBy,
      isSuccessful: input.isSuccessful,
      responseTimeMs: input.responseTimeMs,
      statusCode: input.statusCode,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
    });
  });
}

function toProviderFailure(error: unknown): {
  code: string;
  message: string;
  statusCode?: number;
} {
  if (error instanceof EmailProviderError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }
  return {
    code: EMAIL_ERROR_CODES.providerCheckFailed,
    message: EMAIL_ERROR_MESSAGES.providerCheckFailed,
  };
}