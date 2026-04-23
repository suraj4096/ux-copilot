import {
  drawSearchSchema,
  formResponsesSearchSchema,
  newFormSearchSchema,
  reportSearchSchema,
  surveyDetailSearchSchema,
  surveysListSearchSchema,
} from "@/lib/router-search-schemas"

export const surveysListSearchDefaults = surveysListSearchSchema.parse({})

export const surveyDetailSearchDefaults = surveyDetailSearchSchema.parse({})

export const formResponsesSearchDefaults = formResponsesSearchSchema.parse({})

export const newFormSearchDefaults = newFormSearchSchema.parse({})

export const drawSearchDefaults = drawSearchSchema.parse({})

export const reportSearchDefaults = reportSearchSchema.parse({})
