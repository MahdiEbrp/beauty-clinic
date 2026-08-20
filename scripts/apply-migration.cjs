const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const sql = postgres(process.env.DATABASE_URL);

  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0 NOT NULL;`;
  console.log('Settings columns added');

  await sql`CREATE TABLE IF NOT EXISTS settings_i18n (
    setting_id uuid NOT NULL,
    locale locale NOT NULL,
    value jsonb NOT NULL,
    PRIMARY KEY (setting_id, locale)
  );`;
  await sql`ALTER TABLE settings_i18n ADD CONSTRAINT IF NOT EXISTS settings_i18n_setting_id_settings_id_fk FOREIGN KEY (setting_id) REFERENCES settings(id) ON DELETE cascade ON UPDATE cascade;`;
  console.log('settings_i18n created');

  await sql`CREATE TABLE IF NOT EXISTS social_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    image_url text,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
  );`;
  await sql`CREATE TABLE IF NOT EXISTS social_links_i18n (
    social_link_id uuid NOT NULL,
    locale locale NOT NULL,
    label text NOT NULL,
    PRIMARY KEY (social_link_id, locale)
  );`;
  await sql`ALTER TABLE social_links_i18n ADD CONSTRAINT IF NOT EXISTS social_links_i18n_social_link_id_social_links_id_fk FOREIGN KEY (social_link_id) REFERENCES social_links(id) ON DELETE cascade ON UPDATE cascade;`;
  await sql`CREATE INDEX IF NOT EXISTS social_links_active_order_idx ON social_links USING btree (is_active, display_order);`;
  console.log('social_links created');

  await sql`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
  );`;
  await sql`INSERT INTO __drizzle_migrations (hash) VALUES ('0013_settings-social-clinic') ON CONFLICT DO NOTHING;`;
  console.log('migration tracked');

  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });