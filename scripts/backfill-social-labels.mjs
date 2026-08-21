import postgres from 'postgres';
import dotenv from 'dotenv';

// The app runs with `--env-file=.env.local` (see package.json db:seed); load it
// explicitly so this script hits the same Supabase instance regardless of CWD.
dotenv.config({ path: '.env.local' });

// Backfills missing / outdated localized labels for social_links rows.
//
// The old seed only inserted `social_links_i18n` rows when the `social_links`
// row was freshly created (guarded by `if (row)` after `onConflictDoNothing`).
// Consequently any link that already existed in the DB (e.g. `bale` /
// https://ble.ir/nafasclinic) was never labelled and fell back to showing its
// raw URL. This script mirrors the (now idempotent) seed logic and inserts the
// missing label rows without disturbing the rest of the catalog.

// Keep in sync with SOCIAL_LINKS in src/db/seed/definitions.ts.
const LINKS = [
  { url: 'https://rubika.ir/nafasclinic', labelFa: 'روبیکا', labelEn: 'Rubika' },
  { url: 'https://ble.ir/nafasclinic', labelFa: 'بله', labelEn: 'Bale' },
  { url: 'https://instagram.com/nafasclinic', labelFa: 'اینستاگرام', labelEn: 'Instagram' },
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    for (const link of LINKS) {
      await sql`
        INSERT INTO social_links (url, display_order)
        VALUES (${link.url}, 0)
        ON CONFLICT (url) DO NOTHING;
      `;

      const [{ id }] = await sql`
        SELECT id FROM social_links WHERE url = ${link.url};
      `;

      const existing = await sql`
        SELECT locale FROM social_links_i18n WHERE social_link_id = ${id};
      `;
      const have = new Set(existing.map((r) => r.locale));

      const rows = [
        { locale: 'fa', label: link.labelFa },
        { locale: 'en', label: link.labelEn },
      ].filter((r) => !have.has(r.locale));

      if (rows.length === 0) {
        console.log(`  no-op, labels already present for ${link.url}`);
        continue;
      }

      for (const row of rows) {
        await sql`
          INSERT INTO social_links_i18n (social_link_id, locale, label)
          VALUES (${id}, ${row.locale}, ${row.label})
          ON CONFLICT (social_link_id, locale) DO NOTHING;
        `;
      }
      console.log(`  backfilled labels for ${link.url}: ${rows.map((r) => r.locale).join(', ')}`);
    }

    console.log('backfill complete.');
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});