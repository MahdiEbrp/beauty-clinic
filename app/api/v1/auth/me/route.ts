import { withSecurity, jsonOk } from "@/lib/api/security";

export const runtime = "nodejs";

export const GET = withSecurity({ auth: "required" }, (_request, ctx) => {
  const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
  return jsonOk({ user: session.user });
});
