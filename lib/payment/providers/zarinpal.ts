import { PAYMENT_ERROR_CODES, PAYMENT_ERROR_MESSAGES, PAYMENT_PROVIDER_PROTOCOL } from "../constants";
import { requestPaymentProvider } from "./http";
import type { PaymentProviderAdapter, PaymentProviderConfig, PaymentRequestInput, PaymentRequestResult, PaymentVerifyInput, PaymentVerifyResult } from "./types";
import { PaymentProviderError } from "./types";

type ZarinpalRequestResponse = {
  data: { code: number; message: string; authority: string; fee_type: string; fee: number };
  errors: unknown[];
};
type ZarinpalVerifyResponse = {
  data: { code: number; message: string; card_pan?: string; card_hash?: string; ref_id?: number; fee_type?: string; fee?: number };
  errors: unknown[];
};

export function createZarinpalAdapter(config: PaymentProviderConfig): PaymentProviderAdapter {
  return {
    request: (input) => requestZarinpal(config, input),
    verify: (input) => verifyZarinpal(config, input),
  };
}

async function requestZarinpal(config: PaymentProviderConfig, input: PaymentRequestInput): Promise<PaymentRequestResult> {
  const base = config.apiUrl.replace(/\/$/, "");
  const url = `${base}${PAYMENT_PROVIDER_PROTOCOL.zarinpal.requestPath}`;
  const res = await requestPaymentProvider(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      merchant_id: config.merchantId,
      amount: input.amount,
      callback_url: input.callbackUrl,
      description: input.description,
      metadata: { order_id: input.orderId, email: input.email, mobile: input.mobile },
    }),
  });
  const body = res.body as ZarinpalRequestResponse;
  const code = body?.data?.code;
  const authority = body?.data?.authority;
  if (code !== 100 || !authority) {
    throw new PaymentProviderError(
      body?.data?.message ?? PAYMENT_ERROR_MESSAGES.verifyFailed,
      PAYMENT_ERROR_CODES.providerHttpError,
      res.statusCode,
      false,
    );
  }
  const isSandbox = config.credentials.sandbox === true || config.apiUrl.includes("sandbox");
  const startUrl = isSandbox
    ? PAYMENT_PROVIDER_PROTOCOL.zarinpal.sandboxStartPayUrl
    : PAYMENT_PROVIDER_PROTOCOL.zarinpal.startPayUrl;
  return { authority, paymentUrl: `${startUrl}${authority}`, statusCode: res.statusCode, providerStatus: body.data.message };
}

async function verifyZarinpal(config: PaymentProviderConfig, input: PaymentVerifyInput): Promise<PaymentVerifyResult> {
  const base = config.apiUrl.replace(/\/$/, "");
  const url = `${base}${PAYMENT_PROVIDER_PROTOCOL.zarinpal.verifyPath}`;
  const res = await requestPaymentProvider(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ merchant_id: config.merchantId, authority: input.authority, amount: input.amount }),
  });
  const body = res.body as ZarinpalVerifyResponse;
  const code = body?.data?.code ?? -1;
  if (code === 100 || code === 101) {
    return {
      verified: true,
      refId: body.data.ref_id ? String(body.data.ref_id) : undefined,
      cardPan: body.data.card_pan,
      code,
      providerStatus: body.data.message,
    };
  }
  return { verified: false, code, providerStatus: body?.data?.message ?? "Verification failed" };
}
