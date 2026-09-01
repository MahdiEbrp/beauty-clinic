import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { SMS_PERMISSIONS } from "@/lib/sms/constants";
import {
  getSmsProviderDiagnostics,
  toProviderError,
} from "@/lib/sms/provider-diagnostics-service";

export const runtime = "nodejs";

const querySchema = z.object({ providerId: z.uuid() }).strict();

export const GET = withSecurity(
  {
    auth: "required",
    permissions: SMS_PERMISSIONS.read,
    validate: { query: querySchema },
  },
  async (_request, ctx) => {
    try {
      const diagnostics = await getSmsProviderDiagnostics(ctx.query?.providerId ?? "");
      if (!diagnostics) {
        return jsonError(
          "PROVIDER_DIAGNOSTICS_UNSUPPORTED",
          "This provider does not expose account diagnostics.",
          400,
        );
      }
      return jsonOk(diagnostics);
    } catch (error) {
      const safe = toProviderError(error);
      return jsonError(safe.code, safe.message, 502);
    }
  },
);
