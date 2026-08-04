import { withSecurity, jsonOk } from "@/lib/api/security";
import { listUsers } from "@/lib/users/service";
import { listUsersQuerySchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "users.read",
    validate: { query: listUsersQuerySchema },
  },
  async (_request, ctx) => {
    const { page, perPage, search, status } = ctx.query!;
    const result = await listUsers({ page, perPage, search, status });
    return jsonOk(result);
  },
);
