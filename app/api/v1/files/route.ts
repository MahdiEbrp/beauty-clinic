import { withSecurity, jsonOk } from "@/lib/api/security";
import { listFolder } from "@/lib/storage/service";
import { listQuerySchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "files.read",
    validate: { query: listQuerySchema },
  },
  async (_request, ctx) => {
    const { path } = ctx.query!;
    const listing = await listFolder(path);
    return jsonOk(listing);
  },
);
