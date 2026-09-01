import { EMAIL_UI } from "@/lib/email/constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TEMPLATE_KEY_PATTERN = /^[a-z][a-z0-9_.-]*$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function parseEmailRecipients(value: string): string[] {
  return value
    .split(EMAIL_UI.recipientSeparators)
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

export function parseEmailVariables(value: string): string[] {
  return [...new Set(
    value
      .split(EMAIL_UI.recipientSeparators)
      .map((variable) => variable.trim())
      .filter(Boolean),
  )];
}

export function renderEmailPreview(
  content: string,
  variables: Record<string, string>,
): string {
  return content.replace(EMAIL_UI.templateVariablePattern, (_match, key: string) => {
    return variables[key] || EMAIL_UI.previewMissingVariable;
  });
}
