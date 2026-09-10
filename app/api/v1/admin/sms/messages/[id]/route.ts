import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { SMS_HTTP_STATUS } from "@/lib/sms/constants";
import { deleteSmsMessage } from "@/lib/sms/report-service";

export const runtime = "nodejs";

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "sms.manage",
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) {
      return jsonError("INVALID_SMS_MESSAGE_ID", "Invalid SMS message id.", SMS_HTTP_STATUS.badRequest);
    }
    await deleteSmsMessage(id);
    return jsonOk({ ok: true });
  },
);
