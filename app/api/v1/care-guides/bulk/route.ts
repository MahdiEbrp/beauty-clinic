import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  deleteCareGuide,
  findGuideIds,
  updateCareGuide,
} from "@/lib/services/service";
import { bulkCareGuidesSchema } from "@/lib/validation/care-guides";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "care-guides.manage",
    validate: { body: bulkCareGuidesSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body =
      ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const input = body;
    const ids =
      input.scope === "filtered"
        ? await findGuideIds({
            search: input.filters?.search,
            status: input.filters?.status,
          })
        : [...new Set(input.ids ?? [])];
    const failures: Array<{ id: string; code: string }> = [];

    for (const id of ids) {
      try {
        if (input.action === "activate") await updateCareGuide(id, { isActive: true });
        if (input.action === "deactivate") await updateCareGuide(id, { isActive: false });
        if (input.action === "delete") await deleteCareGuide(id);
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
