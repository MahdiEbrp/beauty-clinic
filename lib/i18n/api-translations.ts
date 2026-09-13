import { routing } from "@/src/i18n/routing";

type Messages = Record<string, unknown>;

const cache = new Map<string, Messages>();

async function loadMessages(locale: string): Promise<Messages> {
  const key = locale;
  const cached = cache.get(key);
  if (cached) return cached;
  const mod = (await import(`../../messages/${locale}.json`)) as { default: Messages };
  cache.set(key, mod.default);
  return mod.default;
}

function resolve(messages: Messages, dotPath: string): string | undefined {
  return dotPath
    .split(".")
    .reduce<unknown>((obj, k) => (obj && typeof obj === "object" ? (obj as Record<string, unknown>)[k] : undefined), messages) as
    | string
    | undefined;
}

/**
 * Minimal translation helper for API routes that run outside the next-intl
 * middleware context (proxy.ts bypasses i18n for /api).
 *
 * Accepts either a URL pathname (locale read from its prefix) or a bare locale
 * code — the latter is used by server-side senders (notifications) that know
 * the target locale without a request in flight.
 */
export async function getApiTranslations(
  localeOrPathname: string,
): Promise<(key: string, vars?: Record<string, string | number>) => string> {
  const locales = routing.locales as readonly string[];
  const firstSegment = localeOrPathname.split("/")[1] ?? "";
  const fromPath = localeOrPathname.startsWith("/") && locales.includes(firstSegment);
  const locale =
    fromPath
      ? firstSegment
      : locales.includes(localeOrPathname)
        ? localeOrPathname
        : routing.defaultLocale;

  const messages = await loadMessages(locale);

  return (key, vars) => {
    const raw = resolve(messages, key);
    if (raw === undefined) return key;
    if (!vars) return raw;
    return Object.entries(vars).reduce(
      (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
      raw,
    );
  };
}
