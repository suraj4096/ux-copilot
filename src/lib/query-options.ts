import { queryOptions } from "@tanstack/react-query"

import {
  getSurveyFormForOwnerFn,
  getSurveyFormPublicFn,
  getSurveyFn,
  listFormResponsesFn,
  listSurveyFormsFn,
  listSurveysFn,
} from "@/lib/data.functions"
import { cloneFormSchemaAsDraft } from "@/lib/forms/defaults"
import type { FormSchema } from "@/lib/forms/types"

export const listSurveysQueryOptions = () =>
  queryOptions({
    queryKey: ["surveys", "list"] as const,
    queryFn: () => listSurveysFn(),
  })

export const surveyDetailQueryOptions = (surveyId: string) =>
  queryOptions({
    queryKey: ["survey", surveyId, "detail"] as const,
    queryFn: async () => {
      const [surveyRes, formsRes] = await Promise.all([
        getSurveyFn({ data: { surveyId } }),
        listSurveyFormsFn({ data: { surveyId } }),
      ])
      return { surveyRes, formsRes }
    },
  })

export type NewFormCloneQueryResult = {
  initialForm: FormSchema | null
  cloneError: string | null
}

export const newFormCloneQueryOptions = (
  surveyId: string,
  cloneFrom: string | undefined,
) =>
  queryOptions({
    queryKey: ["survey", surveyId, "newFormClone", cloneFrom ?? "none"] as const,
    queryFn: async (): Promise<NewFormCloneQueryResult> => {
      if (!cloneFrom) {
        return { initialForm: null, cloneError: null }
      }

      const res = await getSurveyFormForOwnerFn({ data: { formId: cloneFrom } })
      if (!res.ok) {
        return { initialForm: null, cloneError: res.errors.join(" ") }
      }
      if (res.surveyId !== surveyId) {
        return {
          initialForm: null,
          cloneError: "That form belongs to another survey.",
        }
      }

      return {
        initialForm: cloneFormSchemaAsDraft(res.form),
        cloneError: null,
      }
    },
  })

export const formResponsesPageQueryOptions = (surveyId: string, formId: string) =>
  queryOptions({
    queryKey: ["surveyForm", formId, "responses", surveyId] as const,
    queryFn: async () => {
      const [formRes, responsesRes] = await Promise.all([
        getSurveyFormForOwnerFn({ data: { formId } }),
        listFormResponsesFn({ data: { surveyFormId: formId } }),
      ])
      return { formRes, responsesRes }
    },
  })

export const publicFormQueryOptions = (formId: string) =>
  queryOptions({
    queryKey: ["publicForm", formId] as const,
    queryFn: () => getSurveyFormPublicFn({ data: { formId } }),
  })
