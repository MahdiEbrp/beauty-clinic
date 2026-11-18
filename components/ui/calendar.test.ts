import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Calendar } from "./calendar";

type PickerProps = { selected?: Date; defaultMonth?: Date; startMonth?: Date };
const { gregorian, persian } = vi.hoisted(() => ({
  gregorian: vi.fn<(_: PickerProps) => null>(() => null),
  persian: vi.fn<(_: PickerProps) => null>(() => null),
}));
vi.mock("react-day-picker", () => ({ DayPicker: gregorian }));
vi.mock("react-day-picker/persian", () => ({ DayPicker: persian, enUS: {}, faIR: {} }));
beforeEach(() => { vi.clearAllMocks(); });

describe("calendar initial month", () => {
  it.each(["gregorian", "jalali"] as const)("opens %s on the selection without restricting earlier navigation", (kind) => {
    const selected = new Date(2027, 5, 15);
    const startMonth = new Date(2026, 10, 1);
    renderToStaticMarkup(createElement(Calendar, { kind, selected, startMonth }));
    const props = (kind === "jalali" ? persian : gregorian).mock.calls[0]?.[0];
    expect(props?.defaultMonth).toEqual(selected);
    expect(props?.startMonth).toEqual(startMonth);
  });
});
