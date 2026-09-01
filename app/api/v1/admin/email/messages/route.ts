import { clientIp } from "@/lib/api/request";
import { jsonOk, withSecurity } from "@/lib/api/security";
import { EMAIL_LIMITS } from "@/lib/email/constants";
import { listEmailMessages } from "@/lib/email/report-service";
import { sendEmail } from "@/lib/email/send-service";
import {
  listEmailMessagesQuerySchema,
  sendEmailSchema,
} from "@/lib/validation/email";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "email.read",
    validate: { query: listEmailMessagesQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    return jsonOk(await listEmailMessages(query));
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "email.send",
    validate: { body: sendEmailSchema, bodyLimit: EMAIL_LIMITS.requestBodyLimitBytes },
    rateLimit: {
      limit: 10,
      windowMs: EMAIL_LIMITS.rateLimitWindowMs,
      key: (request) => `email-send:${clientIp(request) ?? "unknown"}`,
    },
    audit: true,
  },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    return jsonOk(await sendEmail(body, session.user.id), 201);
  },
);