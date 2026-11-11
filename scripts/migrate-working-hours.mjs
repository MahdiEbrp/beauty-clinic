import postgres from 'postgres';
import 'dotenv/config';

/**
 * One-time data migration: move weekly working hours out of the legacy
 * `clinic.opening_hours` system setting into the new `working_hours` table.
 *
 * Order: run `pnpm db:migrate` (creates the table) FIRST, then this script.
 *
 * Behavior (idempotent):
 *  - reads `clinic.opening_hours` (array of { days[], opens, closes })
 *  - expands each grouped entry into one row per weekday, default capacity 1
 *  - INSERT ON CONFLICT (day) DO NOTHING — existing rows are never overwritten
 *  - seeds `booking.timezone` (Asia/Tehran) if not already set
 *  - deletes the legacy setting row after a successful backfill
 */
async function main() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  // Resolve per-day records from the legacy setting (or fall back to defaults).
  const rows = await sql`SELECT value FROM settings WHERE scope = 'system' AND key = 'clinic.opening_hours' LIMIT 1`;
  let groups = [];
  if (rows.length > 0 && Array.isArray(rows[0].value)) {
    groups = rows[0].value;
  } else {
    groups = [
      { days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'], opens: '09:00', closes: '19:00' },
      { days: ['Thursday'], opens: '09:00', closes: '14:00' },
    ];
  }

  let inserted = 0;
  let order = 0;
  for (const group of groups) {
    if (!group || !Array.isArray(group.days)) continue;
    for (const day of group.days) {
      order += 1;
      const result = await sql`
        INSERT INTO working_hours (day, opens, closes, capacity, display_order)
        VALUES (${day}, ${group.opens}, ${group.closes}, 1, ${order})
        ON CONFLICT (day) DO NOTHING
      `;
      inserted += result.count;
    }
  }
  console.log(`Working hours migrated: ${inserted} new rows (existing rows kept).`);

  // Seed the timezone + slot-generator settings if absent.
  const defaults = [
    { key: 'booking.timezone', value: 'Asia/Tehran', type: 'string' },
    { key: 'booking.slot_auto', value: 'true', type: 'boolean' },
    { key: 'booking.slot_interval_min', value: '180', type: 'number' },
    { key: 'booking.slot_duration_min', value: '30', type: 'number' },
    { key: 'booking.slot_default_capacity', value: '1', type: 'number' },
    { key: 'booking.slot_window_days', value: '30', type: 'number' },
  ];
  for (const def of defaults) {
    const found = await sql`SELECT 1 FROM settings WHERE scope = 'system' AND key = ${def.key} LIMIT 1`;
    if (found.length === 0) {
      await sql`
        INSERT INTO settings (scope, key, value, type)
        VALUES ('system', ${def.key}, ${JSON.stringify(def.type === 'boolean' ? def.value === 'true' : def.value === 'number' ? Number(def.value) : def.value)}::jsonb, ${def.type})
      `;
      console.log(`${def.key} seeded.`);
    }
  }

  // Upgrade only the exact legacy defaults introduced by this migration.
  // Any administrator-customized value is preserved.
  const [autoSetting] = await sql`SELECT value FROM settings WHERE scope = 'system' AND key = 'booking.slot_auto' LIMIT 1`;
  if (autoSetting?.value === false) {
    await sql`UPDATE settings SET value = 'true'::jsonb, updated_at = NOW() WHERE scope = 'system' AND key = 'booking.slot_auto'`;
    console.log('Legacy slot auto-generation default enabled.');
  }
  const [windowSetting] = await sql`SELECT value FROM settings WHERE scope = 'system' AND key = 'booking.slot_window_days' LIMIT 1`;
  if (Number(windowSetting?.value) === 30) {
    await sql`UPDATE settings SET value = '180'::jsonb, updated_at = NOW() WHERE scope = 'system' AND key = 'booking.slot_window_days'`;
    console.log('Legacy slot-generation window extended to 180 days.');
  }

  // Remove the now-migrated legacy setting.
  if (rows.length > 0) {
    await sql`DELETE FROM settings WHERE scope = 'system' AND key = 'clinic.opening_hours'`;
    console.log('Legacy clinic.opening_hours setting removed.');
  }

  await sql.end();
  console.log('Migration complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});