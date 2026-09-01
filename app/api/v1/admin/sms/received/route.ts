import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { SMS_LIMITS, SMS_PERMISSIONS } from "@/lib/sms/constants";
import { toProviderError } from "@/lib/sms/provider-diagnostics-service";
import {
  listReceivedMessages,
  refreshReceivedMessages,
} from "@/lib/sms/received-service";

export const runtime = "nodejs";

const querySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce
      .number()
      .int()
      .min(1)
      .max(SMS_LIMITS.messageListPerPageMax)
      .default(SMS_LIMITS.messageListPerPageDefault),
    providerId: z.uuid().optional(),
  })
  .strict();

export const GET = withSecurity(
  {
    auth: "required",
    permissions: SMS_PERMISSIONS.read,
    validate: { query: querySchema },
  },
  async (_request, ctx) => {
    const result = await listReceivedMessages(ctx.query ?? { page: 1, perPage: SMS_LIMITS.messageListPerPageDefault });
    return jsonOk(result);
  },
);

const refreshSchema = z.object({ providerId: z.uuid() }).strict();

export const POST = withSecurity(
  {
    auth: "required",
    permissions: SMS_PERMISSIONS.write,
    validate: { body: refreshSchema },
    audit: true,
  },
  async (_request, ctx) => {
    try {
      const stored = await refreshReceivedMessages(ctx.body?.providerId ?? "");
      return jsonOk({ stored });
    } catch (error) {
      const safe = toProviderError(error);
      return jsonError(safe.code, safe.message, 502);
    }
  },
);
