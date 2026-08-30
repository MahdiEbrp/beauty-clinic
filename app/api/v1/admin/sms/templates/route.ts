import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  createSmsTemplate,
  listSmsTemplates,
} from "@/lib/sms/template-service";
import {
  createSmsTemplateSchema,
  listSmsTemplatesQuerySchema,
} from "@/lib/validation/sms";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "sms.read",
    validate: { query: listSmsTemplatesQuerySchema },
  },
  async (_request, ctx) => jsonOk(await listSmsTemplates(ctx.query!)),
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "sms.write",
    validate: { body: createSmsTemplateSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const result = await createSmsTemplate(ctx.body!, ctx.session!.user.id);
    return jsonOk(result, 201);
  },
);
