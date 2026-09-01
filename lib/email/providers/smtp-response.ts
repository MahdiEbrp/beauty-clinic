import { EMAIL_PROVIDER_SMTP } from "@/lib/email/constants";

export type SmtpResponse = {
  code: number;
  text: string;
  lines: string[];
};

const RESPONSE_PATTERN = /^(\d{3})(?:[ -])(.*)$/;

export function parseResponseLines(lines: string[]): SmtpResponse {
  const first = RESPONSE_PATTERN.exec(lines[0] ?? "");
  const code = first ? Number(first[1]) : 0;
  const text = lines
    .map((line) => line.slice(4))
    .join(" ")
    .trim()
    .slice(0, EMAIL_PROVIDER_SMTP.smtpCommandResponseMaxChars);
  return { code, text, lines };
}

export function parseCapabilities(lines: string[]): Set<string> {
  const capabilities = new Set<string>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || /^\d{3}\s/.test(trimmed)) continue;
    const parts = trimmed.split(" ");
    const feature = parts[0]?.toUpperCase() ?? "";
    capabilities.add(feature);
    if (feature === "AUTH") {
      for (const mechanism of parts.slice(1)) capabilities.add(mechanism.toUpperCase());
    }
  }
  return capabilities;
}