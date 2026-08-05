import { withSecurity, jsonOk } from "@/lib/api/security";
import { createUser, listUsers } from "@/lib/users/service";
import { createUserSchema, listUsersQuerySchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "users.read",
    validate: { query: listUsersQuerySchema },
  },
  async (_request, ctx) => {
    const { page, perPage, search, status, role } = ctx.query!;
    const result = await listUsers({ page, perPage, search, status, role });
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "users.write",
    validate: { body: createUserSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const user = await createUser(ctx.body!);
    return jsonOk(user, 201);
  },
);
