import {
  formResponsesSearchSchema,
  newFormSearchSchema,
  surveyDetailSearchSchema,
  surveysListSearchSchema,
} from "@/lib/router-search-schemas"

export const surveysListSearchDefaults = surveysListSearchSchema.parse({})

export const surveyDetailSearchDefaults = surveyDetailSearchSchema.parse({})

export const formResponsesSearchDefaults = formResponsesSearchSchema.parse({})

export const newFormSearchDefaults = newFormSearchSchema.parse({})
