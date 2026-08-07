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
    const { path } = ctx.query!;
    const listing = await listFolder(path);
    const response = jsonOk(listing);
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    return response;
  },
);
