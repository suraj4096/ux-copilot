CREATE EXTENSION IF NOT EXISTS pg_trgm; --> statement-breakpoint
CREATE INDEX "form_response_answers_text_trgm_idx" ON "form_response" USING gin (("answers"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "form_response_form_submitted_id_idx" ON "form_response" USING btree ("survey_form_id","submitted_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "survey_title_trgm_idx" ON "survey" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "survey_owner_title_id_idx" ON "survey" USING btree ("owner","title","id");--> statement-breakpoint
CREATE INDEX "survey_form_title_trgm_idx" ON "survey_form" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "survey_form_description_trgm_idx" ON "survey_form" USING gin ("description" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "survey_form_template_text_trgm_idx" ON "survey_form" USING gin (("template"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "survey_form_survey_title_id_idx" ON "survey_form" USING btree ("survey_id","title","id");