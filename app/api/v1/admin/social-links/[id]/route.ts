import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteSocialLink,
  getSocialLinkById,
  updateSocialLink,
} from "@/lib/social/admin";
import { updateSocialLinkSchema } from "@/lib/validation/social-links";

export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function badId(): ReturnType<typeof jsonError> {
  return jsonError("INVALID_ID", "Invalid social link id.", 400);
}

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "settings.read",
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !UUID_PATTERN.test(id)) return badId();
    const link = await getSocialLinkById(id);
    if (!link) return jsonError("SOCIAL_LINK_NOT_FOUND", "Social link not found.", 404);
    return jsonOk({ link });
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "settings.write",
    validate: { body: updateSocialLinkSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !UUID_PATTERN.test(id)) return badId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateSocialLink(id, {
      url: body.url,
      imageUrl: body.imageUrl,
      labelFa: body.labelFa,
      labelEn: body.labelEn,
      displayOrder: body.displayOrder,
      isActive: body.isActive,
    });
    return jsonOk({ updated: true });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "settings.manage",
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !UUID_PATTERN.test(id)) return badId();
    await deleteSocialLink(id);
    return jsonOk({ deleted: true });
  },
);