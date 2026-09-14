CREATE TABLE "slot_pattern_groups" (
	"pattern_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	CONSTRAINT "slot_pattern_groups_pattern_id_group_id_pk" PRIMARY KEY("pattern_id","group_id")
);
--> statement-breakpoint
ALTER TABLE "slot_pattern_groups" ADD CONSTRAINT "slot_pattern_groups_pattern_id_slot_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."slot_patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_pattern_groups" ADD CONSTRAINT "slot_pattern_groups_group_id_service_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."service_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "slot_pattern_groups_group_idx" ON "slot_pattern_groups" USING btree ("group_id");