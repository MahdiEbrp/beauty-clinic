import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  createSmsProvider,
  listSmsProviders,
} from "@/lib/sms/provider-service";
import {
  createSmsProviderSchema,
  listSmsProvidersQuerySchema,
} from "@/lib/validation/sms";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "sms.read",
    validate: { query: listSmsProvidersQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    return jsonOk(await listSmsProviders(query));
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "sms.write",
    validate: { body: createSmsProviderSchema },
    audit: true,
    notification: {
      entityType: "sms_provider",
      action: "created",
    },
  },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const result = await createSmsProvider(body, session.user.id);
    return jsonOk(result, 201);
  },
);
