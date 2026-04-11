import { and, asc, desc, eq, ilike } from "drizzle-orm"

import { db } from "@/lib/db/client"
import {
  formResponse,
  survey,
  surveyForm,
  user,
} from "@/lib/db/schema"

export async function getUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(user)
    .where(ilike(user.email, email.trim()))
    .limit(1)
  return rows.at(0) ?? null
}

export async function createSurvey(ownerEmail: string, title: string) {
  const rows = await db
    .insert(survey)
    .values({ title, owner: ownerEmail })
    .returning()
  return rows.at(0) ?? null
}

export async function deleteSurvey(ownerEmail: string, surveyId: string) {
  const rows = await db
    .delete(survey)
    .where(and(eq(survey.id, surveyId), eq(survey.owner, ownerEmail)))
    .returning()
  return rows.at(0) ?? null
}

export async function listSurveysByOwner(ownerEmail: string) {
  return db
    .select()
    .from(survey)
    .where(eq(survey.owner, ownerEmail))
}

export async function getSurveyForOwner(ownerEmail: string, surveyId: string) {
  const rows = await db
    .select()
    .from(survey)
    .where(and(eq(survey.id, surveyId), eq(survey.owner, ownerEmail)))
    .limit(1)
  return rows.at(0) ?? null
}

export async function listSurveyFormsBySurveyId(
  ownerEmail: string,
  surveyId: string,
) {
  const ownershipRows = await db
    .select({ id: survey.id })
    .from(survey)
    .where(and(eq(survey.id, surveyId), eq(survey.owner, ownerEmail)))
    .limit(1)
  if (ownershipRows.at(0) === undefined) return null

  return db
    .select({
      id: surveyForm.id,
      surveyId: surveyForm.surveyId,
      title: surveyForm.title,
      description: surveyForm.description,
    })
    .from(surveyForm)
    .where(eq(surveyForm.surveyId, surveyId))
    .orderBy(asc(surveyForm.title))
}

export async function getSurveyFormById(formId: string) {
  const rows = await db
    .select({
      id: surveyForm.id,
      surveyId: surveyForm.surveyId,
      title: surveyForm.title,
      description: surveyForm.description,
      template: surveyForm.template,
    })
    .from(surveyForm)
    .where(eq(surveyForm.id, formId))
    .limit(1)
  return rows.at(0) ?? null
}

export async function getSurveyFormForOwner(ownerEmail: string, formId: string) {
  const rows = await db
    .select({
      id: surveyForm.id,
      surveyId: surveyForm.surveyId,
      title: surveyForm.title,
      description: surveyForm.description,
      template: surveyForm.template,
    })
    .from(surveyForm)
    .innerJoin(survey, eq(surveyForm.surveyId, survey.id))
    .where(and(eq(surveyForm.id, formId), eq(survey.owner, ownerEmail)))
    .limit(1)
  return rows.at(0) ?? null
}

export async function createSurveyForm(
  ownerEmail: string,
  input: {
    surveyId: string
    title: string
    description?: string | null
    template: unknown
  },
) {
  const allowedRows = await db
    .select({ id: survey.id })
    .from(survey)
    .where(and(eq(survey.id, input.surveyId), eq(survey.owner, ownerEmail)))
    .limit(1)
  if (allowedRows.at(0) === undefined) return null

  const rows = await db
    .insert(surveyForm)
    .values({
      surveyId: input.surveyId,
      title: input.title,
      description: input.description ?? null,
      template: input.template,
    })
    .returning()
  return rows.at(0) ?? null
}

export async function deleteSurveyForm(ownerEmail: string, formId: string) {
  const targetRows = await db
    .select({ id: surveyForm.id })
    .from(surveyForm)
    .innerJoin(survey, eq(surveyForm.surveyId, survey.id))
    .where(and(eq(surveyForm.id, formId), eq(survey.owner, ownerEmail)))
    .limit(1)
  if (targetRows.at(0) === undefined) return null

  const rows = await db
    .delete(surveyForm)
    .where(eq(surveyForm.id, formId))
    .returning()
  return rows.at(0) ?? null
}

export async function createFormResponse(input: {
  surveyFormId: string
  answers: unknown
}) {
  const rows = await db
    .insert(formResponse)
    .values({
      surveyFormId: input.surveyFormId,
      answers: input.answers,
    })
    .returning()
  return rows.at(0) ?? null
}

export async function listFormResponsesByFormId(
  ownerEmail: string,
  surveyFormId: string,
) {
  const ownershipRows = await db
    .select({ id: surveyForm.id })
    .from(surveyForm)
    .innerJoin(survey, eq(surveyForm.surveyId, survey.id))
    .where(and(eq(surveyForm.id, surveyFormId), eq(survey.owner, ownerEmail)))
    .limit(1)
  if (ownershipRows.at(0) === undefined) return null

  return db
    .select()
    .from(formResponse)
    .where(eq(formResponse.surveyFormId, surveyFormId))
    .orderBy(desc(formResponse.submittedAt))
}

export async function deleteFormResponse(
  ownerEmail: string,
  responseId: string,
) {
  const targetRows = await db
    .select({ id: formResponse.id })
    .from(formResponse)
    .innerJoin(surveyForm, eq(formResponse.surveyFormId, surveyForm.id))
    .innerJoin(survey, eq(surveyForm.surveyId, survey.id))
    .where(and(eq(formResponse.id, responseId), eq(survey.owner, ownerEmail)))
    .limit(1)
  if (targetRows.at(0) === undefined) return null

  const rows = await db
    .delete(formResponse)
    .where(eq(formResponse.id, responseId))
    .returning()
  return rows.at(0) ?? null
}
