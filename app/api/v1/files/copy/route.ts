import { withSecurity, jsonOk } from "@/lib/api/security";
import { copyEntry } from "@/lib/storage/service";
import { copySchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "files.write",
    validate: { body: copySchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await copyEntry(body.path, body.target);
    return jsonOk({ ok: true });
  },
);
