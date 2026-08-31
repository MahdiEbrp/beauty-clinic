import { z } from "zod";

import { clientIp } from "@/lib/api/request";
import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { SMS_ERROR_CODES, SMS_HTTP_STATUS, SMS_LIMITS } from "@/lib/sms/constants";
import { testSmsProvider } from "@/lib/sms/provider-check-service";
import { testSmsProviderSchema } from "@/lib/validation/sms";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "sms.send",
    validate: { body: testSmsProviderSchema },
    rateLimit: {
      limit: 10,
      windowMs: SMS_LIMITS.rateLimitWindowMs,
      key: (request) => `sms-provider-test:${clientIp(request) ?? "unknown"}`,
    },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) {
      return jsonError(
        SMS_ERROR_CODES.invalidProviderId,
        "Invalid SMS provider id.",
        SMS_HTTP_STATUS.badRequest,
      );
    }
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    return jsonOk(await testSmsProvider(id, body, session.user.id));
  },
);
