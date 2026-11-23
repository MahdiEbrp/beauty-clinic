import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as NextServer from "next/server";

const { verify, notify, after } = vi.hoisted(() => ({
  verify: vi.fn(), notify: vi.fn(), after: vi.fn<(callback: () => Promise<void>) => void>(),
}));
vi.mock("next/server", async (importOriginal) => ({
  ...await importOriginal<typeof NextServer>(), after,
}));
vi.mock("@/lib/payment/transaction-service", () => ({ verifyPaymentTransaction: verify }));
vi.mock("@/lib/notifications/booking-notifier", () => ({ notifyNewReservation: notify }));

import { GET, POST } from "./route";

const origin = "https://nafasbeautyclinic.ir";
const request = (query = "") => new Request(`http://0.0.0.0:3000/api/v1/payments/callback${query}`);
beforeEach(() => vi.resetAllMocks());

describe("payment callback public redirect origin", () => {
  it("redirects missing authority without invoking verification", async () => {
    const response = await GET(request());
    expect(response.headers.get("location")).toBe(`${origin}/payment/failed?reason=missing_authority`);
    expect(verify).not.toHaveBeenCalled();
  });

  it.each(["Authority", "authority", "token"])("verifies %s server-side even when query status says failed", async (key) => {
    verify.mockResolvedValue({ verified: true, newlyVerified: false, locale: "en" });
    const response = await GET(request(`?${key}=abc%26x&status=failed`));
    expect(verify).toHaveBeenCalledWith("abc&x");
    expect(response.headers.get("location")).toBe(`${origin}/en/payment/success?authority=abc%26x`);
    expect(after).not.toHaveBeenCalled();
  });

  it("uses the provider's failure result despite query success", async () => {
    verify.mockResolvedValue({ verified: false, newlyVerified: false, locale: "fa" });
    const response = await GET(request("?token=abc&status=success"));
    expect(response.headers.get("location")).toBe(`${origin}/payment/failed?authority=abc`);
    expect(after).not.toHaveBeenCalled();
  });

  it("redirects verification exceptions to the public failure page", async () => {
    verify.mockRejectedValue(new Error("Provider unavailable"));
    const response = await GET(request("?token=abc"));
    expect(response.headers.get("location")).toBe(`${origin}/payment/failed?authority=abc`);
  });

  it("supports POST and schedules notifications only for newly verified payments", async () => {
    verify.mockResolvedValue({ verified: true, newlyVerified: true, locale: "fa", bookingGroupRef: "group" });
    const response = await POST(request("?token=abc"));
    expect(response.headers.get("location")).toBe(`${origin}/payment/success?authority=abc`);
    expect(after).toHaveBeenCalledOnce();
    await after.mock.calls[0][0]();
    expect(notify).toHaveBeenCalledWith({ groupRef: "group", locale: "fa" });
  });
});
