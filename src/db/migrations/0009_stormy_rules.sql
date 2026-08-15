CREATE TABLE IF NOT EXISTS "rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"image" text,
	"color" text,
	"highlighted" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rules_slug_idx" ON "rules" ("slug");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rules_i18n" (
	"rule_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "rules_i18n" ADD CONSTRAINT "rules_i18n_rule_id_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."rules"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rules_i18n" ADD CONSTRAINT "rules_i18n_rule_id_locale_pk" PRIMARY KEY ("rule_id", "locale");
