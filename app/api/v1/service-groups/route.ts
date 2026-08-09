import { withSecurity, jsonOk } from "@/lib/api/security";
import { createGroup, listGroups } from "@/lib/services/service";
import { createServiceGroupSchema } from "@/lib/validation/services";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  async () => {
    const groups = await listGroups();
    return jsonOk(groups);
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
    const group = await createGroup(ctx.body!);
    return jsonOk(group, 201);
  },
);
