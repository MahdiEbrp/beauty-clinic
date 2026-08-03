import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity } from "./security";
import { getSession, type AuthSession } from "@/lib/auth/dal";

vi.mock("@/lib/auth/dal", () => ({
  getSession: vi.fn(),
}));

const mockGetSession = vi.mocked(getSession);

const SESSION: AuthSession = {
  userId: "550e8400-e29b-41d4-a716-446655440001",
  user: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "user@example.com",
    fullName: "Regular User",
    roles: ["customer"],
    permissions: [],
  },
};

const ADMIN: AuthSession = {
  ...SESSION,
  user: { ...SESSION.user, permissions: ["settings.manage"] },
};

const testBodySchema = z.object({ name: z.string().min(1) }).strict();
const testQuerySchema = z.object({ page: z.coerce.number().int().min(1) }).strict();

function makeRequest(
  method: string,
  opts?: { origin?: string; body?: unknown },
): Request {
  const headers = new Headers({ host: "localhost:3000" });
  if (opts?.origin) headers.set("origin", opts.origin);
  if (opts?.body !== undefined) headers.set("content-type", "application/json");

  const init: RequestInit = { method, headers };
  if (opts?.body !== undefined) init.body = JSON.stringify(opts.body);

  return new Request("http://localhost:3000/api/v1/test", init);
}

const okResponse = () => NextResponse.json({ ok: true });

describe("withSecurity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks cross-origin mutations with 403", async () => {
    const handler = withSecurity({}, async () => {
      throw new Error("should not run");
    });
    const response = await handler(
      makeRequest("POST", { origin: "https://evil.example.com" }),
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      error: { code: "CROSS_ORIGIN_FORBIDDEN" },
    });
  });

  it("allows same-origin mutations when csrf is enabled", async () => {
    const handler = withSecurity({}, okResponse);
    const response = await handler(
      makeRequest("POST", { origin: "http://localhost:3000" }),
    );
    expect(response.status).toBe(200);
  });

  it("does not apply csrf to GET requests", async () => {
    const handler = withSecurity({}, okResponse);
    const response = await handler(
      makeRequest("GET", { origin: "https://evil.example.com" }),
    );
    expect(response.status).toBe(200);
  });

  it("rate limits when the configured budget is exceeded", async () => {
    const handler = withSecurity(
      { rateLimit: { limit: 1, windowMs: 60_000, key: () => "test" } },
      okResponse,
    );
    const first = await handler(makeRequest("GET"));
    const second = await handler(makeRequest("GET"));
    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
  });

  it("returns 401 when auth is required and no session exists", async () => {
    mockGetSession.mockResolvedValue(null);
    const handler = withSecurity({ auth: "required" }, okResponse);
    const response = await handler(makeRequest("GET"));
    expect(response.status).toBe(401);
  });

  it("injects the session for an authenticated request", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    let seen: AuthSession | undefined;
    const handler = withSecurity({ auth: "required" }, async (_req, ctx) => {
      seen = ctx.session;
      return okResponse();
    });
    const response = await handler(makeRequest("GET"));
    expect(response.status).toBe(200);
    expect(seen?.user.id).toBe(SESSION.user.id);
  });

  it("returns 403 when the user lacks a required permission", async () => {
    mockGetSession.mockResolvedValue(SESSION);
    const handler = withSecurity(
      { auth: "required", permissions: "settings.manage" },
      okResponse,
    );
    const response = await handler(makeRequest("GET"));
    expect(response.status).toBe(403);
  });

  it("passes when the user has the required permission", async () => {
    mockGetSession.mockResolvedValue(ADMIN);
    const handler = withSecurity(
      { auth: "required", permissions: "settings.manage" },
      okResponse,
    );
    const response = await handler(makeRequest("GET"));
    expect(response.status).toBe(200);
  });

  it("returns 400 for an invalid request body and injects valid bodies", async () => {
    const handler = withSecurity(
      { validate: { body: testBodySchema } },
      async (_req, ctx) => {
        expect(ctx.body).toEqual({ name: "alice" });
        return okResponse();
      },
    );

    const invalid = await handler(
      makeRequest("POST", { origin: "http://localhost:3000", body: { name: "" } }),
    );
    expect(invalid.status).toBe(400);

    const valid = await handler(
      makeRequest("POST", { origin: "http://localhost:3000", body: { name: "alice" } }),
    );
    expect(valid.status).toBe(200);
  });

  it("returns 415 for a non-JSON body when body validation is enabled", async () => {
    const handler = withSecurity({ validate: { body: testBodySchema } }, okResponse);
    const request = new Request("http://localhost:3000/api/v1/test", {
      method: "POST",
      headers: { host: "localhost:3000", origin: "http://localhost:3000" },
      body: "not json",
    });
    const response = await handler(request);
    expect(response.status).toBe(415);
  });

  it("returns 400 for invalid query params and injects valid queries", async () => {
    const handler = withSecurity(
      { validate: { query: testQuerySchema } },
      async (_req, ctx) => {
        expect(ctx.query).toEqual({ page: 3 });
        return okResponse();
      },
    );

    const invalid = await handler(
      new Request("http://localhost:3000/api/v1/test?page=abc", { method: "GET" }),
    );
    expect(invalid.status).toBe(400);

    const valid = await handler(
      new Request("http://localhost:3000/api/v1/test?page=3", { method: "GET" }),
    );
    expect(valid.status).toBe(200);
  });

  it("sets the x-request-id header on error responses", async () => {
    mockGetSession.mockResolvedValue(null);
    const handler = withSecurity({ auth: "required" }, okResponse);
    const response = await handler(makeRequest("GET"));
    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("converts unexpected handler errors into a generic 500", async () => {
    const handler = withSecurity({}, async () => {
      throw new Error("boom");
    });
    const response = await handler(makeRequest("GET"));
    expect(response.status).toBe(500);
  });
});
