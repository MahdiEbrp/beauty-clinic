import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const requested = locale;
  const resolvedLocale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`../../messages/${resolvedLocale}.json`)) as { default: Record<string, unknown> };

  return {
    locale: resolvedLocale,
    messages: messages.default,
  };
});