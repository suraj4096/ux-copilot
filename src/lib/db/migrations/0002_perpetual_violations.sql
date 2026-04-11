ALTER TABLE "response" RENAME TO "form_response";--> statement-breakpoint
ALTER TABLE "form" RENAME TO "survey_form";--> statement-breakpoint
ALTER TABLE "form_response" RENAME COLUMN "form_id" TO "survey_form_id";--> statement-breakpoint
ALTER TABLE "survey_form" DROP CONSTRAINT "form_survey_id_survey_id_fk";
--> statement-breakpoint
ALTER TABLE "form_response" DROP CONSTRAINT "response_form_id_form_id_fk";
--> statement-breakpoint
ALTER TABLE "survey_form" ADD CONSTRAINT "survey_form_survey_id_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."survey"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "form_response" ADD CONSTRAINT "form_response_survey_form_id_survey_form_id_fk" FOREIGN KEY ("survey_form_id") REFERENCES "public"."survey_form"("id") ON DELETE cascade ON UPDATE cascade;