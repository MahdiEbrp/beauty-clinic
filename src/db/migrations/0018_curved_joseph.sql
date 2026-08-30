CREATE TYPE "public"."sms_campaign_status" AS ENUM('queued', 'sending', 'sent', 'partial', 'failed');--> statement-breakpoint
CREATE TYPE "public"."sms_health_status" AS ENUM('unknown', 'healthy', 'unhealthy');--> statement-breakpoint
CREATE TYPE "public"."sms_message_status" AS ENUM('queued', 'sending', 'sent', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "public"."sms_message_type" AS ENUM('transactional', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."sms_provider_kind" AS ENUM('kavenegar', 'sms_ir', 'ippanel', 'melipayamak', 'custom');--> statement-breakpoint
CREATE TABLE "sms_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"provider_id" uuid,
	"template_id" uuid,
	"message_type" "sms_message_type" DEFAULT 'transactional' NOT NULL,
	"sender" text,
	"total_recipients" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"status" "sms_campaign_status" DEFAULT 'queued' NOT NULL,
	"idempotency_key" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sms_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"provider_id" uuid,
	"template_id" uuid,
	"created_by" uuid,
	"recipient_encrypted" text NOT NULL,
	"recipient_hash" text NOT NULL,
	"recipient_masked" text NOT NULL,
	"body_encrypted" text NOT NULL,
	"sender" text,
	"status" "sms_message_status" DEFAULT 'queued' NOT NULL,
	"provider_message_id" text,
	"provider_status" text,
	"provider_response_code" integer,
	"cost" numeric(12, 4),
	"error_code" text,
	"error_message" text,
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_provider_checks" (
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
CREATE TABLE "sms_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "sms_provider_kind" NOT NULL,
	"api_url_encrypted" text NOT NULL,
	"token_encrypted" text NOT NULL,
	"settings_encrypted" text NOT NULL,
	"token_last4" text DEFAULT '' NOT NULL,
	"sender" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"health_status" "sms_health_status" DEFAULT 'unknown' NOT NULL,
	"last_health_checked_at" timestamp with time zone,
	"last_health_error" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sms_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"message_type" "sms_message_type" DEFAULT 'transactional' NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sms_templates_i18n" (
	"template_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "sms_templates_i18n_template_id_locale_pk" PRIMARY KEY("template_id","locale")
);
--> statement-breakpoint
ALTER TABLE "sms_campaigns" ADD CONSTRAINT "sms_campaigns_provider_id_sms_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."sms_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_campaigns" ADD CONSTRAINT "sms_campaigns_template_id_sms_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."sms_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_campaigns" ADD CONSTRAINT "sms_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_campaign_id_sms_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."sms_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_provider_id_sms_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."sms_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_template_id_sms_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."sms_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_provider_checks" ADD CONSTRAINT "sms_provider_checks_provider_id_sms_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."sms_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_provider_checks" ADD CONSTRAINT "sms_provider_checks_checked_by_users_id_fk" FOREIGN KEY ("checked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_providers" ADD CONSTRAINT "sms_providers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_templates" ADD CONSTRAINT "sms_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_templates_i18n" ADD CONSTRAINT "sms_templates_i18n_template_id_sms_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."sms_templates"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "sms_campaigns_status_created_idx" ON "sms_campaigns" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "sms_campaigns_provider_idx" ON "sms_campaigns" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sms_campaigns_idempotency_idx" ON "sms_campaigns" USING btree ("idempotency_key") WHERE "sms_campaigns"."idempotency_key" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "sms_messages_campaign_idx" ON "sms_messages" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "sms_messages_status_created_idx" ON "sms_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "sms_messages_provider_idx" ON "sms_messages" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE INDEX "sms_messages_recipient_hash_idx" ON "sms_messages" USING btree ("recipient_hash");--> statement-breakpoint
CREATE INDEX "sms_messages_provider_message_idx" ON "sms_messages" USING btree ("provider_message_id");--> statement-breakpoint
CREATE INDEX "sms_provider_checks_provider_created_idx" ON "sms_provider_checks" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE INDEX "sms_providers_active_idx" ON "sms_providers" USING btree ("is_active","deleted_at");--> statement-breakpoint
CREATE INDEX "sms_providers_health_idx" ON "sms_providers" USING btree ("health_status","last_health_checked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sms_providers_default_idx" ON "sms_providers" USING btree ("is_default") WHERE "sms_providers"."is_default" = true AND "sms_providers"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "sms_templates_key_idx" ON "sms_templates" USING btree ("key") WHERE "sms_templates"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "sms_templates_active_order_idx" ON "sms_templates" USING btree ("is_active","display_order","deleted_at");