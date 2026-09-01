import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { SMS_ERROR_CODES, SMS_PERMISSIONS } from "@/lib/sms/constants";
import {
  syncSmsMessageDelivery,
  toProviderError,
} from "@/lib/sms/provider-diagnostics-service";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: SMS_PERMISSIONS.write,
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id) return jsonError(SMS_ERROR_CODES.messageNotFound, "Message id is required.", 400);
    try {
      const status = await syncSmsMessageDelivery(id);
      if (status === null) {
        return jsonError(
          "PROVIDER_DELIVERY_UNKNOWN",
          "No provider delivery report is available for this message.",
          404,
        );
      }
      return jsonOk({ id, status });
    } catch (error) {
      const safe = toProviderError(error);
      return jsonError(safe.code, safe.message, 502);
    }
  },
);
