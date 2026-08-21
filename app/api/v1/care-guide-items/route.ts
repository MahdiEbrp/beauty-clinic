import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  createCareGuideItem,
  listCareGuideItemsAdmin,
} from "@/lib/services/service";
import {
  createCareGuideItemSchema,
  listCareGuideItemsQuerySchema,
} from "@/lib/validation/care-guides";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "care-guides.read",
    validate: { query: listCareGuideItemsQuerySchema },
  },
  async (_request, ctx) => {
    const query =
      ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { page, perPage, search, status, guideId } = query;
    const result = await listCareGuideItemsAdmin({
      page,
      perPage,
      search,
      status,
      guideId,
    });
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "care-guides.write",
    validate: { body: createCareGuideItemSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const item = await createCareGuideItem(body);
    return jsonOk(item, 201);
  },
);
