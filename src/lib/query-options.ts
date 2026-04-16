import { queryOptions } from "@tanstack/react-query"

import type { FormSchema } from "@/lib/forms/types"
import { getCurrentUserFn } from "@/lib/auth.functions"
import {
  queryKeys,
  type FormResponsesListParams,
  type SurveyFormsListParams,
  type SurveysListQueryParams,
} from "@/lib/query-keys"
import {
  getSurveyFn,
  getSurveyFormForOwnerFn,
  getSurveyFormPublicFn,
  listFormResponsesFn,
  listSurveyFormsFn,
  listSurveysFn,
} from "@/lib/data.functions"
import { cloneFormSchemaAsDraft } from "@/lib/forms/defaults"

export type FormResponsesPageQueryData = {
  formRes:
    | { ok: false; errors: Array<string> }
    | { ok: true; form: FormSchema; surveyId: string }
  responsesRes:
    | { ok: false; errors: Array<string> }
    | {
        ok: true
        responses: Array<{
          id: string
          surveyFormId: string
          submittedAt: Date | string
          answers: unknown
        }>
        total: number
      }
}

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.auth.currentUser,
    queryFn: () => getCurrentUserFn(),
  })

export const listSurveysQueryOptions = (params?: SurveysListQueryParams) =>
  queryOptions({
    queryKey: queryKeys.surveys.list(params),
    queryFn: () =>
      listSurveysFn({
        data: {
          search: params?.search,
          offset: params?.offset,
          limit: params?.limit,
        },
      }),
  })

export const surveyDetailQueryOptions = (
  surveyId: string,
  formsParams?: SurveyFormsListParams,
) =>
  queryOptions({
    queryKey: queryKeys.surveys.detail(surveyId, formsParams),
    queryFn: async () => {
      const [surveyRes, formsRes] = await Promise.all([
        getSurveyFn({ data: { surveyId } }),
        listSurveyFormsFn({
          data: {
            surveyId,
            search: formsParams?.search,
            offset: formsParams?.offset,
            limit: formsParams?.limit,
          },
        }),
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
    queryKey: queryKeys.surveys.newFormClone(surveyId, cloneFrom),
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

export const formResponsesPageQueryOptions = (
  surveyId: string,
  formId: string,
  listParams?: FormResponsesListParams,
) =>
  queryOptions({
    queryKey: queryKeys.surveyForm.responsesPage(surveyId, formId, listParams),
    queryFn: async (): Promise<FormResponsesPageQueryData> => {
      const [formRes, responsesRes] = await Promise.all([
        getSurveyFormForOwnerFn({ data: { formId } }),
        listFormResponsesFn({
          data: {
            surveyFormId: formId,
            search: listParams?.search,
            offset: listParams?.offset,
            limit: listParams?.limit,
          },
        }),
      ])
      return { formRes, responsesRes } as FormResponsesPageQueryData
    },
  })

export const publicFormQueryOptions = (formId: string) =>
  queryOptions({
    queryKey: queryKeys.publicForm.detail(formId),
    queryFn: () => getSurveyFormPublicFn({ data: { formId } }),
  })
