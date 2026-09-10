import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import { EMAIL_HTTP_STATUS } from "@/lib/email/constants";
import { deleteEmailMessage } from "@/lib/email/report-service";

export const runtime = "nodejs";

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "email.manage",
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) {
      return jsonError("INVALID_EMAIL_MESSAGE_ID", "Invalid email message id.", EMAIL_HTTP_STATUS.badRequest);
    }
    await deleteEmailMessage(id);
    return jsonOk({ ok: true });
  },
);
