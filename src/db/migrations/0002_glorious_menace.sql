DROP INDEX "settings_user_key_idx";--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "scope" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "settings_system_key_idx" ON "settings" USING btree ("key") WHERE "settings"."scope" = 'system';--> statement-breakpoint
CREATE UNIQUE INDEX "settings_user_key_idx" ON "settings" USING btree ("user_id","key") WHERE "settings"."scope" = 'user';