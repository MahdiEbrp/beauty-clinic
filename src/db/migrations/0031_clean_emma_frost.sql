-- Booking status → pending → processing → canceled / refund.
--
-- Applied in separate commits (an enum value added in one transaction cannot
-- be used by an UPDATE in the same transaction):
--   1) add 'processing' + 'refund',
--   2) rename legacy 'cancelled' → 'canceled',
--   3) remap existing 'confirmed'/'paid' rows → 'processing',
--   4) add bookings.customer_id (FK to users, ON DELETE SET NULL).
-- The legacy enum values 'confirmed'/'paid' are left inert: this server does
-- not implement ALTER TYPE ... DROP VALUE, and no code references them.
ALTER TYPE "public"."booking_status" ADD VALUE IF NOT EXISTS 'processing';--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE IF NOT EXISTS 'refund';--> statement-breakpoint
ALTER TYPE "public"."booking_status" RENAME VALUE 'cancelled' TO 'canceled';--> statement-breakpoint
UPDATE "bookings" SET "status" = 'processing' WHERE "status" IN ('confirmed', 'paid');--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_customer_id_idx" ON "bookings" USING btree ("customer_id");
