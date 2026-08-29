ALTER TABLE "bookings" ADD COLUMN "group_ref" text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE "bookings" SET "group_ref" = "id"::text WHERE "group_ref" = '';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "group_ref" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "consultation_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "has_allergies" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "is_pregnant" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "bookings_group_ref_idx" ON "bookings" USING btree ("group_ref");