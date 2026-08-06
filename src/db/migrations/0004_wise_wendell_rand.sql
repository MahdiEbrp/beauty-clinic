CREATE TABLE "storage_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"type" text NOT NULL,
	"size" bigint DEFAULT 0 NOT NULL,
	"mime" text,
	"created_by" uuid,
	"trashed_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storage_nodes" ADD CONSTRAINT "storage_nodes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "storage_nodes_path_idx" ON "storage_nodes" USING btree ("path");--> statement-breakpoint
CREATE INDEX "storage_nodes_trashed_at_idx" ON "storage_nodes" USING btree ("trashed_at");--> statement-breakpoint
CREATE INDEX "storage_nodes_created_by_idx" ON "storage_nodes" USING btree ("created_by");