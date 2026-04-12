import { sql } from "drizzle-orm"
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  email: text("email").primaryKey(),
})

export const survey = pgTable(
  "survey",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    owner: text("owner")
      .notNull()
      .references(() => user.email, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => [
    index("survey_title_trgm_idx").using("gin", table.title.op("gin_trgm_ops")),
    index("survey_owner_title_id_idx").on(table.owner, table.title, table.id),
  ],
)

export const surveyForm = pgTable(
  "survey_form",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    surveyId: uuid("survey_id")
      .notNull()
      .references(() => survey.id, { onDelete: "cascade", onUpdate: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    template: jsonb("template").notNull(),
  },
  (table) => [
    index("survey_form_title_trgm_idx").using(
      "gin",
      table.title.op("gin_trgm_ops"),
    ),
    index("survey_form_description_trgm_idx").using(
      "gin",
      table.description.op("gin_trgm_ops"),
    ),
    index("survey_form_template_text_trgm_idx").using(
      "gin",
      sql`(${table.template}::text) gin_trgm_ops`,
    ),
    index("survey_form_survey_title_id_idx").on(
      table.surveyId,
      table.title,
      table.id,
    ),
  ],
)

export const formResponse = pgTable(
  "form_response",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    surveyFormId: uuid("survey_form_id")
      .notNull()
      .references(() => surveyForm.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    answers: jsonb("answers").notNull(),
  },
  (table) => [
    index("form_response_answers_text_trgm_idx").using(
      "gin",
      sql`(${table.answers}::text) gin_trgm_ops`,
    ),
    index("form_response_form_submitted_id_idx").on(
      table.surveyFormId,
      table.submittedAt.desc(),
      table.id.desc(),
    ),
  ],
)
