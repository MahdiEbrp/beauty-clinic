import fs from "node:fs";
import { Readable } from "node:stream";

import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity } from "@/lib/api/security";
import { download } from "@/lib/storage/service";
import { isPreviewable } from "@/lib/storage/mime";
import { pathSchema } from "@/lib/validation/files";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "public",
    validate: { query: z.object({ path: pathSchema }).strict() },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const target = await download(query.path);
    const encoded = encodeURIComponent(target.name).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
    const disposition = isPreviewable(target.mime) ? "inline" : "attachment";

    return new NextResponse(Readable.toWeb(fs.createReadStream(target.path)) as ReadableStream<Uint8Array>, {
      headers: {
        "Content-Type": target.mime,
        "Content-Length": String(target.size),
        "Content-Disposition": `${disposition}; filename*=UTF-8''${encoded}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  },
);
