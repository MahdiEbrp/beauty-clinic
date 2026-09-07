import { Cron } from "croner";
import { logError, logInfo } from "@/lib/log";
import { ensureAutoSlots, readGeneratorConfig } from "@/lib/bookings/generator";

export function startSlotGenerator(): void {
  // 05 every day at 00:05 in the clinic timezone (config read at fire time).
  const job = new Cron(
    "5 0 * * *",
    { timezone: "UTC", protect: true, name: "slot-auto-generator" },
    async () => {
      try {
        const config = await readGeneratorConfig();
        const result = await ensureAutoSlots();
        logInfo("slots.generator_tick", {
          timeZone: config.timeZone,
          auto: config.auto,
          created: result.created,
        });
      } catch (error) {
        logError("slots.generator_tick_failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  logInfo("slots.generator_scheduled", {
    nextRun: job.nextRun()?.toISOString() ?? null,
  });
}