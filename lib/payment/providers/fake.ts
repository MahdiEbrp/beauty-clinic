import { randomBytes } from "node:crypto";

import { logInfo } from "@/lib/log";
import type { PaymentProviderAdapter, PaymentProviderConfig, PaymentRequestInput, PaymentRequestResult, PaymentVerifyInput, PaymentVerifyResult } from "./types";

export function createFakeAdapter(config: PaymentProviderConfig): PaymentProviderAdapter {
  return {
    request: (input) => fakeRequest(config, input),
    verify: (input) => fakeVerify(config, input),
  };
}

async function fakeRequest(config: PaymentProviderConfig, input: PaymentRequestInput): Promise<PaymentRequestResult> {
  const authority = `FAKE-${randomBytes(6).toString("hex").toUpperCase()}`;
  logInfo("payment.fake.request", {
    providerKind: config.kind,
    orderId: input.orderId,
    amount: input.amount,
    authority,
  });
  return {
    authority,
    paymentUrl: `/fake/payment?authority=${authority}&order=${encodeURIComponent(input.orderId)}`,
    statusCode: 200,
    providerStatus: "Simulated payment request (no external gateway called).",
  };
}

async function fakeVerify(config: PaymentProviderConfig, input: PaymentVerifyInput): Promise<PaymentVerifyResult> {
  logInfo("payment.fake.verify", {
    providerKind: config.kind,
    authority: input.authority,
    amount: input.amount,
  });
  return {
    verified: true,
    refId: `FAKE-REF-${randomBytes(4).toString("hex").toUpperCase()}`,
    cardPan: "603799******1234",
    code: 100,
    providerStatus: "Simulated verification succeeded.",
  };
}
