import "server-only";

import { readGeneratorConfig } from "@/lib/bookings/generator";
import { loadWorkingHourRecords } from "./working-hours";

export type WorkingHoursPerformance = {
  /** Number of open weekdays in the current working-hours set. */
  openDays: number;
  closedDays: number;
  /** Sum of open→close lengths across the week, in minutes. */
  totalWeeklyMinutes: number;
  generator: {
    auto: boolean;
    intervalMin: number;
    durationMin: number;
    capacity: number;
    windowDays: number;
    timeZone: string;
  };
};

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Lightweight analytics for the working-hours hub page: weekday coverage,
 * total weekly minutes, and the current slot-generator configuration.
 */
export async function getWorkingHoursPerformance(): Promise<WorkingHoursPerformance> {
  const [records, config] = await Promise.all([
    loadWorkingHourRecords(),
    readGeneratorConfig(),
  ]);

  const openDays = records.length;
  const totalWeeklyMinutes = records.reduce(
    (sum, record) => sum + Math.max(0, minutesOf(record.closes) - minutesOf(record.opens)),
    0,
  );

  return {
    openDays,
    closedDays: Math.max(0, 7 - openDays),
    totalWeeklyMinutes,
    generator: {
      auto: config.auto,
      intervalMin: config.intervalMin,
      durationMin: config.durationMin,
      capacity: config.capacity,
      windowDays: config.windowDays,
      timeZone: config.timeZone,
    },
  };
}