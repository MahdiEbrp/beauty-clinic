import { EMAIL_LIMITS } from "./constants";

export function getEmailLengthLabel(value: string): {
  characters: number;
  lines: number;
} {
  if (!value) return { characters: 0, lines: 1 };
  const characters = [...value].length;
  const lines = value.split("\n").length;
  return {
    characters,
    lines: Math.max(1, lines),
  };
}

export function exceedsEmailLimit(value: string): boolean {
  return [...value].length > EMAIL_LIMITS.messageMaxLength;
}