/**
 * Next.js instrumentation — runs once per server process at boot.
 *
 * Schedules croner jobs:
 *
 * 1. Bookings auto-complete — flips paid/waiting bookings to done once their
 *    appointment window has passed (every 15 minutes).
 * 2. Payment holds auto-expiry — cancels unpaid payment holds and releases
 *    their pending bookings (every 15 minutes).
 * 3. Weekly disk cleanup — cleans unreserved past slots and expired logs
 *    (Fridays at 6:00 UTC).
 * 4. Daily IndexNow sweep — re-announces the whole sitemap to Bing and the
 *    other participating engines, covering any content change that did not go
 *    through a targeted notification.
 *
 * Slot generation is intentionally NOT automatic — admins generate slots
 * manually on /dashboard/slots by picking a date range. The daily slot
 * auto-generator cron has been removed.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const [{ Cron }, { logError, logInfo }] = await Promise.all([
    import("croner"),
    import("@/lib/log"),
  ]);

  // Keep-warm (read-only): the managed Postgres (Supabase free tier) suspends
  // when idle. The first connection after a pause can be dropped by the pooler
  // (CONNECT_TIMEOUT / CONNECTION_CLOSED), so warm with a short retry at boot
  // and keep a warm connection with a trivial query every few minutes. Runs in
  // dev too; a single query per tick.
  const { db } = await import("@/src/db");
  const { sql } = await import("drizzle-orm");

  const warmDatabase = async (attempts = 3): Promise<void> => {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        await db.execute(sql`select 1`);
        return;
      } catch (error) {
        if (attempt === attempts) {
          logError("db.keep_warm_failed", {
            attempt,
            error: error instanceof Error ? error.message : String(error),
          });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  void warmDatabase();
  const keepWarmJob = new Cron(
    "*/2 * * * *",
    { timezone: "UTC", protect: true, name: "db-keep-warm" },
    () => warmDatabase(),
  );
  logInfo("db.keep_warm_scheduled", {
    nextRun: keepWarmJob.nextRun()?.toISOString() ?? null,
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

  // 15 minutes — cancels unpaid payment holds and releases their pending bookings.
  const { expireBookingCheckouts } = await import("@/lib/payment/booking-checkout");
  const expiryJob = new Cron(
    "*/15 * * * *",
    { timezone: "UTC", protect: true, name: "payment-expiry" },
    async () => {
      try {
        const result = await expireBookingCheckouts();
        if (result.expired > 0) {
          logInfo("payments.expiry_tick", result);
        }
      } catch (error) {
        logError("payments.expiry_tick_failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  logInfo("payments.expiry_scheduled", {
    nextRun: expiryJob.nextRun()?.toISOString() ?? null,
  });

  // 15 minutes — pre-appointment reminder SMS (one per order, idempotent).
  const { sendUpcomingReminders } = await import("@/lib/bookings/reminders");
  const reminderJob = new Cron(
    "*/15 * * * *",
    { timezone: "UTC", protect: true, name: "booking-reminders" },
    async () => {
      try {
        const result = await sendUpcomingReminders();
        if (result.sent > 0) {
          logInfo("bookingReminder.tick", result);
        }
      } catch (error) {
        logError("bookingReminder.tick_failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  logInfo("bookingReminder.scheduled", {
    nextRun: reminderJob.nextRun()?.toISOString() ?? null,
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

  // Daily IndexNow sweep (Bing + other participating engines). No-ops unless
  // INDEXNOW_KEY is set, so this is free on deployments that have not finished
  // hosting the key file at the origin root.
  const { indexNowSweepEnabled, submitSitemapToIndexNow } = await import(
    "@/lib/indexnow"
  );
  if (indexNowSweepEnabled()) {
    const indexNowJob = new Cron(
      "30 3 * * *",
      { timezone: "UTC", protect: true, name: "indexnow-sweep" },
      async () => {
        try {
          await submitSitemapToIndexNow();
        } catch (error) {
          logError("indexnow.sweep_failed", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      },
    );
    logInfo("indexnow.sweep_scheduled", {
      nextRun: indexNowJob.nextRun()?.toISOString() ?? null,
    });
  }
}