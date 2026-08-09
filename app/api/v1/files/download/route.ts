import fs from "node:fs";
import { Readable } from "node:stream";

import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity } from "@/lib/api/security";
import { download } from "@/lib/storage/service";
import { pathSchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "public",
    validate: { query: z.object({ path: pathSchema }).strict() },
  },
  async (_request, ctx) => {
    const target = await download(ctx.query!.path);
    const encoded = encodeURIComponent(target.name).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- target.path is confined by resolveSafePath/realPathWithin
    return new NextResponse(Readable.toWeb(fs.createReadStream(target.path)) as ReadableStream<Uint8Array>, {
      headers: {
        "Content-Type": target.mime,
        "Content-Length": String(target.size),
        "Content-Disposition": `attachment; filename*=UTF-8''${encoded}`,
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  },
);
