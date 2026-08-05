import { NextResponse } from "next/server";

import { logError } from "@/lib/log";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonOk(data: unknown, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function jsonError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status },
  );
}

export function handleApiError(error: unknown, requestId: string): NextResponse {
  if (error instanceof ApiError) {
    return jsonError(error.code, error.message, error.status, error.details);
  }

  logError("api.unhandled_error", {
    requestId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return jsonError(
    "INTERNAL_SERVER_ERROR",
    "Something went wrong. Please try again later.",
    500,
  );
}

type ApiHandler = (
  request: Request,
  ctx: { requestId: string },
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a route handler with a request id (returned as `x-request-id`) and
 * centralized error handling: client errors keep their status, unexpected
 * errors are logged server-side and returned as a generic 500.
 */
export function withApiHandler(handler: ApiHandler) {
  return async (request: Request): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    try {
      const response = await handler(request, { requestId });
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      const response = handleApiError(error, requestId);
      response.headers.set("x-request-id", requestId);
      return response;
    }
  };
}
