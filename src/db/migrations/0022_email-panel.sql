CREATE TYPE "public"."email_campaign_status" AS ENUM('queued', 'sending', 'sent', 'partial', 'failed');--> statement-breakpoint
CREATE TYPE "public"."email_content_format" AS ENUM('plain', 'html');--> statement-breakpoint
CREATE TYPE "public"."email_encryption" AS ENUM('ssl', 'starttls', 'none');--> statement-breakpoint
CREATE TYPE "public"."email_health_status" AS ENUM('unknown', 'healthy', 'unhealthy');--> statement-breakpoint
CREATE TYPE "public"."email_message_status" AS ENUM('queued', 'sending', 'sent', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "public"."email_message_type" AS ENUM('transactional', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."email_provider_kind" AS ENUM('gmail', 'outlook', 'yahoo', 'custom');--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"provider_id" uuid,
	"template_id" uuid,
	"message_type" "email_message_type" DEFAULT 'transactional' NOT NULL,
	"content_format" "email_content_format" DEFAULT 'html' NOT NULL,
	"from_email" text,
	"total_recipients" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"status" "email_campaign_status" DEFAULT 'queued' NOT NULL,
	"idempotency_key" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"provider_id" uuid,
	"template_id" uuid,
	"created_by" uuid,
	"recipient_encrypted" text NOT NULL,
	"recipient_hash" text NOT NULL,
	"recipient_masked" text NOT NULL,
	"subject_encrypted" text NOT NULL,
	"body_encrypted" text NOT NULL,
	"from_email" text,
	"status" "email_message_status" DEFAULT 'queued' NOT NULL,
	"provider_message_id" text,
	"provider_status" text,
	"provider_response_code" integer,
	"error_code" text,
	"error_message" text,
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_provider_checks" (
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
CREATE TABLE "email_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "email_provider_kind" NOT NULL,
	"host_encrypted" text NOT NULL,
	"port_encrypted" text NOT NULL,
	"username_encrypted" text NOT NULL,
	"password_encrypted" text NOT NULL,
	"password_last4" text DEFAULT '' NOT NULL,
	"encryption" "email_encryption" DEFAULT 'ssl' NOT NULL,
	"from_email" text,
	"from_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"health_status" "email_health_status" DEFAULT 'unknown' NOT NULL,
	"last_health_checked_at" timestamp with time zone,
	"last_health_error" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"external_template_id" text,
	"message_type" "email_message_type" DEFAULT 'transactional' NOT NULL,
	"content_format" "email_content_format" DEFAULT 'html' NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_templates_i18n" (
	"template_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "email_templates_i18n_template_id_locale_pk" PRIMARY KEY("template_id","locale")
);
--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_provider_id_email_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."email_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_campaign_id_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_provider_id_email_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."email_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_provider_checks" ADD CONSTRAINT "email_provider_checks_provider_id_email_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."email_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_provider_checks" ADD CONSTRAINT "email_provider_checks_checked_by_users_id_fk" FOREIGN KEY ("checked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_providers" ADD CONSTRAINT "email_providers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates_i18n" ADD CONSTRAINT "email_templates_i18n_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "email_campaigns_status_created_idx" ON "email_campaigns" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "email_campaigns_provider_idx" ON "email_campaigns" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_campaigns_idempotency_idx" ON "email_campaigns" USING btree ("idempotency_key") WHERE "email_campaigns"."idempotency_key" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "email_messages_campaign_idx" ON "email_messages" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "email_messages_status_created_idx" ON "email_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "email_messages_provider_idx" ON "email_messages" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE INDEX "email_messages_recipient_hash_idx" ON "email_messages" USING btree ("recipient_hash");--> statement-breakpoint
CREATE INDEX "email_messages_provider_message_idx" ON "email_messages" USING btree ("provider_message_id");--> statement-breakpoint
CREATE INDEX "email_provider_checks_provider_created_idx" ON "email_provider_checks" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE INDEX "email_providers_active_idx" ON "email_providers" USING btree ("is_active","deleted_at");--> statement-breakpoint
CREATE INDEX "email_providers_health_idx" ON "email_providers" USING btree ("health_status","last_health_checked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_providers_default_idx" ON "email_providers" USING btree ("is_default") WHERE "email_providers"."is_default" = true AND "email_providers"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "email_templates_key_idx" ON "email_templates" USING btree ("key") WHERE "email_templates"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "email_templates_active_order_idx" ON "email_templates" USING btree ("is_active","display_order","deleted_at");