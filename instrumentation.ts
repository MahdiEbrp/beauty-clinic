/**
 * Next.js instrumentation — runs once per server process at boot.
 *
 * Schedules three croner jobs:
 *
 * 1. Daily slot auto-generator — idempotent (only inserts missing
 *    (date, start_time) rows) and single-writer (PostgreSQL advisory xact
 *    lock), so multiple server instances can safely all register the same
 *    schedule.
 * 2. Bookings auto-complete — flips paid/waiting bookings to done once their
 *    appointment window has passed (every 15 minutes).
 * 3. Weekly disk cleanup — cleans unreserved past slots and expired logs
 *    (Fridays at 6:00 UTC).
 *
 * Enable/disable via the SLOTS_CRON_ENABLED env var (default: enabled outside
 * dev so local servers don't fight over the shared dev database).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const enabled = process.env.SLOTS_CRON_ENABLED
    ? process.env.SLOTS_CRON_ENABLED !== "false"
    : process.env.NODE_ENV !== "development";
  if (!enabled) return;

  const [{ Cron }, { logError, logInfo }] = await Promise.all([
    import("croner"),
    import("@/lib/log"),
  ]);
  const { ensureAutoSlots } = await import("@/lib/bookings/generator");
  const { readGeneratorConfig } = await import("@/lib/bookings/generator");

  // 05 every day at 00:05 in the clinic timezone (config read at fire time).
  const slotJob = new Cron(
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
    nextRun: slotJob.nextRun()?.toISOString() ?? null,
  });

  // 15 minutes — marks paid/waiting bookings as done once slot_end passes.
  const { completePassedBookings } = await import("@/lib/bookings/complete-passed");
  const completeJob = new Cron(
    "*/15 * * * *",
    { timezone: "UTC", protect: true, name: "bookings-complete" },
    async () => {
      try {
        const result = await completePassedBookings();
        if (result.completed > 0) {
          logInfo("bookings.complete_tick", result);
        }
      } catch (error) {
        logError("bookings.complete_tick_failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  logInfo("bookings.complete_scheduled", {
    nextRun: completeJob.nextRun()?.toISOString() ?? null,
  });

  // Weekly cleanup: Fridays at 6:00 UTC
  const { cleanUnreservedPastSlots, cleanExpiredLogs } = await import(
    "@/lib/cleanup"
  );
  const cleanupJob = new Cron(
    "0 6 * * 5",
    { timezone: "UTC", protect: true, name: "weekly-db-cleanup" },
    async () => {
      try {
        logInfo("cleanup.started", {
          timestamp: new Date().toISOString(),
        });
        
        // Clean unreserved past slots
        const slotsCleaned = await cleanUnreservedPastSlots();
        
        // Clean expired logs
        const logsCleaned = await cleanExpiredLogs();
        
        logInfo("cleanup.completed", {
          slotsCleaned,
          logsCleaned,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logError("cleanup.failed", {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }
    },
  );

  logInfo("cleanup.scheduled", {
    nextRun: cleanupJob.nextRun()?.toISOString() ?? null,
  });
}