import { clientIp } from "@/lib/api/request";
import { jsonOk, withSecurity } from "@/lib/api/security";
import { SMS_LIMITS } from "@/lib/sms/constants";
import { listSmsMessages } from "@/lib/sms/report-service";
import { sendSms } from "@/lib/sms/send-service";
import {
  listSmsMessagesQuerySchema,
  sendSmsSchema,
} from "@/lib/validation/sms";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "sms.read",
    validate: { query: listSmsMessagesQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    return jsonOk(await listSmsMessages(query));
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "sms.send",
    validate: { body: sendSmsSchema, bodyLimit: SMS_LIMITS.requestBodyLimitBytes },
    rateLimit: {
      limit: 10,
      windowMs: SMS_LIMITS.rateLimitWindowMs,
      key: (request) => `sms-send:${clientIp(request) ?? "unknown"}`,
    },
    audit: true,
  },
  async (_request, ctx) => {
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    return jsonOk(await sendSms(body, session.user.id), 201);
  },
);
