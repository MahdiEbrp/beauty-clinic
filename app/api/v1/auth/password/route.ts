import { withSecurity, jsonOk } from "@/lib/api/security";
import { changeUserPassword } from "@/lib/users/service";
import { changePasswordSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const POST = withSecurity(
  { auth: "required", validate: { body: changePasswordSchema }, audit: true },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await changeUserPassword(session.user.id, body.password, false);
    return jsonOk({ ok: true });
  },
);
