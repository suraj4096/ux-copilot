CREATE TABLE "form" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"template" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"answers" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"owner" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"email" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "form" ADD CONSTRAINT "form_survey_id_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."survey"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "response" ADD CONSTRAINT "response_form_id_form_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."form"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "survey" ADD CONSTRAINT "survey_owner_user_email_fk" FOREIGN KEY ("owner") REFERENCES "public"."user"("email") ON DELETE cascade ON UPDATE cascade;