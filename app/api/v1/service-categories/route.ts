import { withSecurity, jsonOk } from "@/lib/api/security";
import { createCategory, listCategories } from "@/lib/services/service";
import { createServiceCategorySchema } from "@/lib/validation/services";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  async () => {
    const categories = await listCategories();
    return jsonOk(categories);
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
