import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBookingCheckout } from "./booking-checkout";

const mocks = vi.hoisted(() => {
  const group: Array<{ status: string }> = [];
  const findFirst = vi.fn<() => Promise<Record<string, unknown> | undefined>>();
  const values = vi.fn<(_: Record<string, unknown>) => { returning: () => Promise<Array<{ id: string }>> }>();
  const request = vi.fn<(_: { amount: number }) => Promise<{ authority: string; paymentUrl: string }>>();
  const update = vi.fn(() => ({ set: () => ({ where: () => Promise.resolve() }) }));
  return { group, findFirst, values, request, update };
});
vi.mock("@/src/db", () => ({ db: {
  query: { paymentTransactions: { findFirst: mocks.findFirst } },
  select: () => ({ from: () => ({ where: () => Promise.resolve(mocks.group) }) }),
  insert: () => ({ values: mocks.values }), update: mocks.update,
} }));
vi.mock("@/lib/settings/loader", () => ({ loadSystemSettingsMap: () => Promise.resolve(new Map([["booking.price", "150000"]])) }));
vi.mock("./provider-service", () => ({ getPaymentProviderForUse: () => Promise.resolve({ id: "provider", callbackUrl: "https://example.com/callback" }) }));
vi.mock("./providers", () => ({ createPaymentProviderAdapter: () => ({ request: mocks.request }) }));

const input = { groupRef: "NF-12345", idempotencyKey: "checkout-test-key", locale: "fa" as const };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.group.length = 0;
  mocks.findFirst.mockResolvedValue(undefined);
  mocks.values.mockReturnValue({ returning: () => Promise.resolve([{ id: "transaction" }]) });
  mocks.request.mockResolvedValue({ authority: "gateway-id", paymentUrl: "https://example.com/pay" });
});

describe("single booking-group checkout deposit", () => {
  it.each([1, 3])("charges the configured deposit once for %i service lines", async (lineCount) => {
    mocks.group.push(...Array.from({ length: lineCount }, () => ({ status: "pending" })));
    const result = await createBookingCheckout(input);
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ amount: "150000", bookingGroupRef: input.groupRef }));
    expect(mocks.request).toHaveBeenCalledWith(expect.objectContaining({ amount: 1500000, orderId: input.groupRef }));
    expect(result.transactionId).toBe("transaction");
  });

  it("reuses an idempotent checkout without charging again", async () => {
    mocks.findFirst.mockResolvedValue({ id: "existing", status: "requested", paymentUrl: "https://example.com/existing", expiresAt: new Date(Date.now() + 60000) });
    const result = await createBookingCheckout(input);
    expect(result.transactionId).toBe("existing");
    expect(mocks.values).not.toHaveBeenCalled();
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it("does not charge an already-paid group", async () => {
    mocks.group.push({ status: "paid" });
    await expect(createBookingCheckout(input)).rejects.toMatchObject({ code: "BOOKING_ALREADY_PAID" });
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
