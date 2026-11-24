// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consecutiveOptions } from "@/lib/booking/consecutive-slots";
import type { SelectedGroup, SlotOption } from "../types";
import { fetchAvailableDates } from "../api";
import { getSlots } from "../slots-cache";
import en from "@/messages/en.json";
import fa from "@/messages/fa.json";
import DateModal from "./DateModal";

vi.mock("../api", () => ({ fetchAvailableDates: vi.fn() }));
vi.mock("../slots-cache", () => ({ getSlots: vi.fn(), prefetchDays: vi.fn() }));
const groups: SelectedGroup[] = ["a", "b"].map((id) => ({
  id, slug: id, title: id, icon: null, image: null, description: null,
  seoTitle: null, seoDescription: null, updatedAt: new Date(), displayOrder: 0, categories: [], groupIndex: 0,
}));
const rows: SlotOption[] = [0, 1, 2].map((i) => ({
  id: `s${i}`, slotDate: "2026-11-19", startTime: `13:${String(i * 15).padStart(2, "0")}`,
  endTime: `13:${String((i + 1) * 15).padStart(2, "0")}`,
  capacity: 1, bookedCount: 0, isActive: true, available: true, groupIds: [],
}));
const cart = groups.map((group) => ({ group, quantity: 1, slot: null }));
const plans = consecutiveOptions(rows, groups.map((g) => ({ groupId: g.id, quantity: 1 })), 0);

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-18T08:00:00"));
  vi.mocked(fetchAvailableDates).mockResolvedValue(["2026-11-19"]);
  vi.mocked(getSlots).mockReturnValue({ data: plans, fresh: Promise.resolve(plans), hit: true });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("consecutive date/time picker", () => {
  it.each(["en", "fa"] as const)("keeps adjacent starts selectable for two capacity-one services in %s", async (locale) => {
    const assign = vi.fn();
    const messages = locale === "fa" ? fa : en;
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <DateModal group={groups[0]} cart={cart} shared current={plans[0]} onAssign={assign} onClose={() => undefined} />
      </NextIntlClientProvider>,
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "13:15" })).toBeTruthy());
    expect(screen.getByRole("button", { name: "13:00" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "13:30" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "13:15" }));
    fireEvent.click(screen.getByRole("button", { name: messages.booking.schedule.confirmSlot }));
    expect(assign).toHaveBeenCalledWith("a", plans[1]);
    expect(plans[1].assignments.map((a) => [a.groupId, a.slot.id])).toEqual([["a", "s1"], ["b", "s2"]]);
  });

  it("does not confirm an old selected start absent from fresh availability", async () => {
    vi.mocked(getSlots).mockReturnValue({ data: [], fresh: Promise.resolve([]), hit: true });
    const assign = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <DateModal group={groups[0]} cart={cart} shared current={plans[0]} onAssign={assign} onClose={() => undefined} />
      </NextIntlClientProvider>,
    );
    const button = screen.getByRole("button", { name: en.booking.schedule.confirmSlot });
    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(true));
    fireEvent.click(button);
    expect(assign).not.toHaveBeenCalled();
  });
});
