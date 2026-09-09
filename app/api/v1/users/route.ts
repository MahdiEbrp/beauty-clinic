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
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { page, perPage, search, status, role } = query;
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
    notification: {
      entityType: "user",
      entityId: (ctx) => (ctx.body as { email?: string } | undefined)?.email,
      action: "created",
    },
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const user = await createUser(body, session.user.permissions);
    return jsonOk(user, 201);
  },
);
