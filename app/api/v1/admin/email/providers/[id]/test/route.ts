import { z } from "zod";

import { clientIp } from "@/lib/api/request";
import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { EMAIL_ERROR_CODES, EMAIL_HTTP_STATUS, EMAIL_LIMITS } from "@/lib/email/constants";
import { testEmailProvider } from "@/lib/email/provider-check-service";
import { testEmailProviderSchema } from "@/lib/validation/email";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "email.send",
    validate: { body: testEmailProviderSchema },
    rateLimit: {
      limit: 10,
      windowMs: EMAIL_LIMITS.rateLimitWindowMs,
      key: (request) => `email-provider-test:${clientIp(request) ?? "unknown"}`,
    },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) {
      return jsonError(
        EMAIL_ERROR_CODES.invalidProviderId,
        "Invalid email provider id.",
        EMAIL_HTTP_STATUS.badRequest,
      );
    }
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    return jsonOk(await testEmailProvider(id, body, session.user.id));
  },
);