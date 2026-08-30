import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  getSmsTemplateById,
  softDeleteSmsTemplate,
  updateSmsTemplate,
} from "@/lib/sms/template-service";
import { updateSmsTemplateSchema } from "@/lib/validation/sms";
import { SMS_ERROR_CODES, SMS_ERROR_MESSAGES, SMS_HTTP_STATUS } from "@/lib/sms/constants";

export const runtime = "nodejs";

function validId(value: string | undefined): value is string {
  return Boolean(value && z.uuid().safeParse(value).success);
}

export const GET = withSecurity(
  { auth: "required", permissions: "sms.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(SMS_ERROR_CODES.invalidTemplateId, "Invalid SMS template id.", SMS_HTTP_STATUS.badRequest);
    const template = await getSmsTemplateById(id);
    if (!template) return jsonError(SMS_ERROR_CODES.templateNotFound, SMS_ERROR_MESSAGES.templateNotFound, SMS_HTTP_STATUS.notFound);
    return jsonOk(template);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "sms.write",
    validate: { body: updateSmsTemplateSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(SMS_ERROR_CODES.invalidTemplateId, "Invalid SMS template id.", SMS_HTTP_STATUS.badRequest);
    await updateSmsTemplate(id, ctx.body!);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "sms.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!validId(id)) return jsonError(SMS_ERROR_CODES.invalidTemplateId, "Invalid SMS template id.", SMS_HTTP_STATUS.badRequest);
    await softDeleteSmsTemplate(id);
    return jsonOk({ ok: true });
  },
);
