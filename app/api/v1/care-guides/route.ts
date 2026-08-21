import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  createCareGuide,
  listCareGuidesAdmin,
} from "@/lib/services/service";
import {
  createCareGuideSchema,
  listCareGuidesQuerySchema,
} from "@/lib/validation/care-guides";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "care-guides.read",
    validate: { query: listCareGuidesQuerySchema },
  },
  async (_request, ctx) => {
    const query =
      ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { page, perPage, search, status } = query;
    const result = await listCareGuidesAdmin({ page, perPage, search, status });
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "care-guides.write",
    validate: { body: createCareGuideSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const guide = await createCareGuide(body);
    return jsonOk(guide, 201);
  },
);
