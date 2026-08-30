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
  async (_request, ctx) => jsonOk(await listSmsProviders(ctx.query!)),
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "sms.write",
    validate: { body: createSmsProviderSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const result = await createSmsProvider(ctx.body!, ctx.session!.user.id);
    return jsonOk(result, 201);
  },
);
