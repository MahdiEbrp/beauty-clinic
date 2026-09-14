-- Group-based booking migration (idempotent).
--
-- Replaces service-scoped bookings with service-group-scoped bookings:
--   * adds booking_slot_groups (slot ↔ service_group availability)
--   * adds bookings.group_id / bookings.group_title
--   * drops the legacy service columns and booking_slot_services table
--
-- Written defensively so it can run on databases that already carry the
-- target schema (applied manually) as well as on fresh databases.

CREATE TABLE IF NOT EXISTS "booking_slot_groups" (
	"slot_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	CONSTRAINT "booking_slot_groups_slot_id_group_id_pk" PRIMARY KEY("slot_id","group_id")
);
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_slot_groups_slot_id_booking_slots_id_fk') THEN
		ALTER TABLE "booking_slot_groups" ADD CONSTRAINT "booking_slot_groups_slot_id_booking_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."booking_slots"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_slot_groups_group_id_service_groups_id_fk') THEN
		ALTER TABLE "booking_slot_groups" ADD CONSTRAINT "booking_slot_groups_group_id_service_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."service_groups"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_slot_groups_group_idx" ON "booking_slot_groups" USING btree ("group_id");
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "group_id" uuid;
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "group_title" text DEFAULT '' NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_group_id_service_groups_id_fk') THEN
		ALTER TABLE "bookings" ADD CONSTRAINT "bookings_group_id_service_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."service_groups"("id") ON DELETE set null ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_group_id_idx" ON "bookings" USING btree ("group_id");
--> statement-breakpoint
-- Backfill group fields from the legacy service link (only when it still exists).
DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'service_id')
		AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services')
		AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'service_categories')
		AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'service_groups_i18n')
	THEN
		UPDATE "bookings" b
		SET "group_id" = sc."group_id",
			"group_title" = COALESCE(
				(SELECT i18n."name" FROM "service_groups_i18n" i18n WHERE i18n."group_id" = sc."group_id" AND i18n."locale" = 'fa'),
				(SELECT i18n."name" FROM "service_groups_i18n" i18n WHERE i18n."group_id" = sc."group_id" AND i18n."locale" = 'en'),
				b."service_title"
			)
		FROM "services" s
		JOIN "service_categories" sc ON sc."id" = s."category_id"
		WHERE b."service_id" = s."id" AND b."group_id" IS NULL;
	END IF;
END $$;
--> statement-breakpoint
-- Backfill slot group links from the legacy slot service links, when present.
DO $$ BEGIN
	IF to_regclass('public.booking_slot_services') IS NOT NULL AND to_regclass('public.booking_slot_groups') IS NOT NULL THEN
		INSERT INTO "booking_slot_groups" ("slot_id", "group_id")
		SELECT DISTINCT bss."slot_id", sc."group_id"
		FROM "booking_slot_services" bss
		JOIN "services" s ON s."id" = bss."service_id"
		JOIN "service_categories" sc ON sc."id" = s."category_id"
		ON CONFLICT DO NOTHING;
	END IF;
END $$;
--> statement-breakpoint
DROP TABLE IF EXISTS "booking_slot_services" CASCADE;
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_service_id_services_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "bookings_service_id_idx";
--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "service_id";
--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "service_title";
--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "service_price";
--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "duration_min";
--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "sessions_count";
