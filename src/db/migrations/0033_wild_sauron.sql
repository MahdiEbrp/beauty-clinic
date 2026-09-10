ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
-- Map legacy statuses onto the new lifecycle before the enum cast:
--   processing -> paid | refund -> refunded | canceled -> refunded when paid, else pending
UPDATE "bookings" SET "status" = 'paid' WHERE "status" = 'processing';--> statement-breakpoint
UPDATE "bookings" SET "status" = 'refunded' WHERE "status" = 'refund';--> statement-breakpoint
UPDATE "bookings" SET "status" = 'refunded' WHERE "status" = 'canceled' AND "payment_reference" IS NOT NULL;--> statement-breakpoint
UPDATE "bookings" SET "status" = 'pending' WHERE "status" = 'canceled';--> statement-breakpoint
DROP TYPE "public"."booking_status";--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'paid', 'waiting', 'done', 'refunded');--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."booking_status" USING "status"::"public"."booking_status";