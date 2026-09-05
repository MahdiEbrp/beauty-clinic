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
    const body = line.trim().replace(/^\d{3}[- ]/, "");
    if (!body) continue;
    const parts = body.split(/\s+/);
    const feature = parts[0]?.toUpperCase() ?? "";
    capabilities.add(feature);
    if (feature === "AUTH" || feature.startsWith("AUTH=")) {
      const mechanisms =
        feature === "AUTH" ? parts.slice(1) : [feature.slice("AUTH=".length), ...parts.slice(1)];
      for (const mechanism of mechanisms) capabilities.add(mechanism.toUpperCase());
    }
  }
  return capabilities;
}