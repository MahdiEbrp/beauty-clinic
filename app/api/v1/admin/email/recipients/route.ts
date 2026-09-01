import { jsonOk, withSecurity } from "@/lib/api/security";
import { listEmailRecipients } from "@/lib/email/report-service";
import { listEmailRecipientsQuerySchema } from "@/lib/validation/email-messages";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "email.send",
    validate: { query: listEmailRecipientsQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => {
      throw new Error("Query params are missing");
    })();
    return jsonOk(await listEmailRecipients(query));
  },
);