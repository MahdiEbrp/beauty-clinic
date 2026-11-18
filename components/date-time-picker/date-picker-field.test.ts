// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CalendarProps } from "@/components/ui/calendar";
import { DatePickerField, dateToKey, keyToDate } from "./date-picker-field";

const { calendar } = vi.hoisted(() => ({ calendar: vi.fn<(props: CalendarProps) => void>() }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/components/ui/calendar", () => ({
  Calendar: (props: CalendarProps) => {
    calendar(props);
    return createElement("button", { onClick: () => props.onSelect?.(new Date(2026, 11, 1)) }, "Pick");
  },
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

function calendarProps() {
  const props = calendar.mock.calls.at(-1)?.[0];
  if (!props) throw new Error("Calendar did not render");
  return props;
}

describe("locale-aligned date picker", () => {
  it("updates the calendar and direction when the active locale changes", () => {
    const onChange = vi.fn();
    const { rerender } = render(createElement(DatePickerField, { locale: "fa", onChange }));
    fireEvent.click(screen.getByRole("button", { name: "chooseDate" }));
    expect(calendarProps().kind).toBe("jalali");
    expect(screen.getByRole("dialog").getAttribute("dir")).toBe("rtl");
    expect(screen.queryByRole("tablist")).toBeNull();
    rerender(createElement(DatePickerField, { locale: "en", onChange }));
    expect(calendarProps().kind).toBe("gregorian");
    expect(screen.getByRole("dialog").getAttribute("dir")).toBe("ltr");
  });

  it("does not turn a future selection into the earliest navigable month", () => {
    render(createElement(DatePickerField, { locale: "en", value: "2027-06-15", min: "2026-11-01", onChange: vi.fn() }));
    fireEvent.click(screen.getByRole("button", { name: "2027/06/15" }));
    expect(calendarProps().startMonth).toEqual(keyToDate("2026-11-01"));
    expect(calendarProps().selected).toEqual(keyToDate("2027-06-15"));
    expect(calendarProps().disabled).toEqual({ before: keyToDate("2026-11-01") });
  });

  it("allows historical month navigation when no minimum was supplied", () => {
    render(createElement(DatePickerField, { locale: "en", value: "2027-06-15", onChange: vi.fn() }));
    fireEvent.click(screen.getByRole("button", { name: "2027/06/15" }));
    expect(calendarProps().startMonth).toEqual(new Date(2000, 0, 1));
    expect(calendarProps().disabled).toBeUndefined();
  });

  it("emits canonical Gregorian keys even from the Persian calendar", () => {
    const onChange = vi.fn();
    render(createElement(DatePickerField, { locale: "fa", onChange }));
    fireEvent.click(screen.getByRole("button", { name: "chooseDate" }));
    fireEvent.click(screen.getByRole("button", { name: "Pick" }));
    expect(onChange).toHaveBeenCalledWith("2026-12-01");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("round-trips local dates without converting through UTC", () => {
    expect(dateToKey(new Date(2026, 10, 18, 0, 30))).toBe("2026-11-18");
    expect(dateToKey(new Date(2026, 10, 18, 23, 30))).toBe("2026-11-18");
    const date = keyToDate("2026-11-18");
    expect(date?.getHours()).toBe(12);
    if (!date) throw new Error("Date did not parse");
    expect(dateToKey(date)).toBe("2026-11-18");
  });
});
