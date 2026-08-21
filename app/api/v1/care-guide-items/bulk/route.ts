import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  deleteCareGuideItem,
  findCareGuideItemIds,
  updateCareGuideItem,
} from "@/lib/services/service";
import { bulkCareGuideItemsSchema } from "@/lib/validation/care-guides";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "care-guides.manage",
    validate: { body: bulkCareGuideItemsSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body =
      ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const input = body;
    const ids =
      input.scope === "filtered"
        ? await findCareGuideItemIds({
            search: input.filters?.search,
            status: input.filters?.status,
            guideId: input.filters?.guideId,
          })
        : [...new Set(input.ids ?? [])];
    const failures: Array<{ id: string; code: string }> = [];

    for (const id of ids) {
      try {
        if (input.action === "activate") await updateCareGuideItem(id, { isActive: true });
        if (input.action === "deactivate") await updateCareGuideItem(id, { isActive: false });
        if (input.action === "delete") await deleteCareGuideItem(id);
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
