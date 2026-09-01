import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  getEmailTemplateById,
  softDeleteEmailTemplate,
  updateEmailTemplate,
} from "@/lib/email/template-service";
import { updateEmailTemplateSchema } from "@/lib/validation/email";
import { EMAIL_ERROR_CODES, EMAIL_ERROR_MESSAGES, EMAIL_HTTP_STATUS } from "@/lib/email/constants";

export const runtime = "nodejs";

function validId(value: string | undefined): value is string {
  return Boolean(value && z.uuid().safeParse(value).success);
}

export const GET = withSecurity(
  { auth: "required", permissions: "email.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(EMAIL_ERROR_CODES.invalidTemplateId, "Invalid email template id.", EMAIL_HTTP_STATUS.badRequest);
    const template = await getEmailTemplateById(id);
    if (!template) return jsonError(EMAIL_ERROR_CODES.templateNotFound, EMAIL_ERROR_MESSAGES.templateNotFound, EMAIL_HTTP_STATUS.notFound);
    return jsonOk(template);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "email.write",
    validate: { body: updateEmailTemplateSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(EMAIL_ERROR_CODES.invalidTemplateId, "Invalid email template id.", EMAIL_HTTP_STATUS.badRequest);
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateEmailTemplate(id, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "email.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(EMAIL_ERROR_CODES.invalidTemplateId, "Invalid email template id.", EMAIL_HTTP_STATUS.badRequest);
    await softDeleteEmailTemplate(id);
    return jsonOk({ ok: true });
  },
);