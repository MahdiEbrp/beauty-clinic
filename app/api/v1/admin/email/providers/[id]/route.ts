import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  getEmailProviderById,
  softDeleteEmailProvider,
  updateEmailProvider,
} from "@/lib/email/provider-service";
import { updateEmailProviderSchema } from "@/lib/validation/email";
import { EMAIL_ERROR_CODES, EMAIL_ERROR_MESSAGES, EMAIL_HTTP_STATUS } from "@/lib/email/constants";

export const runtime = "nodejs";

function validId(value: string | undefined): value is string {
  return Boolean(value && z.uuid().safeParse(value).success);
}

export const GET = withSecurity(
  { auth: "required", permissions: "email.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(EMAIL_ERROR_CODES.invalidProviderId, "Invalid email provider id.", EMAIL_HTTP_STATUS.badRequest);
    const provider = await getEmailProviderById(id);
    if (!provider) return jsonError(EMAIL_ERROR_CODES.providerNotFound, EMAIL_ERROR_MESSAGES.providerNotFound, EMAIL_HTTP_STATUS.notFound);
    return jsonOk(provider);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "email.write",
    validate: { body: updateEmailProviderSchema },
    audit: true,
    notification: {
      entityType: "email_provider",
      entityId: (ctx) => ctx.params?.id,
      action: "updated",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(EMAIL_ERROR_CODES.invalidProviderId, "Invalid email provider id.", EMAIL_HTTP_STATUS.badRequest);
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateEmailProvider(id, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "email.manage",
    audit: true,
    notification: {
      entityType: "email_provider",
      entityId: (ctx) => ctx.params?.id,
      action: "deleted",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(EMAIL_ERROR_CODES.invalidProviderId, "Invalid email provider id.", EMAIL_HTTP_STATUS.badRequest);
    await softDeleteEmailProvider(id);
    return jsonOk({ ok: true });
  },
);