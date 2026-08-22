type OpeningDay = { days: string[]; opens: string; closes: string };

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function isOpeningDay(value: unknown): value is OpeningDay {
  if (typeof value !== "object" || value === null) return false;
  const slot = value as Record<string, unknown>;
  return (
    Array.isArray(slot.days) &&
    slot.days.every((d) => typeof d === "string") &&
    typeof slot.opens === "string" &&
    typeof slot.closes === "string"
  );
}

function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * True when `[start,end)` falls inside the clinic's opening hours for the
 * weekday of `start`. Empty/invalid opening-hours data is treated as "open"
 * (no block). Pure & locale-free, so it is unit-testable in isolation.
 */
export function isOpenAt(
  start: Date,
  end: Date,
  openingHours: unknown,
): boolean {
  if (!Array.isArray(openingHours) || openingHours.length === 0) return true;
  const days = openingHours.filter(isOpeningDay);
  if (days.length === 0) return true;

  const startText = hhmm(start);
  const endText = hhmm(end);
  const weekday = WEEKDAY_NAMES[start.getDay()] ?? "";

  return days.some(
    (entry) =>
      entry.days.includes(weekday) && startText >= entry.opens && endText < entry.closes,
  );
}
