ALTER TABLE "landing_services" DROP CONSTRAINT "landing_services_service_id_services_id_fk";
--> statement-breakpoint
DROP INDEX "landing_services_section_service_idx";--> statement-breakpoint
ALTER TABLE "landing_services" ALTER COLUMN "service_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "landing_services" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "landing_services" ADD CONSTRAINT "landing_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "landing_services_section_key_idx" ON "landing_services" USING btree ("section_id","key");