import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  createEmailTemplate,
  listEmailTemplates,
} from "@/lib/email/template-service";
import {
  createEmailTemplateSchema,
  listEmailTemplatesQuerySchema,
} from "@/lib/validation/email";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "email.read",
    validate: { query: listEmailTemplatesQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    return jsonOk(await listEmailTemplates(query));
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "email.write",
    validate: { body: createEmailTemplateSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const result = await createEmailTemplate(body, session.user.id);
    return jsonOk(result, 201);
  },
);