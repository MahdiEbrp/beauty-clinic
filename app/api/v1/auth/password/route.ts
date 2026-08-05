import { withSecurity, jsonOk } from "@/lib/api/security";
import { changeUserPassword } from "@/lib/users/service";
import { changePasswordSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const POST = withSecurity(
  { auth: "required", validate: { body: changePasswordSchema }, audit: true },
  async (_request, ctx) => {
    await changeUserPassword(ctx.session!.user.id, ctx.body!.password, false);
    return jsonOk({ ok: true });
  },
);
