CREATE TABLE "settings_i18n" (
	"setting_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"value" jsonb NOT NULL,
	CONSTRAINT "settings_i18n_setting_id_locale_pk" PRIMARY KEY("setting_id","locale")
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"image_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links_i18n" (
	"social_link_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "social_links_i18n_social_link_id_locale_pk" PRIMARY KEY("social_link_id","locale")
);
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings_i18n" ADD CONSTRAINT "settings_i18n_setting_id_settings_id_fk" FOREIGN KEY ("setting_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "social_links_i18n" ADD CONSTRAINT "social_links_i18n_social_link_id_social_links_id_fk" FOREIGN KEY ("social_link_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "social_links_active_order_idx" ON "social_links" USING btree ("is_active","display_order");