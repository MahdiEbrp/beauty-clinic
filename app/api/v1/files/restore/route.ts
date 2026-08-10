import { withSecurity, jsonOk } from "@/lib/api/security";
import { restoreEntry } from "@/lib/storage/service";
import { restoreSchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "files.manage",
    validate: { body: restoreSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await restoreEntry(body.trashPath);
    return jsonOk({ ok: true });
  },
);
