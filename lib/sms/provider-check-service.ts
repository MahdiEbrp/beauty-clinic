import { and, eq, isNull } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { decryptProviderSecret } from "@/lib/sms/crypto";
import { SMS_ERROR_CODES, SMS_ERROR_MESSAGES } from "@/lib/sms/constants";
import { normalizeIranianPhone } from "@/lib/sms/phone";
import {
  createSmsProviderAdapter,
  SmsProviderError,
} from "@/lib/sms/providers";
import { getSmsTemplateByKey } from "@/lib/sms/template-service";
import type { TestSmsProviderInput } from "@/lib/validation/sms";
import { db } from "@/src/db";
import { smsProviderChecks, smsProviders } from "@/src/db/schema";
import { getSmsProviderRow } from "./provider-service";

export type SmsProviderTestResult = {
  providerId: string;
  successful: boolean;
  responseTimeMs: number;
  providerMessageId?: string;
};

export async function testSmsProvider(
  providerId: string,
  input: TestSmsProviderInput,
  checkedBy: string,
): Promise<SmsProviderTestResult> {
  const row = await getSmsProviderRow(providerId);
  if (!row) throw new ApiError(404, SMS_ERROR_CODES.providerNotFound, SMS_ERROR_MESSAGES.providerNotFound);
  if (!row.isActive || row.deletedAt) {
    throw new ApiError(400, SMS_ERROR_CODES.providerInactive, SMS_ERROR_MESSAGES.providerInactive);
  }
  const recipient = normalizeIranianPhone(input.recipient);
  if (!recipient) throw new ApiError(400, SMS_ERROR_CODES.invalidRecipient, SMS_ERROR_MESSAGES.invalidRecipient);

  const provider = decryptProviderSecret(row);
  const adapter = createSmsProviderAdapter(provider);
  const startedAt = Date.now();
  try {
    // Line-number health is meaningless for SMS.ir OTP senders — free-text
    // bulk sends go through a sender line that commonly rejects with code 123.
    // The OTP template is the real delivery path, so probe it directly.
    const otpTemplate = await getSmsTemplateByKey("login-otp");
    const otpTemplateId = Number(otpTemplate?.externalTemplateId);
    const otpName = otpTemplate?.variables[0];
    const result =
      provider.kind === "sms_ir" &&
      Number.isInteger(otpTemplateId) &&
      otpName &&
      adapter.sendVerify
        ? await adapter.sendVerify({
            recipients: [recipient],
            templateId: otpTemplateId,
            parameters: [{ name: otpName, value: input.message }],
          })
        : await adapter.send({
            recipients: [recipient],
            message: input.message,
            sender: provider.sender ?? provider.credentials.lineNumber,
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
        "SMS_PROVIDER_TEST_FAILED",
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
    throw new ApiError(502, "SMS_PROVIDER_TEST_FAILED", safe.message);
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
      .update(smsProviders)
      .set({
        healthStatus: input.isSuccessful ? "healthy" : "unhealthy",
        lastHealthCheckedAt: new Date(),
        lastHealthError: input.isSuccessful ? null : input.errorMessage ?? SMS_ERROR_MESSAGES.providerCheckFailed,
        updatedAt: new Date(),
      })
      .where(and(eq(smsProviders.id, input.providerId), isNull(smsProviders.deletedAt)));
    await tx.insert(smsProviderChecks).values({
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
  if (error instanceof SmsProviderError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }
  return {
    code: SMS_ERROR_CODES.providerCheckFailed,
    message: SMS_ERROR_MESSAGES.providerCheckFailed,
  };
}
