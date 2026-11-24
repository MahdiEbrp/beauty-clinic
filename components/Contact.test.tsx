// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ClinicData } from "@/data/clinic";
import en from "@/messages/en.json";
import fa from "@/messages/fa.json";
import Contact from "./Contact";

afterEach(cleanup);

function clinic(telephone: string | null): ClinicData {
  return {
    telephone, currency: "IRR", minCancelHours: 24, defaultDeposit: 100000,
    timezone: "Asia/Tehran", openingHours: [],
    address: { streetAddress: "Clinic address", addressLocality: "City", addressRegion: "Region", addressCountry: "IR" },
    social: [{ url: "https://example.com/social", label: "Social", imageUrl: null }],
    maps: { neshan: "", google: "", coords: { lat: 35, lng: 51 } },
    content: {
      clinicName: "Clinic", addressTitle: "Address", socialTitle: "Social links",
      bookingTitle: "Book appointment", neshanMap: "Neshan", neshanDesc: "Neshan map",
      googleMap: "Google", googleMapDesc: "Google map", selectService: "Choose service",
      opensInNewTab: "Opens in a new tab",
    },
  };
}
function renderContact(locale: "en" | "fa", data?: ClinicData) {
  const onOpenBooking = vi.fn();
  const view = render(
    <NextIntlClientProvider locale={locale} messages={locale === "fa" ? fa : en}>
      <Contact clinic={data} onOpenBooking={onOpenBooking} />
    </NextIntlClientProvider>,
  );
  return { ...view, onOpenBooking };
}

describe("homepage clinic telephone", () => {
  it.each(["en", "fa"] as const)("renders a localized accessible call link in %s", (locale) => {
    renderContact(locale, clinic("+98 (21) 1234-5678"));
    const messages = locale === "fa" ? fa : en;
    expect(screen.getByRole("heading", { name: messages.homepageContact.phoneLabel })).toBeTruthy();
    const link = screen.getByRole("link", {
      name: messages.homepageContact.callPhone.replace("{phone}", "+98 (21) 1234-5678"),
    });
    expect(link.getAttribute("href")).toBe("tel:+982112345678");
    expect(link.getAttribute("dir")).toBe("ltr");
    expect(link.textContent?.trim()).toBe("+98 (21) 1234-5678");
    expect(link.classList.contains("min-h-11")).toBe(true);
    expect(link.classList.contains("focus-visible:outline-accent")).toBe(true);
  });

  it("preserves leading zeroes for local phone numbers", () => {
    renderContact("en", clinic("021 1234 5678"));
    expect(screen.getByRole("link", { name: "Call 021 1234 5678" }).getAttribute("href")).toBe("tel:02112345678");
  });

  it.each([null, "", "---"])("omits the phone block for missing or empty telephone %s", (telephone) => {
    const { container } = renderContact("en", clinic(telephone));
    expect(screen.queryByRole("heading", { name: en.homepageContact.phoneLabel })).toBeNull();
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("handles missing clinic data", () => {
    const { container } = renderContact("en");
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("retains the address, social link, maps and booking action", () => {
    const { onOpenBooking } = renderContact("en", clinic("02112345678"));
    expect(screen.getByText("Clinic address")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Social/ }).getAttribute("href")).toBe("https://example.com/social");
    expect(screen.getByRole("link", { name: /Neshan/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Google/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Book appointment" }));
    expect(onOpenBooking).toHaveBeenCalledOnce();
  });
});
