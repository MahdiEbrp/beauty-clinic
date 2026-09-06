import "server-only";

import { sql } from "drizzle-orm";

import { loadSystemSettingsMap } from "@/lib/settings/loader";
import { db } from "@/src/db";
import { DEFAULT_CLINIC_TIMEZONE, loadWorkingHourRecords } from "./working-hours";
import { loadSlotPatternMap } from "./slot-patterns";
import { ensureAutoSlotsCore } from "./generator-core";
import {
  DEFAULTS,
  SLOT_GENERATOR_KEYS,
  planWindowSlots,
  weekdayOf,
  zonedDateKey,
  type GeneratorConfig,
} from "./generator-utils";

export {
  DEFAULTS,
  SLOT_GENERATOR_KEYS,
  planWindowSlots,
  weekdayOf,
  zonedDateKey,
  type GeneratorConfig,
};

function num(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Resolves the generator configuration from system settings with safe defaults. */
export async function readGeneratorConfig(): Promise<GeneratorConfig> {
  const settings = await loadSystemSettingsMap();
  const intervalMin = num(
    settings.get(SLOT_GENERATOR_KEYS.interval),
    DEFAULTS.intervalMin,
  );
  const durationMin = num(
    settings.get(SLOT_GENERATOR_KEYS.duration),
    DEFAULTS.durationMin,
  );
  return {
    auto: settings.get(SLOT_GENERATOR_KEYS.auto) === true,
    // Never space slots closer together than their own duration — otherwise
    // planWindowSlots would produce overlapping starts that double-book.
    intervalMin: Math.max(intervalMin, durationMin),
    durationMin,
    capacity: num(settings.get(SLOT_GENERATOR_KEYS.capacity), DEFAULTS.capacity),
    windowDays: num(settings.get(SLOT_GENERATOR_KEYS.window), DEFAULTS.windowDays),
    timeZone:
      typeof settings.get("booking.timezone") === "string"
        ? (settings.get("booking.timezone") as string)
        : DEFAULT_CLINIC_TIMEZONE,
  };
}

/**
 * Materializes missing auto-slots for the configured window. Runs inside ONE
 * transaction that first takes a PostgreSQL advisory xact lock, so parallel
 * server instances/restarts never double-insert. Idempotent — existing
 * (date, start_time) rows are never overwritten or deleted, so "slots
 * auto-append unless an admin limited or changed hours" holds by
 * construction. Pattern days additionally converge their *unbooked* slots to
 * the pattern (capacity updates + removed starts deactivated).
 */
export async function ensureAutoSlots(force = false): Promise<{ created: number }> {
  const config = await readGeneratorConfig();
  return ensureAutoSlotsWithConfig(config, force);
}

/**
 * Exposed for tests/admin callers that pin an explicit config. `force`
 * bypasses the `booking.slot_auto` gate so a manual admin trigger works even
 * when automatic generation is disabled.
 */
export async function ensureAutoSlotsWithConfig(
  config: GeneratorConfig,
  force = false,
): Promise<{ created: number }> {
  if (!force && !config.auto) return { created: 0 };
  const [workingHours, patternMap] = await Promise.all([
    loadWorkingHourRecords(),
    loadSlotPatternMap(),
  ]);
  return db.transaction(async (tx) => {
    // Single-writer guard: only one generator run proceeds at a time.
    // eslint-disable-next-line no-secrets/no-secrets -- Postgres advisory lock function name, not a secret
    await tx.execute(sql`SELECT pg_advisory_xact_lock(22467)`);
    const created = await ensureAutoSlotsCore(tx, config, workingHours, patternMap);
    return { created };
  });
}