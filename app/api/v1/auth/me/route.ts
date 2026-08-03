import { withSecurity, jsonOk } from "@/lib/api/security";

export const runtime = "nodejs";

export const GET = withSecurity({ auth: "required" }, async (_request, ctx) => {
  return jsonOk({ user: ctx.session!.user });
});
