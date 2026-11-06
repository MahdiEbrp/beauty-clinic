import type { NextResponse } from "next/server";

import { withApiHandler, jsonOk, jsonError, handleApiError } from "@/lib/api/errors";
import { authenticateWebhook } from "@/lib/webhooks/service";
import { rateLimit } from "@/lib/api/rate-limit";
import {
  webhookCreateBookingSchema,
  webhookListBookingsQuerySchema,
} from "@/lib/webhooks/schema";
import {
  createWebhookBooking,
  listWebhookBookings,
} from "@/lib/webhooks/service";
import { logError, logInfo } from "@/lib/log";

export const runtime = "nodejs";

const WEBHOOK_RATE_LIMIT = {
  limit: 30,
  windowMs: 60 * 60 * 1000,
};

function requirePermission(
  user: { permissions: string[]; id: string },
  permission: string,
  requestId: string,
  reply: (response: NextResponse) => NextResponse,
): void {
  if (!user.permissions.includes(permission)) {
    logError("webhook.forbidden", {
      requestId,
      userId: user.id,
      permissions: user.permissions,
    });
    throw reply(
      jsonError(
        "FORBIDDEN",
        "Your account does not have permission for this action.",
        403,
      ),
    );
  }
}

async function rateLimited(
  userId: string,
  key: string,
  limit: number,
  windowMs: number,
  reply: (response: NextResponse) => NextResponse,
): Promise<void> {
  const rateResult = await rateLimit(key, limit, windowMs);
  if (!rateResult.allowed) {
    throw reply(
      jsonError("RATE_LIMITED", "Too many requests. Please try again later.", 429),
    );
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

/* ─────────────────────────────────────────────────────────────
 * GET /api/v1/webhooks/bookings — list bookings
 * ───────────────────────────────────────────────────────────── */

async function listHandler(request: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const reply = (response: NextResponse) => {
    response.headers.set("x-request-id", requestId);
    return response;
  };

  try {
    const authorization = request.headers.get("authorization");
    const user = await authenticateWebhook(authorization);

    await requirePermission(user, "appointments.read", requestId, reply);

    await rateLimited(
      user.id,
      `webhook:booking:list:${user.id}`,
      WEBHOOK_RATE_LIMIT.limit,
      WEBHOOK_RATE_LIMIT.windowMs,
      reply,
    );

    const { searchParams } = new URL(request.url);
    const query: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      query[key] = value;
    }

    const parsed = webhookListBookingsQuerySchema.safeParse(query);
    if (!parsed.success) {
      return reply(
        jsonError("VALIDATION_ERROR", "Invalid query parameters.", 400),
      );
    }

    const result = await listWebhookBookings(parsed.data);

    logInfo("webhook.bookings_listed", { requestId, userId: user.id });
    return reply(jsonOk(result));
  } catch (error) {
    return reply(handleApiError(error, requestId));
  }
}

/* ─────────────────────────────────────────────────────────────
 * POST /api/v1/webhooks/bookings — create booking
 * ───────────────────────────────────────────────────────────── */

async function createHandler(request: Request): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const reply = (response: NextResponse) => {
    response.headers.set("x-request-id", requestId);
    return response;
  };

  try {
    const authorization = request.headers.get("authorization");
    const user = await authenticateWebhook(authorization);

    await requirePermission(user, "appointments.write", requestId, reply);

    await rateLimited(
      user.id,
      `webhook:booking:create:${user.id}`,
      WEBHOOK_RATE_LIMIT.limit,
      WEBHOOK_RATE_LIMIT.windowMs,
      reply,
    );

    const body = await jsonBody(request, reply);

    const parsed = webhookCreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return reply(
        jsonError("VALIDATION_ERROR", "Invalid request body.", 400),
      );
    }

    const result = await createWebhookBooking(parsed.data, user.id);

    logInfo("webhook.booking_created", {
      requestId,
      userId: user.id,
      groupRef: result.groupRef,
    });

    return reply(jsonOk(result, 201));
  } catch (error) {
    return reply(handleApiError(error, requestId));
  }
}

export const GET = withApiHandler(listHandler);
export const POST = withApiHandler(createHandler);
