import { PAYMENT_ERROR_CODES, PAYMENT_ERROR_MESSAGES } from "../constants";
import { requestPaymentProvider } from "./http";
import type {
  PaymentProviderAdapter,
  PaymentProviderConfig,
  PaymentRequestInput,
  PaymentRequestResult,
  PaymentVerifyInput,
  PaymentVerifyResult,
} from "./types";
import { PaymentProviderError } from "./types";

type TabapayCreateResponse = {
  responseCode: number;
  status: string;
  token?: string;
  url?: string;
  message?: string;
};

type TabapayVerifyResponse = {
  responseCode: number;
  status: string;
  message?: string;
  token?: string;
  shaparakRefNumber?: string;
  trackingCode?: number | string;
  amount?: number;
  finalAmount?: number;
  cardNumber?: string;
  hashedCardNumber?: string;
  ip?: string;
  date?: string;
};

const TABAPAY_SUCCESS_CODE = 1;

function tabapayCreatePath(sandbox: boolean): string {
  return sandbox ? "/v1/sandbox/create" : "/v1/create";
}

function tabapayVerifyPath(sandbox: boolean): string {
  return sandbox ? "/v1/sandbox/verify" : "/v1/verify";
}

export function createTabapayAdapter(
  config: PaymentProviderConfig,
): PaymentProviderAdapter {
  return {
    request: (input) => requestTabapay(config, input),
    verify: (input) => verifyTabapay(config, input),
  };
}

async function requestTabapay(
  config: PaymentProviderConfig,
  input: PaymentRequestInput,
): Promise<PaymentRequestResult> {
  const isSandbox = config.credentials.sandbox === true;
  const base = config.apiUrl.replace(/\/$/, "");
  const url = `${base}${tabapayCreatePath(isSandbox)}`;
  const res = await requestPaymentProvider(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${config.merchantId}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      callbackURL: input.callbackUrl,
      ...(input.mobile ? { mobile: input.mobile } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.description ? { description: input.description } : {}),
    }),
  });
  const body = res.body as TabapayCreateResponse;
  const code = body?.responseCode ?? -1;
  const token = body?.token;
  const payUrl = body?.url;
  if (
    code !== TABAPAY_SUCCESS_CODE ||
    body.status !== "success" ||
    !token ||
    !payUrl
  ) {
    throw new PaymentProviderError(
      body?.message ?? PAYMENT_ERROR_MESSAGES.verifyFailed,
      PAYMENT_ERROR_CODES.providerHttpError,
      res.statusCode,
      false,
    );
  }
  return {
    authority: token,
    paymentUrl: payUrl,
    statusCode: res.statusCode,
    providerStatus: body.status,
  };
}

async function verifyTabapay(
  config: PaymentProviderConfig,
  input: PaymentVerifyInput,
): Promise<PaymentVerifyResult> {
  const isSandbox = config.credentials.sandbox === true;
  const base = config.apiUrl.replace(/\/$/, "");
  const url = `${base}${tabapayVerifyPath(isSandbox)}`;
  const res = await requestPaymentProvider(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${config.merchantId}`,
    },
    body: JSON.stringify({
      token: input.authority,
      amount: input.amount,
    }),
  });
  const body = res.body as TabapayVerifyResponse;
  const code = body?.responseCode ?? -1;
  const verified = code === TABAPAY_SUCCESS_CODE && body.status === "success";
  const refId =
    body?.shaparakRefNumber ?? body?.trackingCode
      ? String(body?.shaparakRefNumber ?? body?.trackingCode)
      : undefined;
  return {
    verified,
    refId,
    cardPan: body?.cardNumber,
    code,
    providerStatus: body?.message ?? (verified ? "verified" : "verification failed"),
  };
}
