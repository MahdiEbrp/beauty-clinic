import { NextResponse } from "next/server";
import { z } from "zod";

import { hasPermission } from "@/lib/auth/rbac";
import { getSession, type AuthSession } from "@/lib/auth/dal";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { isSameOrigin, readJsonBody } from "@/lib/api/request";
import { rateLimit } from "@/lib/api/rate-limit";
import { logError } from "@/lib/log";

export { jsonError, jsonOk };

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type SecurityConfig<Body = unknown, Query = unknown> = {
  auth?: "public" | "required";
  permissions?: string | readonly string[];
  csrf?: boolean;
  rateLimit?: {
    limit: number;
    windowMs: number;
    key: (request: Request) => string;
  };
  validate?: {
    body?: z.ZodType<Body>;
    query?: z.ZodType<Query>;
    /** JSON body byte cap for this route (defaults to 64 KB). */
    bodyLimit?: number;
  };
  audit?: boolean;
};

export type ApiContext<Body = unknown, Query = unknown> = {
  requestId: string;
  session?: AuthSession;
  body?: Body;
  query?: Query;
  /** Resolved dynamic route params (e.g. `[id]`), when the route has them. */
  params?: Record<string, string>;
};

type SecurityHandler<Body, Query> = (
  request: Request,
  ctx: ApiContext<Body, Query>,
) => Promise<NextResponse> | NextResponse;

function requestPath(request: Request): string {
  return new URL(request.url).pathname;
}

/**
 * Centralized security pipeline for API routes.
 *
 * Order of enforcement: CSRF (defense-in-depth, also enforced at the edge) →
 * rate limit → authentication → authorization → body/query validation → handler.
 * Replaces the old `withApiHandler`; also generates the request id and centralizes
 * error handling, so handlers contain zero security plumbing.
 */
export function withSecurity<Body = unknown, Query = unknown>(
  config: SecurityConfig<Body, Query>,
  handler: SecurityHandler<Body, Query>,
) {
  return async (
    request: Request,
    routeContext?: { params?: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const reply = (response: NextResponse) => {
      response.headers.set("x-request-id", requestId);
      return response;
    };

    try {
      if (config.csrf !== false && MUTATION_METHODS.has(request.method)) {
        if (!isSameOrigin(request)) {
          logError("api.csrf_blocked", {
            requestId,
            method: request.method,
            path: requestPath(request),
          });
          return reply(jsonError("CROSS_ORIGIN_FORBIDDEN", "Request origin is not allowed.", 403));
        }
      }

      if (config.rateLimit) {
        const key = config.rateLimit.key(request);
        const result = await rateLimit(key, config.rateLimit.limit, config.rateLimit.windowMs);
        if (!result.allowed) {
          logError("api.rate_limited", { requestId, key });
          const response = jsonError(
            "RATE_LIMITED",
            "Too many attempts. Please try again later.",
            429,
          );
          response.headers.set(
            "retry-after",
            String(Math.max(1, Math.ceil(result.retryAfterMs / 1000))),
          );
          return reply(response);
        }
      }

      const ctx: ApiContext<Body, Query> = { requestId };
      if (routeContext?.params) {
        ctx.params = await routeContext.params;
      }

      if (config.auth === "required") {
        const session = await getSession();
        if (!session) {
          logError("api.auth_failed", {
            requestId,
            method: request.method,
            path: requestPath(request),
          });
          return reply(jsonError("UNAUTHORIZED", "Not authenticated.", 401));
        }
        ctx.session = session;

        if (config.permissions && config.permissions.length > 0) {
          if (!hasPermission(session.user.permissions, config.permissions)) {
            logError("api.forbidden", {
              requestId,
              userId: session.user.id,
              permissions: config.permissions,
            });
            return reply(jsonError("FORBIDDEN", "You do not have permission to perform this action.", 403));
          }
        }
      }

      if (config.validate?.body) {
        const body = await readJsonBody(request, config.validate.bodyLimit);
        const parsed = config.validate.body.safeParse(body);
        if (!parsed.success) {
          return reply(
            jsonError(
              "VALIDATION_ERROR",
              "Invalid request body.",
              400,
              parsed.error.flatten().fieldErrors,
            ),
          );
        }
        ctx.body = parsed.data;
      }

      if (config.validate?.query) {
        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams);
        const parsed = config.validate.query.safeParse(params);
        if (!parsed.success) {
          return reply(
            jsonError(
              "VALIDATION_ERROR",
              "Invalid query parameters.",
              400,
              parsed.error.flatten().fieldErrors,
            ),
          );
        }
        ctx.query = parsed.data;
      }

      const response = await handler(request, ctx);

      if (config.audit && MUTATION_METHODS.has(request.method)) {
        logError("api.audit", {
          requestId,
          method: request.method,
          path: requestPath(request),
          status: response.status,
          userId: ctx.session?.user.id,
        });
      }

      return reply(response);
    } catch (error) {
      return reply(handleApiError(error, requestId));
    }
  };
}
