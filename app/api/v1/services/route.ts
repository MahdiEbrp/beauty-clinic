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
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const result = await listServices(query);
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: createServiceSchema, bodyLimit: 512 * 1024 },
    audit: true,
    notification: {
      entityType: "service",
      entityId: (ctx) => (ctx.body as { title?: string } | undefined)?.title,
      entityLabel: () => "New service created",
      action: "created",
    },
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const service = await createService(body);
    return jsonOk(service, 201);
  },
);
