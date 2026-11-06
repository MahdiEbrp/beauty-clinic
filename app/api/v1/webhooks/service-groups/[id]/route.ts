import type { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, jsonOk, jsonError, handleApiError } from "@/lib/api/errors";
import { authenticateWebhook } from "@/lib/webhooks/service";
import { rateLimit } from "@/lib/api/rate-limit";
import { webhookUpdateServiceGroupSchema } from "@/lib/webhooks/schema";
import {
  getWebhookServiceGroup,
  updateWebhookServiceGroup,
  deleteWebhookServiceGroup,
} from "@/lib/webhooks/service";
import { logError, logInfo } from "@/lib/log";

export const runtime = "nodejs";

const RATE_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 };

function invalidId() {
  return jsonError("INVALID_GROUP_ID", "Invalid service group id.", 400);
}

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

async function handler(
  request: Request,
  { params }: { params: { id: string } },
  method: "GET" | "PATCH" | "DELETE",
): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const reply = (response: NextResponse) => {
    response.headers.set("x-request-id", requestId);
    return response;
  };

  const id = params?.id;
  if (!id || !z.uuid().safeParse(id).success) return reply(invalidId());

  try {
    if (method === "GET") {
      const { user } = await requireAuthAndPerm(request, "services.read");
      await rateLimitCheck(user.id, `webhook:group:get:${user.id}`, reply);
      const group = await getWebhookServiceGroup(id);
      logInfo("webhook.group_get", { requestId, userId: user.id, groupId: id });
      return reply(jsonOk(group));
    }

    if (method === "PATCH") {
      const { user } = await requireAuthAndPerm(request, "services.write");
      await rateLimitCheck(user.id, `webhook:group:patch:${user.id}`, reply);

      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("application/json")) {
        return reply(
          jsonError("UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.", 415),
        );
      }
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return reply(jsonError("INVALID_JSON", "Request body must be valid JSON.", 400));
      }
      const parsed = webhookUpdateServiceGroupSchema.safeParse(body);
      if (!parsed.success) {
        return reply(jsonError("VALIDATION_ERROR", "Invalid request body.", 400));
      }
      await updateWebhookServiceGroup(id, parsed.data);
      logInfo("webhook.group_updated", { requestId, userId: user.id, groupId: id });
      return reply(jsonOk({ ok: true }));
    }

    if (method === "DELETE") {
      const { user } = await requireAuthAndPerm(request, "services.manage");
      await rateLimitCheck(user.id, `webhook:group:delete:${user.id}`, reply);
      await deleteWebhookServiceGroup(id);
      logInfo("webhook.group_deleted", { requestId, userId: user.id, groupId: id });
      return reply(jsonOk({ ok: true }));
    }

    return reply(jsonError("METHOD_NOT_ALLOWED", "Method not allowed.", 405));
  } catch (error) {
    return reply(handleApiError(error, requestId));
  }
}

export const GET = async (request: Request, { params }: { params: { id: string } }) =>
  handler(request, { params }, "GET");
export const PATCH = async (request: Request, { params }: { params: { id: string } }) =>
  handler(request, { params }, "PATCH");
export const DELETE = async (request: Request, { params }: { params: { id: string } }) =>
  handler(request, { params }, "DELETE");
