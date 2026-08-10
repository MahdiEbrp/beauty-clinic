import { withSecurity, jsonOk } from "@/lib/api/security";
import { listFolder } from "@/lib/storage/service";
import { listQuerySchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "public",
    validate: { query: listQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { path } = query;
    const listing = await listFolder(path);
    const response = jsonOk(listing);
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    return response;
  },
);
