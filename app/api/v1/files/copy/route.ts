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
    await copyEntry(ctx.body!.path, ctx.body!.target);
    return jsonOk({ ok: true });
  },
);
