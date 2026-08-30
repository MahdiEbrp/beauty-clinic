import { requestProvider } from "./http";
import { asArray, asRecord, nestedRecord, readNumber, readString } from "./parsing";
import type {
  SmsProviderAdapter,
  SmsProviderConfig,
  SmsSendInput,
  SmsSendResult,
} from "./types";
import { SmsProviderError } from "./types";

export function createKavenegarAdapter(config: SmsProviderConfig): SmsProviderAdapter {
  return {
    send: (input) => sendKavenegar(config, input),
  };
}

async function sendKavenegar(
  config: SmsProviderConfig,
  input: SmsSendInput,
): Promise<SmsSendResult> {
  const endpoint = buildEndpoint(config.apiUrl, config.token);
  const form = new URLSearchParams();
  form.set("receptor", input.recipients.join(","));
  form.set("message", input.message);
  const sender = input.sender ?? config.sender;
  if (sender) form.set("sender", sender);

  const response = await requestProvider(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const root = asRecord(response.body);
  const providerReturn = nestedRecord(root, "return");
  const providerCode = readNumber(providerReturn, "status", "code");
  if (providerCode !== undefined && providerCode !== 200) {
    throw new SmsProviderError(
      readString(providerReturn, "message", "statusText") ??
        "Kavenegar rejected the message.",
      "PROVIDER_REJECTED",
      response.statusCode,
      false,
    );
  }

  const entries = asArray(root?.entries);
  const accepted = input.recipients.map((recipient, index) => {
    const entry = asRecord(entries[index]);
    return {
      recipient,
      providerMessageId: readString(entry, "messageid", "messageId", "id"),
      providerStatus: readString(entry, "status", "statustext"),
      cost: readNumber(entry, "cost"),
    };
  });
  return { accepted, rejected: [], statusCode: response.statusCode };
}

function buildEndpoint(apiUrl: string, token: string): string {
  const base = apiUrl.replace(/\/+$/, "");
  if (base.includes("{token}")) return base.replace("{token}", encodeURIComponent(token));
  if (/\/sms\/send\.json$/i.test(base)) return base;
  if (/\/v1$/i.test(base)) return `${base}/${encodeURIComponent(token)}/sms/send.json`;
  return `${base}/v1/${encodeURIComponent(token)}/sms/send.json`;
}
