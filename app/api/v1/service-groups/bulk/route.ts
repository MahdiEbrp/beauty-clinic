import { withSecurity, jsonOk } from "@/lib/api/security";
import { deleteGroup, findGroupIds, updateGroup } from "@/lib/services/service";
import { bulkServiceGroupsSchema } from "@/lib/validation/service-groups-admin";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.manage",
    validate: { body: bulkServiceGroupsSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body =
      ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const input = body;
    const ids =
      input.scope === "filtered"
        ? await findGroupIds({
            search: input.filters?.search,
            status: input.filters?.status,
          })
        : [...new Set(input.ids ?? [])];
    const failures: Array<{ id: string; code: string }> = [];

    for (const id of ids) {
      try {
        if (input.action === "activate") await updateGroup(id, { isActive: true });
        if (input.action === "deactivate") await updateGroup(id, { isActive: false });
        if (input.action === "delete") await deleteGroup(id);
      } catch (error) {
        failures.push({
          id,
          code: error instanceof Error ? error.message : "OPERATION_FAILED",
        });
      }
    }

    return jsonOk({
      requested: ids.length,
      succeeded: ids.length - failures.length,
      failures,
    });
  },
);
