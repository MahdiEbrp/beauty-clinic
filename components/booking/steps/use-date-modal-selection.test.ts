// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SelectedGroup, SlotOption } from "../types";
import { fetchAvailableDates } from "../api";
import { getSlots, prefetchDays } from "../slots-cache";
import { useDateModalSelection } from "./use-date-modal-selection";

vi.mock("next-intl", () => ({ useLocale: () => "en" }));
vi.mock("../api", () => ({ fetchAvailableDates: vi.fn() }));
vi.mock("../slots-cache", () => ({ getSlots: vi.fn(), prefetchDays: vi.fn() }));

const group: SelectedGroup = {
  id: "group", slug: "skin", title: "Skin", icon: null, image: null,
  description: null, seoTitle: null, seoDescription: null,
  updatedAt: new Date(), displayOrder: 0, categories: [], groupIndex: 0,
};
const slot: SlotOption = {
  id: "slot", groupIds: [], slotDate: "2026-11-17", startTime: "09:00", endTime: "09:30",
  capacity: 2, isActive: true, bookedCount: 0, available: true,
};
const options = { group, current: null, cart: [{ group, quantity: 2, slot: null }] };

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-17T12:00:00Z"));
  vi.mocked(fetchAvailableDates).mockResolvedValue([]);
  vi.mocked(getSlots).mockReturnValue({ data: [slot], fresh: Promise.resolve([slot]), hit: true });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("extracted date-modal selection", () => {
  it("requests concrete endpoints for the 60-day availability window", async () => {
    const { result } = renderHook(() => useDateModalSelection(options));
    await waitFor(() => expect(result.current.availabilityChecked).toBe(true));
    expect(fetchAvailableDates).toHaveBeenCalledExactlyOnceWith("2026-11-17", "2027-01-15", "group", undefined);
    expect(result.current.availableDates).toEqual([]);
    expect(result.current.canConfirm).toBe(false);
  });

  it("uses aggregate group IDs and seat count for a shared appointment", async () => {
    const sharedOptions = { ...options, shared: true };
    const { result } = renderHook(() => useDateModalSelection(sharedOptions));
    await waitFor(() => expect(result.current.availabilityChecked).toBe(true));
    expect(fetchAvailableDates).toHaveBeenCalledWith("2026-11-17", "2027-01-15", undefined, { groupIds: ["group"], quantity: 2 });
  });

  it("keeps date/time selection transitions and prefetching after extraction", async () => {
    vi.mocked(fetchAvailableDates).mockResolvedValue(["2026-11-17"]);
    const { result } = renderHook(() => useDateModalSelection(options));
    await waitFor(() => expect(result.current.availableDates).toHaveLength(1));
    expect(prefetchDays).toHaveBeenCalledWith(["2026-11-17"], "group", undefined);
    await act(async () => { result.current.onDayChange(new Date("2026-11-17T12:00:00")); await Promise.resolve(); });
    expect(getSlots).toHaveBeenCalledWith("2026-11-17", "group", undefined);
    act(() => result.current.setPickerSlot(slot));
    expect(result.current.canConfirm).toBe(true);
    act(() => result.current.onMonthChange(12));
    expect(result.current.pickerDay).toBeNull();
    expect(result.current.pickerSlot).toBeNull();
    expect(result.current.canConfirm).toBe(false);
  });

  it("finishes loading gracefully when availability fails", async () => {
    vi.mocked(fetchAvailableDates).mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useDateModalSelection(options));
    await waitFor(() => expect(result.current.availabilityChecked).toBe(true));
    expect(result.current.availableDateKeys.size).toBe(0);
    expect(result.current.canConfirm).toBe(false);
  });
});
