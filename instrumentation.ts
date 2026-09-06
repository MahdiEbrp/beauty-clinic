/**
 * Next.js instrumentation — runs once per server process at boot.
 *
 * Schedules the daily slot auto-generator with croner. The generator itself is
 * idempotent (only inserts missing (date, start_time) rows) and single-writer
 * (PostgreSQL advisory xact lock), so multiple server instances can safely all
 * register the same schedule.
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