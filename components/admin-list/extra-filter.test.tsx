// @vitest-environment jsdom
import { createElement } from "react";
import { NextIntlClientProvider } from "next-intl";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CalendarProps } from "@/components/ui/calendar";
import en from "@/messages/en.json";
import fa from "@/messages/fa.json";
import { AdminExtraFilter } from "./extra-filter";

const { calendar } = vi.hoisted(() => ({ calendar: vi.fn<(props: CalendarProps) => void>() }));
vi.mock("@/components/ui/calendar", () => ({
  Calendar: (props: CalendarProps) => {
    calendar(props);
    return createElement("button", { onClick: () => props.onSelect?.(new Date(2026, 11, 1)) }, "Pick");
  },
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

function setup(locale: "fa" | "en", value: string, type: "date" | "select" = "date") {
  const messages = locale === "fa" ? fa : en;
  const label = messages.bookingSlots.filters.from;
  const onChange = vi.fn();
  const element = (nextValue: string) => (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Tehran">
      <AdminExtraFilter label={label} value={nextValue} type={type} allLabel={messages.bookingSlots.allGroups} onChange={onChange} />
    </NextIntlClientProvider>
  );
  const view = render(element(value));
  return { ...view, label, messages, onChange, element };
}

describe("localized admin date filters", () => {
  it.each(["fa", "en"] as const)("labels the %s date trigger and emits canonical Gregorian filter values", (locale) => {
    const { label, onChange } = setup(locale, "2026-11-18");
    const trigger = screen.getByRole("button", { name: label });
    expect(screen.getByLabelText(label)).toBe(trigger);
    fireEvent.click(trigger);
    expect(calendar.mock.calls.at(-1)?.[0].kind).toBe(locale === "fa" ? "jalali" : "gregorian");
    fireEvent.click(screen.getByRole("button", { name: "Pick" }));
    expect(onChange).toHaveBeenCalledWith("2026-12-01");
  });

  it.each(["fa", "en"] as const)("clears only the selected %s date with a translated accessible button", (locale) => {
    const { label, messages, onChange, rerender, element } = setup(locale, "2026-11-18");
    const name = messages.dateTimePicker.clearDate.replace("{label}", label);
    const clearButton = screen.getByRole("button", { name });
    expect(clearButton.classList.contains("size-11")).toBe(true);
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("");
    rerender(element(""));
    expect(screen.queryByRole("button", { name })).toBeNull();
    expect(screen.getByRole("button", { name: label })).toBeTruthy();
  });

  it("preserves the labeled Radix group-select control", () => {
    const { label, messages } = setup("fa", "", "select");
    expect(screen.getByRole("combobox", { name: label }).textContent).toContain(messages.bookingSlots.allGroups);
    expect(calendar).not.toHaveBeenCalled();
  });
});
