CREATE TABLE "sms_received_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid,
	"receive_return_id" text NOT NULL,
	"number" text NOT NULL,
	"mobile_encrypted" text NOT NULL,
	"mobile_hash" text NOT NULL,
	"message_encrypted" text NOT NULL,
	"received_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sms_received_messages" ADD CONSTRAINT "sms_received_messages_provider_id_sms_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."sms_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sms_received_return_idx" ON "sms_received_messages" USING btree ("provider_id","receive_return_id");--> statement-breakpoint
CREATE INDEX "sms_received_received_at_idx" ON "sms_received_messages" USING btree ("received_at");