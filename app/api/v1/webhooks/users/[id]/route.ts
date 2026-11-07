import type { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, jsonOk, jsonError, handleApiError } from "@/lib/api/errors";
import { authenticateWebhook } from "@/lib/webhooks/service";
import { rateLimit } from "@/lib/api/rate-limit";
import { webhookUpdateUserStatusSchema } from "@/lib/webhooks/schema";
import {
  updateWebhookUserStatus,
  deleteWebhookUser,
} from "@/lib/webhooks/service";
import { logError, logInfo } from "@/lib/log";

export const runtime = "nodejs";

const RATE_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 };

function invalidId() {
  return jsonError("INVALID_USER_ID", "Invalid user id.", 400);
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
  { params }: { params: Promise<{ id: string }> },
  method: "PATCH" | "DELETE",
): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const reply = (response: NextResponse) => {
    response.headers.set("x-request-id", requestId);
    return response;
  };

  const { id } = await params;
  if (!id || !z.uuid().safeParse(id).success) return reply(invalidId());

  const authUser = await authenticateWebhook(request.headers.get("authorization"));
  if (id === authUser.id) {
    return reply(jsonError("SELF_LOCKOUT", "You cannot modify your own account.", 400));
  }

  try {
    if (method === "PATCH") {
      const { user } = await requireAuthAndPerm(request, "users.manage");
      await rateLimitCheck(user.id, `webhook:user:patch:${user.id}`, reply);

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
      const parsed = webhookUpdateUserStatusSchema.safeParse(body);
      if (!parsed.success) {
        return reply(jsonError("VALIDATION_ERROR", "Invalid request body.", 400));
      }
      await updateWebhookUserStatus(id, parsed.data);
      logInfo("webhook.user_updated", { requestId, userId: user.id, targetUserId: id });
      return reply(jsonOk({ ok: true }));
    }

    if (method === "DELETE") {
      const { user } = await requireAuthAndPerm(request, "users.manage");
      await rateLimitCheck(user.id, `webhook:user:delete:${user.id}`, reply);
      await deleteWebhookUser(id);
      logInfo("webhook.user_deleted", { requestId, userId: user.id, targetUserId: id });
      return reply(jsonOk({ ok: true }));
    }

    return reply(jsonError("METHOD_NOT_ALLOWED", "Method not allowed.", 405));
  } catch (error) {
    return reply(handleApiError(error, requestId));
  }
}

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) =>
  handler(request, { params }, "PATCH");
export const DELETE = async (request: Request, { params }: { params: Promise<{ id: string }> }) =>
  handler(request, { params }, "DELETE");
