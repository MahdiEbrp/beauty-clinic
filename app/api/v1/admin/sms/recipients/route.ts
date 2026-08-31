import { jsonOk, withSecurity } from "@/lib/api/security";
import { listSmsRecipients } from "@/lib/sms/report-service";
import { listSmsRecipientsQuerySchema } from "@/lib/validation/sms-messages";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "sms.send",
    validate: { query: listSmsRecipientsQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => {
      throw new Error("Query params are missing");
    })();
    return jsonOk(await listSmsRecipients(query));
  },
);
