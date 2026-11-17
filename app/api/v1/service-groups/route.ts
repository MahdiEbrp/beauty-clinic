import { withSecurity, jsonOk } from "@/lib/api/security";
import { createGroup, listServiceGroups } from "@/lib/services/service";
import { createServiceGroupSchema } from "@/lib/validation/services";
import { listServiceGroupsQuerySchema } from "@/lib/validation/service-groups-admin";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    // خواندن گروه‌های فعال توسط مدیریت خدمات (`services.read`) و همچنین توسط
    // ویرایشگران ساعت کاری / رزرو نوبت (`appointments.write`) مجاز است.
    anyPermissions: ["services.read", "appointments.write", "appointments.manage"],
    validate: { query: listServiceGroupsQuerySchema },
  },
  async (_request, ctx) => {
    const query =
      ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { page, perPage, search, status } = query;
    const result = await listServiceGroups({ page, perPage, search, status });
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: createServiceGroupSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const group = await createGroup(body);
    return jsonOk(group, 201);
  },
);
