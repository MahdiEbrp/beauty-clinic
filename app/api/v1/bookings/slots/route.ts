import { jsonOk, withSecurity } from "@/lib/api/security";
import { createSlots, listSlots } from "@/lib/bookings/slots";
import {
  createSlotsSchema,
  listSlotsQuerySchema,
} from "@/lib/validation/bookings";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "appointments.read",
    validate: { query: listSlotsQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const slots = await listSlots(query);
    return jsonOk(slots);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "appointments.write",
    validate: { body: createSlotsSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const slots = await createSlots(body.slots, ctx.session?.user.id);
    return jsonOk(slots, 201);
  },
);
