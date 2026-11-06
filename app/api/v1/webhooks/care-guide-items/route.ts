import type { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, withApiHandler, jsonOk, jsonError, handleApiError } from "@/lib/api/errors";
import { authenticateWebhook } from "@/lib/webhooks/service";
import { rateLimit } from "@/lib/api/rate-limit";
import {
  webhookListCareGuideItemsQuerySchema,
  webhookCreateCareGuideItemSchema,
} from "@/lib/webhooks/schema";
import {
  listWebhookCareGuideItems,
  createWebhookCareGuideItem,
} from "@/lib/webhooks/service";
import { logError, logInfo } from "@/lib/log";

export const runtime = "nodejs";

const RATE_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 };

async function requireAuthAndPerm(
  request: Request,
  permission: string,
): Promise<{ user: { id: string; permissions: string[] }; requestId: string }> {
  const requestId = crypto.randomUUID();
  const authorization = request.headers.get("authorization");
  const user = await authenticateWebhook(authorization);
  if (!user.permissions.includes(permission)) {
    logError("webhook.forbidden", { requestId, userId: user.id, permissions: user.permissions });
    throw new ApiError(403, "FORBIDDEN", "Insufficient permissions.");
  }
  return { user, requestId };
}

async function rateLimitCheck(
  userId: string,
  key: string,
  reply: (response: NextResponse) => NextResponse,
): Promise<void> {
  const rateResult = await rateLimit(key, RATE_LIMIT.limit, RATE_LIMIT.windowMs);
  if (!rateResult.allowed) {
    throw reply(jsonError("RATE_LIMITED", "Too many requests.", 429));
  }
}

async function jsonBody(request: Request, reply: (response: NextResponse) => NextResponse): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw reply(
      jsonError("UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.", 415),
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw reply(jsonError("INVALID_JSON", "Request body must be valid JSON.", 400));
  }
  return body;
}

async function handler(
  request: Request,
  method: "GET" | "POST",
): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const reply = (response: NextResponse) => {
    response.headers.set("x-request-id", requestId);
    return response;
  };

  try {
    if (method === "GET") {
      const { user } = await requireAuthAndPerm(request, "care-guides.read");
      await rateLimitCheck(user.id, `webhook:careguideitem:list:${user.id}`, reply);

      const { searchParams } = new URL(request.url);
      const query: Record<string, string> = {};
      for (const [key, value] of searchParams.entries()) {
        query[key] = value;
      }

      const parsed = webhookListCareGuideItemsQuerySchema.safeParse(query);
      if (!parsed.success) {
        return reply(jsonError("VALIDATION_ERROR", "Invalid query parameters.", 400));
      }

      const result = await listWebhookCareGuideItems(parsed.data, user.id);
      logInfo("webhook.careguideitems_listed", { requestId, userId: user.id });
      return reply(jsonOk(result));
    }

    if (method === "POST") {
      const { user } = await requireAuthAndPerm(request, "care-guides.write");
      await rateLimitCheck(user.id, `webhook:careguideitem:create:${user.id}`, reply);

      const body = await jsonBody(request, reply);
      const parsed = webhookCreateCareGuideItemSchema.safeParse(body);
      if (!parsed.success) {
        return reply(jsonError("VALIDATION_ERROR", "Invalid request body.", 400));
      }

      const result = await createWebhookCareGuideItem(parsed.data, user.id);
      logInfo("webhook.careguideitem_created", { requestId, userId: user.id });
      return reply(jsonOk(result, 201));
    }

    return reply(jsonError("METHOD_NOT_ALLOWED", "Method not allowed.", 405));
  } catch (error) {
    return reply(handleApiError(error, requestId));
  }
}

export const GET = withApiHandler((req) => handler(req, "GET"));
export const POST = withApiHandler((req) => handler(req, "POST"));
