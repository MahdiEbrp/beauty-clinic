import { withSecurity, jsonOk } from "@/lib/api/security";
import { createSocialLink, listSocialLinks } from "@/lib/social/admin";
import {
  createSocialLinkSchema,
  listSocialLinksQuerySchema,
} from "@/lib/validation/social-links";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "settings.read",
    validate: { query: listSocialLinksQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const result = await listSocialLinks({
      page: query.page,
      perPage: query.perPage,
      search: query.search,
      status: query.status,
    });
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "settings.write",
    validate: { body: createSocialLinkSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const result = await createSocialLink({
      url: body.url,
      imageUrl: body.imageUrl ?? null,
      labelFa: body.labelFa,
      labelEn: body.labelEn,
      displayOrder: body.displayOrder,
      isActive: body.isActive,
    });
    return jsonOk(result, 201);
  },
);