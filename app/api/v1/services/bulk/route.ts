import { withSecurity, jsonOk } from "@/lib/api/security";
import { findServiceIds } from "@/lib/services/services-admin";
import { deleteService, updateService } from "@/lib/services/service";
import { bulkServicesSchema } from "@/lib/validation/services-admin";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.manage",
    validate: { body: bulkServicesSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body =
      ctx.body ?? (() => {
        throw new Error("Validation body is missing");
      })();
    const input = body;
    const ids =
      input.scope === "filtered"
        ? await findServiceIds({
            search: input.filters?.search,
            status: input.filters?.status,
            featured: input.filters?.featured,
            categoryId: input.filters?.categoryId,
          })
        : [...new Set(input.ids ?? [])];
    const failures: Array<{ id: string; code: string }> = [];

    for (const id of ids) {
      try {
        if (input.action === "activate") await updateService(id, { isActive: true });
        if (input.action === "deactivate") await updateService(id, { isActive: false });
        if (input.action === "delete") await deleteService(id);
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
