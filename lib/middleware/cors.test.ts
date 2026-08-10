import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { applyCors, handlePreflight } from "./cors";

describe("applyCors", () => {
  beforeEach(() => {
    process.env.CORS_ORIGINS = "https://app.example.com,https://admin.example.com";
  });

  it("sets allow methods and headers on every response", () => {
    const response = new NextResponse(null);
    applyCors({ headers: new Headers() }, response);
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET,POST,PUT,PATCH,DELETE,OPTIONS");
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type,Authorization");
  });

  it("does not set allow-origin for a disallowed origin", () => {
    const response = new NextResponse(null);
    applyCors(
      { headers: new Headers({ origin: "https://evil.example.com" }) },
      response,
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBeNull();
  });

  it("sets allow-origin and credentials for an allowlisted origin", () => {
    const response = new NextResponse(null);
    applyCors(
      { headers: new Headers({ origin: "https://app.example.com" }) },
      response,
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://app.example.com");
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(response.headers.get("Vary")).toBe("Origin");
  });

  it("defaults to localhost when CORS_ORIGINS is unset", () => {
    delete process.env.CORS_ORIGINS;
    const response = new NextResponse(null);
    applyCors(
      { headers: new Headers({ origin: "http://localhost:3000" }) },
      response,
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
  });
});

describe("handlePreflight", () => {
  it("returns a 204 with cors headers for OPTIONS", () => {
    const request = new NextRequest("http://localhost:3000/api/v1/settings", {
      method: "OPTIONS",
      headers: { origin: "http://localhost:3000" },
    });
    const response = handlePreflight(request);
    expect(response).not.toBeNull();
    if (!response) return;
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
  });

  it("returns null for non-OPTIONS requests", () => {
    const request = new NextRequest("http://localhost:3000/api/v1/settings", {
      method: "GET",
    });
    expect(handlePreflight(request)).toBeNull();
  });
});
