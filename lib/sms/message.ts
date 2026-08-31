import { SMS_MESSAGE_LIMITS } from "./constants";

// GSM 7-bit default alphabet — an explicit SMS encoding allowlist, not a secret.
const GSM_7_BASIC =
  // eslint-disable-next-line no-secrets/no-secrets
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\u001bÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_7_EXTENDED = "^{}\\[~]|€";

function isGsm7(value: string): boolean {
  return [...value].every(
    (character) =>
      GSM_7_BASIC.includes(character) || GSM_7_EXTENDED.includes(character),
  );
}

export function countSmsParts(value: string): number {
  if (!value) return 0;
  const gsm = isGsm7(value);
  const singleLimit = gsm
    ? SMS_MESSAGE_LIMITS.gsm7Single
    : SMS_MESSAGE_LIMITS.unicodeSingle;
  const multipartLimit = gsm
    ? SMS_MESSAGE_LIMITS.gsm7Multipart
    : SMS_MESSAGE_LIMITS.unicodeMultipart;
  return value.length <= singleLimit
    ? 1
    : Math.ceil(value.length / multipartLimit);
}

export function getSmsEncoding(value: string): "gsm7" | "unicode" {
  return isGsm7(value) ? "gsm7" : "unicode";
}

export function getSmsLengthLabel(value: string): {
  characters: number;
  parts: number;
  encoding: "gsm7" | "unicode";
} {
  return {
    characters: [...value].length,
    parts: countSmsParts(value),
    encoding: getSmsEncoding(value),
  };
}
