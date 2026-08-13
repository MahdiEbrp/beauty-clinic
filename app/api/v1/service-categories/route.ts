import { withSecurity, jsonOk } from "@/lib/api/security";
import { createCategory, listServiceCategories } from "@/lib/services/service";
import { createServiceCategorySchema } from "@/lib/validation/services";
import { listServiceCategoriesQuerySchema } from "@/lib/validation/service-categories-admin";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "services.read",
    validate: { query: listServiceCategoriesQuerySchema },
  },
  async (_request, ctx) => {
    const query =
      ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { page, perPage, search, status } = query;
    const result = await listServiceCategories({ page, perPage, search, status });
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: createServiceCategorySchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const category = await createCategory(body);
    return jsonOk(category, 201);
  },
);
