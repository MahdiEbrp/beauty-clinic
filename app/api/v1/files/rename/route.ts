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
    const meta = await renameEntry(ctx.body!.path, ctx.body!.name);
    return jsonOk(meta);
  },
);
