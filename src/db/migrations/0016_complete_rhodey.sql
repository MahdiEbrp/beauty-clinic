CREATE TABLE "booking_slot_services" (
	"slot_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "booking_slot_services_slot_id_service_id_pk" PRIMARY KEY("slot_id","service_id")
);
--> statement-breakpoint
ALTER TABLE "booking_slots" DROP CONSTRAINT "booking_slots_service_id_services_id_fk";
--> statement-breakpoint
DROP INDEX "booking_slots_service_date_idx";--> statement-breakpoint
ALTER TABLE "booking_slot_services" ADD CONSTRAINT "booking_slot_services_slot_id_booking_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."booking_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_slot_services" ADD CONSTRAINT "booking_slot_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_slot_services_service_idx" ON "booking_slot_services" USING btree ("service_id");--> statement-breakpoint
-- Backfill: migrate the old single-service link into the junction table.
INSERT INTO "booking_slot_services" ("slot_id", "service_id")
SELECT "id", "service_id" FROM "booking_slots"
WHERE "service_id" IS NOT NULL
ON CONFLICT DO NOTHING;--> statement-breakpoint
ALTER TABLE "booking_slots" DROP COLUMN "service_id";