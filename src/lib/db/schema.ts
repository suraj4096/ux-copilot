import {
    pgTable,
    text,
    uuid,
    jsonb,
    timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    email: text("email").primaryKey(),
})

export const survey = pgTable("survey", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    owner: text("owner")
        .notNull()
        .references(() => user.email, { onDelete: "cascade", onUpdate: "cascade" }),
})

export const surveyForm = pgTable("survey_form", {
    id: uuid("id").defaultRandom().primaryKey(),
    surveyId: uuid("survey_id")
        .notNull()
        .references(() => survey.id, { onDelete: "cascade", onUpdate: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    template: jsonb("template").notNull(),
})

export const formResponse = pgTable("form_response", {
    id: uuid("id").defaultRandom().primaryKey(),
    surveyFormId: uuid("survey_form_id")
        .notNull()
        .references(() => surveyForm.id, { onDelete: "cascade", onUpdate: "cascade" }),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    answers: jsonb("answers").notNull(),
})