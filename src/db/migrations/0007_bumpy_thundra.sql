ALTER TABLE "storage_nodes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "storage_nodes" CASCADE;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "price" SET DATA TYPE numeric(12, 2);