export type SurveysListQueryParams = {
  search?: string
  offset?: number
  limit?: number
}

export type SurveyFormsListParams = {
  search?: string
  offset?: number
  limit?: number
}

export type FormResponsesListParams = {
  search?: string
  offset?: number
  limit?: number
}

export const queryKeys = {
  auth: {
    currentUser: ["auth", "currentUser"] as const,
  },
  surveys: {
    list: (params?: SurveysListQueryParams) =>
      ["surveys", "list", params ?? {}] as const,
    detail: (surveyId: string, formsParams?: SurveyFormsListParams) =>
      ["survey", surveyId, "detail", formsParams ?? {}] as const,
    newFormClone: (surveyId: string, cloneFrom: string | undefined) =>
      ["survey", surveyId, "newFormClone", cloneFrom ?? "none"] as const,
  },
  surveyForm: {
    responsesPage: (
      surveyId: string,
      formId: string,
      listParams?: FormResponsesListParams,
    ) => ["surveyForm", formId, "responses", surveyId, listParams ?? {}] as const,
  },
  publicForm: {
    detail: (formId: string) => ["publicForm", formId] as const,
  },
}
