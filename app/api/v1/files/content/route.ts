import { withSecurity, jsonOk } from "@/lib/api/security";
import { readTextContent, writeTextContent } from "@/lib/storage/service";
import { contentSchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "files.read",
    validate: { query: contentSchema },
  },
  async (_request, ctx) => {
    const content = await readTextContent(ctx.query!.path);
    return jsonOk(content);
  },
);

export const PUT = withSecurity(
  {
    auth: "required",
    permissions: "files.write",
    validate: { body: contentSchema, bodyLimit: 8 * 1024 * 1024 },
    audit: true,
  },
  async (_request, ctx) => {
    const meta = await writeTextContent(ctx.body!.path, ctx.body!.content);
    return jsonOk(meta);
  },
);
