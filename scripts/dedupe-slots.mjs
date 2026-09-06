import postgres from 'postgres';
import 'dotenv/config';

/**
 * One-time data fix: before the `booking_slots_date_start_idx` unique index
 * is applied (drizzle migrate 0027), merge duplicate (slot_date, start_time)
 * slot rows that the old generator could produce.
 *
 * Order: run this script BEFORE `pnpm db:migrate` (it repairs the data so the
 * unique index can be created).
 *
 * Behavior (idempotent — nothing left grouped means nothing to do):
 *  - groups booking_slots by (slot_date, start_time), keeps only groups > 1
 *  - survivor = most non-cancelled bookings, then most total bookings, then
 *    newest created_at, then lowest id (deterministic)
 *  - re-points `bookings.slot_id` from each duplicate to the survivor
 *  - merges the duplicate's service links into the survivor
 *    (booking_slot_services survives, so booked services stay bookable)
 *  - deletes the duplicate slot rows
 */
async function main() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  const slots = await sql`SELECT id, slot_date, start_time, created_at FROM booking_slots`;
  if (slots.length === 0) {
    await sql.end();
    console.log('No booking slots found — nothing to do.');
    return;
  }

  const groups = new Map();
  for (const slot of slots) {
    const key = `${String(slot.slot_date)}|${String(slot.start_time)}`;
    const list = groups.get(key) ?? [];
    list.push(slot);
    groups.set(key, list);
  }

  const dupGroups = [...groups.values()].filter((list) => list.length > 1);
  if (dupGroups.length === 0) {
    await sql.end();
    console.log('No duplicate (date, start_time) slot pairs found — nothing to do.');
    return;
  }

  const booked = await sql`
    SELECT slot_id,
           count(*)::int AS total,
           bool_or(status <> 'cancelled') AS has_active
    FROM bookings
    WHERE slot_id IN ${sql(slots.map((s) => s.id))}
    GROUP BY slot_id
  `;
  const stats = new Map(booked.map((b) => [String(b.slot_id), b]));
  const statsOf = (id) => stats.get(String(id)) ?? { total: 0, has_active: false };

  const pickSurvivor = (list) =>
    list
      .slice()
      .sort((a, b) => {
        const ra = statsOf(a.id);
        const rb = statsOf(b.id);
        if (ra.has_active !== rb.has_active) return rb.has_active ? 1 : -1;
        if (ra.total !== rb.total) return rb.total - ra.total;
        const ca = new Date(a.created_at).getTime();
        const cb = new Date(b.created_at).getTime();
        if (ca !== cb) return cb - ca;
        return a.id < b.id ? -1 : 1;
      })[0];

  let removed = 0;
  let repointed = 0;
  let merged = 0;

  await sql.begin(async (tx) => {
    for (const list of dupGroups) {
      const survivor = pickSurvivor(list);
      const losers = list.filter((s) => s.id !== survivor.id);

      const repoint = await tx`
        UPDATE bookings SET slot_id = ${survivor.id}
        WHERE slot_id IN ${tx(losers.map((s) => s.id))}
        RETURNING id
      `;
      repointed += repoint.length;

      const links = await tx`
        SELECT DISTINCT service_id FROM booking_slot_services
        WHERE slot_id IN ${tx(losers.map((s) => s.id))}
      `;
      if (links.length > 0) {
        const inserted = await tx`
          INSERT INTO booking_slot_services (slot_id, service_id)
          SELECT ${survivor.id}, unnest(${links.map((l) => l.service_id)}::uuid[])
          ON CONFLICT (slot_id, service_id) DO NOTHING
          RETURNING slot_id
        `;
        merged += inserted.length;
      }

      await tx`DELETE FROM booking_slots WHERE id IN ${tx(losers.map((s) => s.id))}`;
      removed += losers.length;
    }
  });

  await sql.end();

  console.log(`Duplicate groups found: ${dupGroups.length}`);
  console.log(`Slots removed: ${removed}`);
  console.log(`Bookings re-pointed: ${repointed}`);
  console.log(`Service links merged: ${merged}`);
  console.log('Done. You can now run `pnpm db:migrate` to apply the unique index.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});