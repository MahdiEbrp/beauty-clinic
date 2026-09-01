import { EMAIL_ERROR_CODES } from "@/lib/email/constants";
import { EmailProviderError } from "./types";

type Command = (
  line: string,
  timeoutMs: number,
) => Promise<{ code: number; text: string; lines: string[] }>;

export async function smtpAuthenticate(
  command: Command,
  capabilities: Set<string>,
  credentials: { username: string; password: string; encryption: string },
  timeoutMs: number,
): Promise<void> {
  const { username, password, encryption } = credentials;
  if (!username || encryption === "none") return;
  const mechanisms = authMechanisms(capabilities);
  if (mechanisms.has("PLAIN")) {
    const token = Buffer.from(
      `\u0000${username}\u0000${password}`,
      "utf8",
    ).toString("base64");
    const result = await command(`AUTH PLAIN ${token}`, timeoutMs);
    if (result.code === 235) return;
  }
  if (mechanisms.has("LOGIN")) {
    const step1 = await command("AUTH LOGIN", timeoutMs);
    if (step1.code === 334) {
      const step2 = await command(
        Buffer.from(username, "utf8").toString("base64"),
        timeoutMs,
      );
      if (step2.code === 334) {
        const step3 = await command(
          Buffer.from(password, "utf8").toString("base64"),
          timeoutMs,
        );
        if (step3.code === 235) return;
        throw new EmailProviderError(
          `SMTP authentication failed: ${step3.text}`,
          EMAIL_ERROR_CODES.providerRejected,
          step3.code,
          false,
        );
      }
    }
  }
  throw new EmailProviderError(
    "No supported SMTP authentication mechanism available.",
    EMAIL_ERROR_CODES.providerRejected,
    undefined,
    false,
  );
}

function authMechanisms(capabilities: Set<string>): Set<string> {
  const mechanisms = new Set<string>();
  for (const item of capabilities) {
    if (item === "PLAIN" || item === "LOGIN") mechanisms.add(item);
  }
  return mechanisms;
}