import { afterEach, describe, expect, it, vi } from "vitest";

import { createSmsIrAdapter, resolveEndpoint } from "./sms-ir";
import { SMS_PROVIDER_PROTOCOL } from "@/lib/sms/constants";
import type { SmsProviderConfig } from "./types";
import { SmsProviderError } from "./types";

const BULK_PATH = SMS_PROVIDER_PROTOCOL.smsIr.bulkPath;

const CONFIG: SmsProviderConfig = {
  kind: "sms_ir",
  apiUrl: "https://api.sms.ir/v1",
  token: "secret-token",
  credentials: { lineNumber: "30004505000017" },
  sender: null,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SMS.ir adapter", () => {
  it("sends the x-api-key header and mobiles payload", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        status: 1,
        message: "موفق",
        data: { packId: "p1", messageIds: [111, 222], cost: 2 },
      }),
    );

    const adapter = createSmsIrAdapter(CONFIG);
    const result = await adapter.send({
      recipients: ["09120000001", "09120000002"],
      message: "Hello",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("https://api.sms.ir/v1/send/bulk");
    const init = call[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("secret-token");
    expect(JSON.parse(String(init.body))).toEqual({
      lineNumber: "30004505000017",
      messageText: "Hello",
      mobiles: ["09120000001", "09120000002"],
    });

    expect(result.accepted).toHaveLength(2);
    expect(result.accepted[0].providerMessageId).toBe("111");
    expect(result.accepted[1].providerMessageId).toBe("222");
    expect(result.rejected).toHaveLength(0);
  });

  it("chunks recipients into batches of at most 100", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          status: 1,
          message: "موفق",
          data: {
            messageIds: Array.from({ length: 100 }, (_, i) => i + 1),
            cost: 100,
          },
        }),
      ),
    );

    const recipients = Array.from(
      { length: 250 },
      (_, i) => `0912${String(i).padStart(7, "0")}`,
    );
    const adapter = createSmsIrAdapter(CONFIG);
    const result = await adapter.send({ recipients, message: "Bulk" });

    expect(fetchMock.mock.calls).toHaveLength(3);
    expect(result.accepted).toHaveLength(250);
  });

  it("maps a non-1 status code to a provider error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ status: 102, message: "اعتبار کافی نیست", data: null }),
    );

    const adapter = createSmsIrAdapter(CONFIG);
    const attempt = adapter.send({ recipients: ["09120000001"], message: "Hi" });
    await expect(attempt).rejects.toThrow(SmsProviderError);
    await expect(attempt).rejects.toThrow(/credit/i);
  });

  it("resolves base, full, and /send/ URLs to the bulk endpoint", () => {
    expect(resolveEndpoint("https://api.sms.ir/v1", BULK_PATH)).toBe(
      "https://api.sms.ir/v1/send/bulk",
    );
    expect(
      resolveEndpoint("https://api.sms.ir/v1/send/bulk", BULK_PATH),
    ).toBe("https://api.sms.ir/v1/send/bulk");
    expect(
      resolveEndpoint("https://api.sms.ir/v1/send/bulk", "/send/verify"),
    ).toBe("https://api.sms.ir/v1/send/verify");
  });
});
describe("SMS.ir OTP verify", () => {
  it("sends templateId and parameters to /send/verify per recipient", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        jsonResponse({ status: 1, message: "موفق", data: { messageId: 9001, cost: 1 } }),
      ),
    );

    const adapter = createSmsIrAdapter(CONFIG);
    const result = await adapter.sendVerify({
      recipients: ["09120000001", "09120000002"],
      templateId: 123456,
      parameters: [{ name: "Code", value: "4821" }],
    });

    expect(fetchMock.mock.calls).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.sms.ir/v1/send/verify");
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      mobile: "09120000001",
      templateId: 123456,
      parameters: [{ name: "Code", value: "4821" }],
    });
    expect(result.accepted).toHaveLength(2);
    expect(result.accepted[0].providerMessageId).toBe("9001");
  });

  it("reads credit and lines from account endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const href = String(url);
      if (href.endsWith("/credit")) {
        return Promise.resolve(jsonResponse({ status: 1, data: 165.3 }));
      }
      if (href.endsWith("/line")) {
        return Promise.resolve(jsonResponse({ status: 1, data: [30004505000017] }));
      }
      return Promise.resolve(jsonResponse({ status: 0, data: null }));
    });

    const adapter = createSmsIrAdapter(CONFIG);
    expect(await adapter.getCredit()).toBe(165.3);
    expect(await adapter.getLines()).toEqual(["30004505000017"]);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.sms.ir/v1/credit");
  });
});
