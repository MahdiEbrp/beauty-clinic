import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { SYSTEM_SETTINGS } from "./definitions";

type Json = Record<string, unknown>;

const LOCALES = ["fa", "en"] as const;

function loadMessages(locale: (typeof LOCALES)[number]): Json {
  const path = new URL(`../../../messages/${locale}.json`, import.meta.url);
  return JSON.parse(readFileSync(path, "utf-8")) as Json;
}

function resolvePath(root: Json, path: string): unknown {
  let node: unknown = root;
  for (const segment of path.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Json)[segment];
  }
  return node;
}

const SETTING_KEYS = SYSTEM_SETTINGS.map((def) => def.key);

const GROUP_NAMESPACES = ["booking", "contact", "pricing", "social", "clinic", "common"];

describe("settings key translations", () => {
  const loaded = Object.fromEntries(LOCALES.map((l) => [l, loadMessages(l)])) as Record<
    (typeof LOCALES)[number],
    Json
  >;

  it("has a settingsAdmin.keys.* label for every seeded setting key in both locales", () => {
    const missing: Record<(typeof LOCALES)[number], string[]> = { fa: [], en: [] };

    for (const key of SETTING_KEYS) {
      for (const locale of LOCALES) {
        const messagePath = `settingsAdmin.keys.${key}`;
        if (resolvePath(loaded[locale], messagePath) === undefined) {
          missing[locale].push(key);
        }
      }
    }

    for (const locale of LOCALES) {
      expect(
        missing[locale],
        `settings keys without a settingsAdmin.keys label in ${locale}.json: ${missing[locale].join(", ")}`,
      ).toEqual([]);
    }
  });

  it("has a settingsAdmin.keys namespace for every settings group", () => {
    for (const ns of GROUP_NAMESPACES) {
      for (const locale of LOCALES) {
        expect(
          resolvePath(loaded[locale], `settingsAdmin.keys.${ns}`),
          `settingsAdmin.keys.${ns} missing from ${locale}.json`,
        ).toBeDefined();
      }
    }
  });
});