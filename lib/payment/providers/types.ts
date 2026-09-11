import type { PaymentProviderKind } from "@/src/db/schema";

export type PaymentProviderConfig = {
  kind: PaymentProviderKind;
  merchantId: string;
  apiUrl: string;
  callbackUrl?: string | null;
  credentials: { sandbox?: boolean; terminalId?: string; accessToken?: string };
};

export type PaymentRequestInput = {
  amount: number;
  description: string;
  callbackUrl: string;
  orderId: string;
  email?: string;
  mobile?: string;
};

export type PaymentRequestResult = {
  authority: string;
  paymentUrl: string;
  statusCode: number;
  providerStatus?: string;
};

export type PaymentVerifyInput = {
  authority: string;
  amount: number;
};

export type PaymentVerifyResult = {
  verified: boolean;
  refId?: string;
  cardPan?: string;
  code: number;
  providerStatus?: string;
};

export type PaymentProviderAdapter = {
  request(input: PaymentRequestInput): Promise<PaymentRequestResult>;
  verify(input: PaymentVerifyInput): Promise<PaymentVerifyResult>;
};

export class PaymentProviderError extends Error {
  code: string;
  statusCode?: number;
  retryable: boolean;
  constructor(message: string, code: string, statusCode?: number, retryable = false) {
    super(message);
    this.name = "PaymentProviderError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}
