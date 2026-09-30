import { afterEach, describe, expect, it, vi } from "vitest";

import { createLiaraAdapter, resolveEndpoint } from "./liara";
import type { EmailProviderConfig } from "./types";
import { EmailProviderError } from "./types";

const CONFIG: EmailProviderConfig = {
  kind: "liara",
  host: "https://mail-service.liara.ir/api/v1/mails",
  port: 443,
  username: "6abcc627fce0bfd3ba863cbe",
  password: "secret-token",
  encryption: "ssl",
  fromEmail: "admin@nafasbeautyclinic.ir",
  fromName: null,
};

function jsonResponse(body: unknown, status = 201): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveEndpoint", () => {
  it("appends the server id and /messages to a base URL", () => {
    expect(resolveEndpoint("https://mail-service.liara.ir/api/v1/mails/", "abc")).toBe(
      "https://mail-service.liara.ir/api/v1/mails/abc/messages",
    );
  });

  it("keeps an endpoint that already includes the server id", () => {
    const endpoint = "https://mail-service.liara.ir/api/v1/mails/abc/messages";
    expect(resolveEndpoint(endpoint, "abc")).toBe(endpoint);
  });
});

describe("Liara email adapter", () => {
  it("posts one request per recipient with the bearer token and payload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ status: "success" }));

    const adapter = createLiaraAdapter(CONFIG);
    const result = await adapter.send({
      recipients: ["one@example.com", "two@example.com"],
      subject: "Hello",
      message: "<p>Hi</p>",
      templateType: "html",
      fromEmail: "admin@nafasbeautyclinic.ir",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://mail-service.liara.ir/api/v1/mails/6abcc627fce0bfd3ba863cbe/messages",
    );
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer secret-token");
    expect(headers["x-liara-tag"]).toBe("transactional");
    expect(JSON.parse(String((init as RequestInit).body))).toMatchObject({
      to: "one@example.com",
      from: "admin@nafasbeautyclinic.ir",
      subject: "Hello",
      html: "<p>Hi</p>",
      attachments: [],
    });

    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(0);
    expect(result.statusCode).toBe(201);
  });

  it("marks a recipient rejected when the API responds with an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ statusCode: 401, message: "Invalid token" }, 401),
    );

    const adapter = createLiaraAdapter(CONFIG);
    const result = await adapter.send({
      recipients: ["one@example.com"],
      subject: "Hello",
      message: "Hi",
      templateType: "plain",
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].code).toBe("PROVIDER_REJECTED");
    expect(result.statusCode).toBe(401);
  });

  it("throws a network error when the request cannot be made", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));

    const adapter = createLiaraAdapter(CONFIG);
    await expect(
      adapter.send({
        recipients: ["one@example.com"],
        subject: "Hello",
        message: "Hi",
        templateType: "plain",
      }),
    ).rejects.toThrow(EmailProviderError);
  });
});
