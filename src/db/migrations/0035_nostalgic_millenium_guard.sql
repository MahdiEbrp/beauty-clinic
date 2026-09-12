ALTER TABLE "payment_transactions" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "locale" text DEFAULT 'fa' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "payment_url" text;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "payment_transactions_idempotency_idx" ON "payment_transactions" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "payment_transactions_expiry_idx" ON "payment_transactions" USING btree ("status","expires_at");--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_idempotency_key_unique" UNIQUE("idempotency_key");