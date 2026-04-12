import { z } from "zod"

import { nonEmptyTrimmedString } from "@/lib/forms/validator/form-zod-shared"
import { MAX_LIST_LIMIT } from "@/lib/db/list-query-shared"

export const surveyIdParamSchema = z.object({
  surveyId: nonEmptyTrimmedString,
})

export const formIdParamSchema = z.object({
  formId: nonEmptyTrimmedString,
})

export const createSurveyInputSchema = z.object({
  title: nonEmptyTrimmedString,
})

export const createSurveyFormInputSchema = z.object({
  surveyId: nonEmptyTrimmedString,
  payload: z.unknown(),
})

export const loginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Email is required"))
    .pipe(z.email("Enter a valid email address")),
})

export const submitFormResponseInputSchema = z.object({
  surveyFormId: nonEmptyTrimmedString,
  answers: z.unknown(),
})

export const surveyFormIdOnlySchema = z.object({
  surveyFormId: nonEmptyTrimmedString,
})

export const deleteFormResponseInputSchema = z.object({
  responseId: nonEmptyTrimmedString,
})

export const listPaginationSchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
  search: z.string().max(500).optional(),
})

export const listSurveysPagedInputSchema = listPaginationSchema

export const listSurveyFormsPagedInputSchema = surveyIdParamSchema.merge(
  listPaginationSchema,
)

export const listFormResponsesPagedInputSchema = surveyFormIdOnlySchema.merge(
  listPaginationSchema,
)
