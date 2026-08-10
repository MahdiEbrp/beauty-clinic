import { describe, expect, it, vi } from "vitest";

import {
  ApiError,
  handleApiError,
  jsonError,
  jsonOk,
  withApiHandler,
} from "./errors";

const logError = vi.fn(() => {});
vi.mock("@/lib/log", () => ({
  logError: (...args: unknown[]) => logError(...args),
}));

async function responseBody(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

describe("ApiError", () => {
  it("exposes status, code, message and details", () => {
    const error = new ApiError(404, "USER_NOT_FOUND", "User not found.", { id: 1 });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(404);
    expect(error.code).toBe("USER_NOT_FOUND");
    expect(error.message).toBe("User not found.");
    expect(error.details).toEqual({ id: 1 });
  });

  it("defaults details to undefined", () => {
    const error = new ApiError(400, "BAD_REQUEST", "Bad request.");
    expect(error.details).toBeUndefined();
  });
});

describe("jsonOk", () => {
it("wraps data in a 200 JSON response", async () => {
    const response = jsonOk({ id: "u1" });
    expect(await responseBody(response)).toEqual({ data: { id: "u1" } });
  });
});

describe("jsonError", () => {
  it("builds an error envelope with the given status", async () => {
    const response = jsonError("NOT_FOUND", "Missing.", 404, { field: "id" });
    expect(response.status).toBe(404);
    expect(await responseBody(response)).toEqual({
      error: { code: "NOT_FOUND", message: "Missing.", details: { field: "id" } },
    });
  });

  it("omits details when none are provided", async () => {
    const response = jsonError("NOT_FOUND", "Missing.", 404);
    expect(await responseBody(response)).toEqual({
      error: { code: "NOT_FOUND", message: "Missing." },
    });
  });
});

describe("handleApiError", () => {
  it("passes ApiError through with its own status and code", async () => {
    const error = new ApiError(429, "RATE_LIMITED", "Slow down.", { retryAfter: 5 });
    const response = handleApiError(error, "req-1");
    expect(response.status).toBe(429);
    expect(await responseBody(response)).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Slow down.",
        details: { retryAfter: 5 },
      },
    });
    expect(logError).not.toHaveBeenCalled();
  });

  it("logs unexpected errors and returns a generic 500", async () => {
    const error = new Error("boom");
    const response = handleApiError(error, "req-1");
    expect(response.status).toBe(500);
    expect(await responseBody(response)).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong. Please try again later.",
      },
    });
    expect(logError).toHaveBeenCalledWith(
      "api.unhandled_error",
      expect.objectContaining({ requestId: "req-1", error: "boom" }),
    );
  });

  it("handles non-Error thrown values", () => {
    const response = handleApiError("just a string", "req-2");
    expect(response.status).toBe(500);
    expect(logError).toHaveBeenCalledWith(
      "api.unhandled_error",
      expect.objectContaining({ error: "just a string" }),
    );
  });
});

describe("withApiHandler", () => {
  it("adds x-request-id to successful responses", async () => {
    const handler = withApiHandler(() => jsonOk({ ok: true }));
    const response = await handler(new Request("http://localhost/api/v1/users"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(await responseBody(response)).toEqual({ data: { ok: true } });
  });

  it("converts thrown ApiErrors into error responses with the request id", async () => {
    const handler = withApiHandler(() => {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found.");
    });
    const response = await handler(new Request("http://localhost/api/v1/users"));
    expect(response.status).toBe(404);
    expect(response.headers.get("x-request-id")).toBeTruthy();
    expect(await responseBody(response)).toEqual({
      error: { code: "USER_NOT_FOUND", message: "User not found." },
    });
  });

  it("returns a generic 500 for unexpected errors", async () => {
    const handler = withApiHandler(() => {
      throw new Error("kaboom");
    });
    const response = await handler(new Request("http://localhost/api/v1/users"));
    expect(response.status).toBe(500);
    expect(await responseBody(response)).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test matcher
      error: { code: "INTERNAL_SERVER_ERROR", message: expect.any(String) },
    });
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });
});
