import { logInfo } from "@/lib/log";
import type {
  EmailProviderAdapter,
  EmailProviderConfig,
  EmailSendInput,
  EmailSendResult,
} from "./types";

/**
 * Fake / smoke-test provider. It never sends a real email: the outgoing message
 * is logged to the console (server side) and a deterministic success is
 * returned, so the email send pipeline, campaigns and test flows work end-to-end
 * without an SMTP server or credentials.
 */
export function createFakeAdapter(config: EmailProviderConfig): EmailProviderAdapter {
  return {
    send: (input) => send(config, input),
  };
}

async function send(
  config: EmailProviderConfig,
  input: EmailSendInput,
): Promise<EmailSendResult> {
  logInfo("email.fake.send", {
    providerKind: config.kind,
    fromEmail: input.fromEmail ?? config.fromEmail ?? null,
    fromName: config.fromName ?? null,
    recipients: input.recipients,
    subject: input.subject,
    message: input.message,
    templateType: input.templateType,
    acceptedCount: input.recipients.length,
  });

  return {
    accepted: input.recipients.map((recipient) => ({
      recipient,
      providerMessageId: fakeMessageId(recipient),
      providerStatus: "sent",
    })),
    rejected: [],
    statusCode: 200,
    providerStatus: "Simulated email sent (no external provider called).",
  };
}

/** Deterministic, greppable fake provider id based on the recipient. */
function fakeMessageId(recipient: string): string {
  return `fake-${Buffer.from(recipient, "utf8").toString("hex").slice(0, 12)}`;
}