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

/** A JSON-array setting decoded to a clean string list (invalid entries dropped). */
function uuidList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
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
    auto: settings.has(SLOT_GENERATOR_KEYS.auto)
      ? settings.get(SLOT_GENERATOR_KEYS.auto) === true
      : DEFAULTS.auto,
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
    groupIds: uuidList(settings.get(SLOT_GENERATOR_KEYS.groups)),
  };
}

/**
 * Short in-process single-flight/cooldown for public availability reads. The
 * calendar requests many individual dates at once, but the generator operates
 * on the whole configured window.
 */
let lastAutoGenerationAt = 0;
let autoGenerationInFlight: Promise<{ created: number }> | null = null;
const AUTO_GENERATION_COOLDOWN_MS = 30_000;

/**
 * Materializes missing auto-slots for the configured window. The transaction
 * uses a PostgreSQL advisory xact lock so multiple instances never double-
 * insert. Public availability reads can call this safely: concurrent reads in
 * one process share a run and subsequent reads briefly reuse that window.
 * Forced admin/schedule refreshes always bypass the cooldown.
 */
export async function ensureAutoSlots(force = false): Promise<{ created: number }> {
  if (!force && autoGenerationInFlight) return autoGenerationInFlight;
  if (!force && Date.now() - lastAutoGenerationAt < AUTO_GENERATION_COOLDOWN_MS) {
    return { created: 0 };
  }

  const run = async () => {
    const config = await readGeneratorConfig();
    const result = await ensureAutoSlotsWithConfig(config, force);
    lastAutoGenerationAt = Date.now();
    return result;
  };

  if (force) return run();

  autoGenerationInFlight = run();
  try {
    return await autoGenerationInFlight;
  } finally {
    autoGenerationInFlight = null;
  }
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