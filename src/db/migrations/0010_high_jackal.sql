CREATE TABLE "landing_about_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" integer NOT NULL,
	"compact" boolean DEFAULT false NOT NULL,
	"plus" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landing_about_stats_i18n" (
	"stat_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "landing_about_stats_i18n_stat_id_locale_pk" PRIMARY KEY("stat_id","locale")
);
--> statement-breakpoint
CREATE TABLE "landing_gallery_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"key" text NOT NULL,
	"image_url" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landing_gallery_items_i18n" (
	"gallery_item_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"caption" text,
	"alt" text NOT NULL,
	CONSTRAINT "landing_gallery_items_i18n_gallery_item_id_locale_pk" PRIMARY KEY("gallery_item_id","locale")
);
--> statement-breakpoint
CREATE TABLE "landing_hero" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landing_page_id" uuid NOT NULL,
	"image" text,
	"tagline_icon" text
);
--> statement-breakpoint
CREATE TABLE "landing_hero_i18n" (
	"hero_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"title" text NOT NULL,
	"tagline" text,
	"description" text,
	"cta_label_1" text NOT NULL,
	"cta_label_2" text NOT NULL,
	CONSTRAINT "landing_hero_i18n_hero_id_locale_pk" PRIMARY KEY("hero_id","locale")
);
--> statement-breakpoint
CREATE TABLE "landing_marquee_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landing_page_id" uuid NOT NULL,
	"key" text NOT NULL,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landing_marquee_items_i18n" (
	"marquee_item_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "landing_marquee_items_i18n_marquee_item_id_locale_pk" PRIMARY KEY("marquee_item_id","locale")
);
--> statement-breakpoint
CREATE TABLE "landing_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landing_pages_i18n" (
	"landing_page_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "landing_pages_i18n_landing_page_id_locale_pk" PRIMARY KEY("landing_page_id","locale")
);
--> statement-breakpoint
CREATE TABLE "landing_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landing_page_id" uuid NOT NULL,
	"key" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landing_sections_i18n" (
	"section_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"heading" text NOT NULL,
	"description" text,
	CONSTRAINT "landing_sections_i18n_section_id_locale_pk" PRIMARY KEY("section_id","locale")
);
--> statement-breakpoint
CREATE TABLE "landing_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landing_services_i18n" (
	"landing_service_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"description" text,
	"cta_label" text,
	CONSTRAINT "landing_services_i18n_landing_service_id_locale_pk" PRIMARY KEY("landing_service_id","locale")
);
--> statement-breakpoint
ALTER TABLE "landing_about_stats" ADD CONSTRAINT "landing_about_stats_section_id_landing_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."landing_sections"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_about_stats_i18n" ADD CONSTRAINT "landing_about_stats_i18n_stat_id_landing_about_stats_id_fk" FOREIGN KEY ("stat_id") REFERENCES "public"."landing_about_stats"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_gallery_items" ADD CONSTRAINT "landing_gallery_items_section_id_landing_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."landing_sections"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_gallery_items_i18n" ADD CONSTRAINT "landing_gallery_items_i18n_gallery_item_id_landing_gallery_items_id_fk" FOREIGN KEY ("gallery_item_id") REFERENCES "public"."landing_gallery_items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_hero" ADD CONSTRAINT "landing_hero_landing_page_id_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_hero_i18n" ADD CONSTRAINT "landing_hero_i18n_hero_id_landing_hero_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."landing_hero"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_marquee_items" ADD CONSTRAINT "landing_marquee_items_landing_page_id_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_marquee_items_i18n" ADD CONSTRAINT "landing_marquee_items_i18n_marquee_item_id_landing_marquee_items_id_fk" FOREIGN KEY ("marquee_item_id") REFERENCES "public"."landing_marquee_items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_pages_i18n" ADD CONSTRAINT "landing_pages_i18n_landing_page_id_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_sections" ADD CONSTRAINT "landing_sections_landing_page_id_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_sections_i18n" ADD CONSTRAINT "landing_sections_i18n_section_id_landing_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."landing_sections"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_services" ADD CONSTRAINT "landing_services_section_id_landing_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."landing_sections"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_services" ADD CONSTRAINT "landing_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "landing_services_i18n" ADD CONSTRAINT "landing_services_i18n_landing_service_id_landing_services_id_fk" FOREIGN KEY ("landing_service_id") REFERENCES "public"."landing_services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "landing_about_stats_section_key_idx" ON "landing_about_stats" USING btree ("section_id","key");--> statement-breakpoint
CREATE INDEX "landing_about_stats_section_active_idx" ON "landing_about_stats" USING btree ("section_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_gallery_items_section_key_idx" ON "landing_gallery_items" USING btree ("section_id","key");--> statement-breakpoint
CREATE INDEX "landing_gallery_items_section_active_idx" ON "landing_gallery_items" USING btree ("section_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_hero_page_idx" ON "landing_hero" USING btree ("landing_page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_marquee_items_page_key_idx" ON "landing_marquee_items" USING btree ("landing_page_id","key");--> statement-breakpoint
CREATE INDEX "landing_marquee_items_page_active_idx" ON "landing_marquee_items" USING btree ("landing_page_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_pages_slug_idx" ON "landing_pages" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_sections_page_key_idx" ON "landing_sections" USING btree ("landing_page_id","key");--> statement-breakpoint
CREATE INDEX "landing_sections_page_active_idx" ON "landing_sections" USING btree ("landing_page_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_services_section_service_idx" ON "landing_services" USING btree ("section_id","service_id");--> statement-breakpoint
CREATE INDEX "landing_services_section_active_idx" ON "landing_services" USING btree ("section_id","is_active");