import { withSecurity } from "@/lib/api/security";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { getLandingHero, updateHero } from "@/lib/landing/admin";
import { updateHeroSchema } from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  async () => {
    const hero = await getLandingHero();
    if (!hero) return jsonError("LANDING_HERO_NOT_FOUND", "Landing hero not found.", 404);
    return jsonOk(hero);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateHeroSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateHero(body);
    return jsonOk({ ok: true });
  },
);