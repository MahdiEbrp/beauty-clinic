import { withSecurity, jsonOk } from "@/lib/api/security";
import { createFile } from "@/lib/storage/service";
import { createFileSchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "files.write",
    validate: { body: createFileSchema, bodyLimit: 8 * 1024 * 1024 },
    audit: true,
  },
  async (_request, ctx) => {
    const meta = await createFile(ctx.body!.path, ctx.body!.content);
    return jsonOk(meta, 201);
  },
);
