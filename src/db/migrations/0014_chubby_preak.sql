CREATE TABLE "care_guide_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"highlighted" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_guide_items_i18n" (
	"item_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	CONSTRAINT "care_guide_items_i18n_item_id_locale_pk" PRIMARY KEY("item_id","locale")
);
--> statement-breakpoint
CREATE TABLE "care_guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_guides_i18n" (
	"guide_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "care_guides_i18n_guide_id_locale_pk" PRIMARY KEY("guide_id","locale")
);
--> statement-breakpoint
ALTER TABLE "care_guide_items" ADD CONSTRAINT "care_guide_items_guide_id_care_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."care_guides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_guide_items_i18n" ADD CONSTRAINT "care_guide_items_i18n_item_id_care_guide_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."care_guide_items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "care_guides_i18n" ADD CONSTRAINT "care_guides_i18n_guide_id_care_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."care_guides"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "care_guide_items_guide_order_idx" ON "care_guide_items" USING btree ("guide_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "care_guides_slug_idx" ON "care_guides" USING btree ("slug");