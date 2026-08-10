import { withSecurity, jsonOk } from "@/lib/api/security";
import { deleteForever, listTrash, trashEntry } from "@/lib/storage/service";
import { restoreSchema, trashSchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "files.manage",
  },
  async () => {
    const items = await listTrash();
    return jsonOk(items);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "files.manage",
    validate: { body: trashSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await trashEntry(body.path);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "files.manage",
    validate: { body: restoreSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await deleteForever(body.trashPath);
    return jsonOk({ ok: true });
  },
);
