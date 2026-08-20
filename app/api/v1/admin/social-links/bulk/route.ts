import { jsonOk, withSecurity } from "@/lib/api/security";
import {
  bulkDeleteSocialLinks,
  bulkUpdateSocialLinks,
  findSocialLinkIds,
} from "@/lib/social/admin";
import { bulkSocialLinksSchema } from "@/lib/validation/social-links";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "settings.manage",
    validate: { body: bulkSocialLinksSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const ids =
      body.scope === "filtered"
        ? await findSocialLinkIds(body.filters ?? {})
        : [...new Set(body.ids ?? [])];
    if (body.action === "delete") {
      await bulkDeleteSocialLinks(ids);
    } else {
      await bulkUpdateSocialLinks(ids, body.action);
    }
    return jsonOk({ requested: ids.length, succeeded: ids.length, failures: [] });
  },
);