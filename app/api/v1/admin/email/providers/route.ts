import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  createEmailProvider,
  listEmailProviders,
} from "@/lib/email/provider-service";
import {
  createEmailProviderSchema,
  listEmailProvidersQuerySchema,
} from "@/lib/validation/email";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "email.read",
    validate: { query: listEmailProvidersQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    return jsonOk(await listEmailProviders(query));
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "email.write",
    validate: { body: createEmailProviderSchema },
    audit: true,
    notification: {
      entityType: "email_provider",
      entityLabel: () => "New email provider created",
      action: "created",
    },
  },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const result = await createEmailProvider(body, session.user.id);
    return jsonOk(result, 201);
  },
);