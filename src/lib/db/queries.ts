import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm"

import type {ListPageParams, ListPageResult} from "@/lib/db/list-query-shared";
import { db } from "@/lib/db/client"
import {
  
  
  normalizeListPageParams,
  searchPattern
} from "@/lib/db/list-query-shared"
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

export async function listSurveysForOwnerPage(
  ownerEmail: string,
  page: Partial<ListPageParams> | undefined,
): Promise<ListPageResult<(typeof survey.$inferSelect)>> {
  const { offset, limit, search } = normalizeListPageParams(page)
  const ownerCond = eq(survey.owner, ownerEmail)
  const searchCond =
    search !== undefined ? ilike(survey.title, searchPattern(search)) : undefined
  const whereClause = searchCond ? and(ownerCond, searchCond) : ownerCond

  const countRows = await db
    .select({ c: count() })
    .from(survey)
    .where(whereClause)
  const total = Number(countRows.at(0)?.c ?? 0)

  const items = await db
    .select()
    .from(survey)
    .where(whereClause)
    .orderBy(asc(survey.title), asc(survey.id))
    .limit(limit)
    .offset(offset)

  return { items, total }
}

export async function getSurveyForOwner(ownerEmail: string, surveyId: string) {
  const rows = await db
    .select()
    .from(survey)
    .where(and(eq(survey.id, surveyId), eq(survey.owner, ownerEmail)))
    .limit(1)
  return rows.at(0) ?? null
}

export type SurveyFormListRow = {
  id: string
  surveyId: string
  title: string
  description: string | null
}

export async function listSurveyFormsForSurveyPage(
  ownerEmail: string,
  surveyId: string,
  page: Partial<ListPageParams> | undefined,
): Promise<ListPageResult<SurveyFormListRow> | null> {
  const ownershipRows = await db
    .select({ id: survey.id })
    .from(survey)
    .where(and(eq(survey.id, surveyId), eq(survey.owner, ownerEmail)))
    .limit(1)
  if (ownershipRows.at(0) === undefined) return null

  const { offset, limit, search } = normalizeListPageParams(page)
  const baseCond = eq(surveyForm.surveyId, surveyId)
  const searchCond =
    search !== undefined
      ? or(
          ilike(surveyForm.title, searchPattern(search)),
          sql`coalesce(${surveyForm.description}, '') ilike ${searchPattern(search)}`,
          sql`cast(${surveyForm.template} as text) ilike ${searchPattern(search)}`,
        )
      : undefined
  const whereClause = searchCond ? and(baseCond, searchCond) : baseCond

  const countRows = await db
    .select({ c: count() })
    .from(surveyForm)
    .where(whereClause)
  const total = Number(countRows.at(0)?.c ?? 0)

  const items = await db
    .select({
      id: surveyForm.id,
      surveyId: surveyForm.surveyId,
      title: surveyForm.title,
      description: surveyForm.description,
    })
    .from(surveyForm)
    .where(whereClause)
    .orderBy(asc(surveyForm.title), asc(surveyForm.id))
    .limit(limit)
    .offset(offset)

  return { items, total }
}

export type SurveyFormWithSurveyTitle = SurveyFormListRow & {
  surveyTitle: string
}

export async function listSurveyFormsForOwnerPage(
  ownerEmail: string,
  options: { surveyId?: string } & Partial<ListPageParams> | undefined,
): Promise<ListPageResult<SurveyFormWithSurveyTitle>> {
  const surveyId = options?.surveyId
  const { offset, limit, search } = normalizeListPageParams(options)
  const ownerCond = eq(survey.owner, ownerEmail)
  const surveyScope =
    surveyId !== undefined ? eq(surveyForm.surveyId, surveyId) : undefined
  const searchCond =
    search !== undefined
      ? or(
          ilike(surveyForm.title, searchPattern(search)),
          sql`coalesce(${surveyForm.description}, '') ilike ${searchPattern(search)}`,
          sql`cast(${surveyForm.template} as text) ilike ${searchPattern(search)}`,
          ilike(survey.title, searchPattern(search)),
        )
      : undefined
  const parts = [ownerCond, surveyScope, searchCond].filter(
    (x): x is NonNullable<typeof x> => x !== undefined,
  )
  const whereClause = parts.length === 1 ? parts[0] : and(...parts)

  const countRows = await db
    .select({ c: count() })
    .from(surveyForm)
    .innerJoin(survey, eq(surveyForm.surveyId, survey.id))
    .where(whereClause)
  const total = Number(countRows.at(0)?.c ?? 0)

  const items = await db
    .select({
      id: surveyForm.id,
      surveyId: surveyForm.surveyId,
      title: surveyForm.title,
      description: surveyForm.description,
      surveyTitle: survey.title,
    })
    .from(surveyForm)
    .innerJoin(survey, eq(surveyForm.surveyId, survey.id))
    .where(whereClause)
    .orderBy(asc(survey.title), asc(surveyForm.title), asc(surveyForm.id))
    .limit(limit)
    .offset(offset)

  return { items, total }
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

export async function listFormResponsesForFormPage(
  ownerEmail: string,
  surveyFormId: string,
  page: Partial<ListPageParams> | undefined,
): Promise<ListPageResult<(typeof formResponse.$inferSelect)> | null> {
  const ownershipRows = await db
    .select({ id: surveyForm.id })
    .from(surveyForm)
    .innerJoin(survey, eq(surveyForm.surveyId, survey.id))
    .where(and(eq(surveyForm.id, surveyFormId), eq(survey.owner, ownerEmail)))
    .limit(1)
  if (ownershipRows.at(0) === undefined) return null

  const { offset, limit, search } = normalizeListPageParams(page)
  const baseCond = eq(formResponse.surveyFormId, surveyFormId)
  const searchCond =
    search !== undefined
      ? sql`cast(${formResponse.answers} as text) ilike ${searchPattern(search)}`
      : undefined
  const whereClause = searchCond ? and(baseCond, searchCond) : baseCond

  const countRows = await db
    .select({ c: count() })
    .from(formResponse)
    .where(whereClause)
  const total = Number(countRows.at(0)?.c ?? 0)

  const items = await db
    .select()
    .from(formResponse)
    .where(whereClause)
    .orderBy(desc(formResponse.submittedAt), desc(formResponse.id))
    .limit(limit)
    .offset(offset)

  return { items, total }
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
