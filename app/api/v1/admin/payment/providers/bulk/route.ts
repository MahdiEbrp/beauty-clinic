import { jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteProviders,
  findProviderIds,
  setProvidersActive,
} from "@/lib/payment/provider-admin";
import { bulkPaymentProvidersSchema } from "@/lib/validation/payment-providers";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "payment.manage",
    validate: { body: bulkPaymentProvidersSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body =
      ctx.body ??
      (() => {
        throw new Error("Validation body is missing");
      })();
    const input = body;

    const ids =
      input.scope === "filtered"
        ? await findProviderIds(input.filters ?? {})
        : [...new Set(input.ids ?? [])];

    let blocked: string[] = [];
    try {
      if (input.action === "activate") await setProvidersActive(ids, true);
      else if (input.action === "deactivate")
        await setProvidersActive(ids, false);
      else blocked = await deleteProviders(ids);
    } catch {
      blocked = ids;
    }

    const failures = blocked.map((id) => ({
      id,
      code: "OPERATION_FAILED",
    }));
    return jsonOk({
      requested: ids.length,
      succeeded: ids.length - failures.length,
      failures,
    });
  },
);