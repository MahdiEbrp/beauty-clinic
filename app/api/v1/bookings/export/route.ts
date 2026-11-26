import { NextResponse } from "next/server";

import { withSecurity } from "@/lib/api/security";
import { exportBookingsToXlsx } from "@/lib/bookings/export";
import { exportBookingsQuerySchema } from "@/lib/validation/bookings";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "appointments.read",
    validate: { query: exportBookingsQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { buffer, filename } = await exportBookingsToXlsx(query);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
);
