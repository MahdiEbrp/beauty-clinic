import { withSecurity, jsonOk } from "@/lib/api/security";
import { renameEntry } from "@/lib/storage/service";
import { renameSchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "files.write",
    validate: { body: renameSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const meta = await renameEntry(body.path, body.name);
    return jsonOk(meta);
  },
);
