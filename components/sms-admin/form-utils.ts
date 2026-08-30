import { SMS_UI } from "@/lib/sms/constants";

export const TEMPLATE_KEY_PATTERN = /^[a-z][a-z0-9_.-]*$/;

export function parseSmsRecipients(value: string): string[] {
  return value
    .split(SMS_UI.recipientSeparators)
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

export function parseSmsVariables(value: string): string[] {
  return [...new Set(
    value
      .split(SMS_UI.recipientSeparators)
      .map((variable) => variable.trim())
      .filter(Boolean),
  )];
}

export function renderSmsPreview(
  content: string,
  variables: Record<string, string>,
): string {
  return content.replace(SMS_UI.templateVariablePattern, (_match, key: string) => {
    return variables[key] || SMS_UI.previewMissingVariable;
  });
}
