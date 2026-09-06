import { db } from "../index";
import { workingHours } from "../schema";

/** Default weekly working hours seeded for fresh installs (day → window). */
const DEFAULT_WH: { day: string; opens: string; closes: string; capacity: number }[] = [
  { day: "Saturday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Sunday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Monday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Tuesday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Wednesday", opens: "09:00", closes: "19:00", capacity: 1 },
  { day: "Thursday", opens: "09:00", closes: "14:00", capacity: 1 },
];

/** Seeds the weekly `working_hours` rows (idempotent, one row per weekday). */
export async function seedWorkingHours(): Promise<void> {
  for (const [index, entry] of DEFAULT_WH.entries()) {
    await db
      .insert(workingHours)
      .values({ ...entry, displayOrder: index + 1 })
      .onConflictDoNothing({ target: workingHours.day });
  }
  console.log("Working hours seeded.");
}