import { randomBytes } from "node:crypto";

import { logInfo } from "@/lib/log";
import type { PaymentProviderAdapter, PaymentProviderConfig, PaymentRequestInput, PaymentRequestResult, PaymentVerifyInput, PaymentVerifyResult } from "./types";

export function createFakeAdapter(config: PaymentProviderConfig): PaymentProviderAdapter {
  return {
    request: (input) => Promise.resolve(fakeRequest(config, input)),
    verify: (input) => Promise.resolve(fakeVerify(config, input)),
  };
}

function fakeRequest(config: PaymentProviderConfig, input: PaymentRequestInput): PaymentRequestResult {
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

function fakeVerify(config: PaymentProviderConfig, input: PaymentVerifyInput): PaymentVerifyResult {
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
