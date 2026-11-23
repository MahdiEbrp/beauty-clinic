// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ClinicData } from "@/data/clinic";
import en from "@/messages/en.json";
import fa from "@/messages/fa.json";
import Contact from "./Contact";

vi.mock("@/components/BrandLogo", () => ({ default: () => null }));
afterEach(cleanup);

function renderContact(locale: "en" | "fa", telephone?: string) {
  const clinic = { telephone } as ClinicData;
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "fa" ? fa : en}>
      <Contact clinic={clinic} onOpenBooking={() => undefined} />
    </NextIntlClientProvider>,
  );
}

describe("homepage clinic telephone", () => {
  it.each(["en", "fa"] as const)("renders a localized accessible call link in %s", (locale) => {
    renderContact(locale, "+98 (21) 1234-5678");
    const messages = locale === "fa" ? fa : en;
    expect(screen.getByRole("heading", { name: messages.homepageContact.phoneLabel })).toBeTruthy();
    const link = screen.getByRole("link", {
      name: messages.homepageContact.callPhone.replace("{phone}", "+98 (21) 1234-5678"),
    });
    expect(link.getAttribute("href")).toBe("tel:+982112345678");
    expect(link.getAttribute("dir")).toBe("ltr");
    expect(link.textContent?.trim()).toBe("+98 (21) 1234-5678");
  });

  it.each([undefined, "", "---"])("omits the call link for missing or empty telephone %s", (telephone) => {
    renderContact("en", telephone);
    expect(screen.queryByRole("heading", { name: en.homepageContact.phoneLabel })).toBeNull();
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
  });
});
