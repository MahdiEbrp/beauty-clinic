CREATE TABLE "slot_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day" text NOT NULL,
	"start_time" time NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "slot_patterns_day_idx" ON "slot_patterns" USING btree ("day");--> statement-breakpoint
CREATE UNIQUE INDEX "slot_patterns_day_start_idx" ON "slot_patterns" USING btree ("day","start_time");