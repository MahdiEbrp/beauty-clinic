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
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    return jsonOk(await listSmsTemplates(query));
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "sms.write",
    validate: { body: createSmsTemplateSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const result = await createSmsTemplate(body, session.user.id);
    return jsonOk(result, 201);
  },
);
