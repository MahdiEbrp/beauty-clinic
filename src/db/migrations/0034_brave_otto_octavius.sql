CREATE TYPE "public"."payment_health_status" AS ENUM('unknown', 'healthy', 'unhealthy');--> statement-breakpoint
CREATE TYPE "public"."payment_provider_kind" AS ENUM('zarinpal', 'zibal', 'idpay', 'nextpay', 'mellat', 'parsian', 'fake');--> statement-breakpoint
CREATE TYPE "public"."payment_transaction_status" AS ENUM('pending', 'requested', 'verified', 'failed', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TABLE "payment_provider_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"checked_by" uuid,
	"is_successful" boolean NOT NULL,
	"response_time_ms" integer,
	"status_code" integer,
	"error_code" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "payment_provider_kind" NOT NULL,
	"merchant_id_encrypted" text NOT NULL,
	"api_url_encrypted" text NOT NULL,
	"settings_encrypted" text NOT NULL,
	"merchant_last4" text DEFAULT '' NOT NULL,
	"callback_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"health_status" "payment_health_status" DEFAULT 'unknown' NOT NULL,
	"last_health_checked_at" timestamp with time zone,
	"last_health_error" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid,
	"booking_group_ref" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'تومان' NOT NULL,
	"description" text,
	"authority" text,
	"ref_id" text,
	"card_pan" text,
	"status" "payment_transaction_status" DEFAULT 'pending' NOT NULL,
	"callback_url" text,
	"error_code" text,
	"error_message" text,
	"verified_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "payment_transactions_authority_unique" UNIQUE("authority")
);
--> statement-breakpoint
ALTER TABLE "payment_provider_checks" ADD CONSTRAINT "payment_provider_checks_provider_id_payment_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."payment_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_provider_checks" ADD CONSTRAINT "payment_provider_checks_checked_by_users_id_fk" FOREIGN KEY ("checked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_providers" ADD CONSTRAINT "payment_providers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_provider_id_payment_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."payment_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payment_provider_checks_provider_created_idx" ON "payment_provider_checks" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_providers_active_idx" ON "payment_providers" USING btree ("is_active","deleted_at");--> statement-breakpoint
CREATE INDEX "payment_providers_health_idx" ON "payment_providers" USING btree ("health_status","last_health_checked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_providers_default_idx" ON "payment_providers" USING btree ("is_default") WHERE "payment_providers"."is_default" = true AND "payment_providers"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "payment_transactions_group_ref_idx" ON "payment_transactions" USING btree ("booking_group_ref");--> statement-breakpoint
CREATE INDEX "payment_transactions_authority_idx" ON "payment_transactions" USING btree ("authority");--> statement-breakpoint
CREATE INDEX "payment_transactions_provider_created_idx" ON "payment_transactions" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_transactions_status_created_idx" ON "payment_transactions" USING btree ("status","created_at");