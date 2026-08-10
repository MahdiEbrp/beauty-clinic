import { withSecurity, jsonOk } from "@/lib/api/security";
import { ensureFolder } from "@/lib/storage/service";
import { createFolderSchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "files.write",
    validate: { body: createFolderSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const meta = await ensureFolder(body.path);
    return jsonOk(meta, 201);
  },
);
