import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  getSmsProviderById,
  softDeleteSmsProvider,
  updateSmsProvider,
} from "@/lib/sms/provider-service";
import { updateSmsProviderSchema } from "@/lib/validation/sms";
import { SMS_ERROR_CODES, SMS_ERROR_MESSAGES, SMS_HTTP_STATUS } from "@/lib/sms/constants";

export const runtime = "nodejs";

function validId(value: string | undefined): value is string {
  return Boolean(value && z.uuid().safeParse(value).success);
}

export const GET = withSecurity(
  { auth: "required", permissions: "sms.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(SMS_ERROR_CODES.invalidProviderId, "Invalid SMS provider id.", SMS_HTTP_STATUS.badRequest);
    const provider = await getSmsProviderById(id);
    if (!provider) return jsonError(SMS_ERROR_CODES.providerNotFound, SMS_ERROR_MESSAGES.providerNotFound, SMS_HTTP_STATUS.notFound);
    return jsonOk(provider);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "sms.write",
    validate: { body: updateSmsProviderSchema },
    audit: true,
    notification: {
      entityType: "sms_provider",
      entityId: (ctx) => ctx.params?.id,
      entityLabel: () => "SMS provider updated",
      action: "updated",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(SMS_ERROR_CODES.invalidProviderId, "Invalid SMS provider id.", SMS_HTTP_STATUS.badRequest);
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateSmsProvider(id, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "sms.manage",
    audit: true,
    notification: {
      entityType: "sms_provider",
      entityId: (ctx) => ctx.params?.id,
      entityLabel: () => "SMS provider deleted",
      action: "deleted",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(SMS_ERROR_CODES.invalidProviderId, "Invalid SMS provider id.", SMS_HTTP_STATUS.badRequest);
    await softDeleteSmsProvider(id);
    return jsonOk({ ok: true });
  },
);
