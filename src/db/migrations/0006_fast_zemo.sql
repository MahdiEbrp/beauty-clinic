CREATE TYPE "public"."locale" AS ENUM('en', 'fa');--> statement-breakpoint
CREATE TABLE "service_categories_i18n" (
	"category_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "service_categories_i18n_category_id_locale_pk" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "service_faqs_i18n" (
	"faq_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	CONSTRAINT "service_faqs_i18n_faq_id_locale_pk" PRIMARY KEY("faq_id","locale")
);
--> statement-breakpoint
CREATE TABLE "service_groups_i18n" (
	"group_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "service_groups_i18n_group_id_locale_pk" PRIMARY KEY("group_id","locale")
);
--> statement-breakpoint
CREATE TABLE "services_i18n" (
	"service_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"title" text NOT NULL,
	"short_desc" text,
	"full_desc" text,
	CONSTRAINT "services_i18n_service_id_locale_pk" PRIMARY KEY("service_id","locale")
);
--> statement-breakpoint
ALTER TABLE "service_categories_i18n" ADD CONSTRAINT "service_categories_i18n_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_faqs_i18n" ADD CONSTRAINT "service_faqs_i18n_faq_id_service_faqs_id_fk" FOREIGN KEY ("faq_id") REFERENCES "public"."service_faqs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_groups_i18n" ADD CONSTRAINT "service_groups_i18n_group_id_service_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."service_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services_i18n" ADD CONSTRAINT "services_i18n_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_categories" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "service_categories" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "service_categories" DROP COLUMN "seo_title";--> statement-breakpoint
ALTER TABLE "service_categories" DROP COLUMN "seo_description";--> statement-breakpoint
ALTER TABLE "service_faqs" DROP COLUMN "question";--> statement-breakpoint
ALTER TABLE "service_faqs" DROP COLUMN "answer";--> statement-breakpoint
ALTER TABLE "service_groups" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "service_groups" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "service_groups" DROP COLUMN "seo_title";--> statement-breakpoint
ALTER TABLE "service_groups" DROP COLUMN "seo_description";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "short_desc";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "full_desc";