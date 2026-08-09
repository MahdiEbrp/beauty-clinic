import { withSecurity, jsonOk } from "@/lib/api/security";
import { createService, listServices } from "@/lib/services/service";
import {
  createServiceSchema,
  listServicesQuerySchema,
} from "@/lib/validation/services";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "services.read",
    validate: { query: listServicesQuerySchema },
  },
  async (_request, ctx) => {
    const result = await listServices(ctx.query!);
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: createServiceSchema, bodyLimit: 512 * 1024 },
    audit: true,
  },
  async (_request, ctx) => {
    const service = await createService(ctx.body!);
    return jsonOk(service, 201);
  },
);
