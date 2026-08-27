

import type en from "../../messages/en.json";

type Join<K extends string, P extends string> = P extends "" ? K : `${K}.${P}`;

type LeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : Join<K, LeafPaths<T[K]>>;
}[keyof T & string];

export type MessageKey = LeafPaths<typeof en>;

export type MessageNamespace = keyof typeof en & string;

export type TranslateValues = Record<string, string | number | Date>;

export type TranslateFn = (
  key: MessageKey,
  values?: TranslateValues,
) => string;

export function msgKey(key: string): MessageKey {
  return key as MessageKey;
}

export type DynamicTranslate = (
  key: string,
  values?: TranslateValues,
) => string;

export function asTranslate(t: unknown): DynamicTranslate {
  return t as DynamicTranslate;
}
