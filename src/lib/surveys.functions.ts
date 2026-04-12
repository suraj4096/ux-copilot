import { createServerFn } from "@tanstack/react-start"

import { getUserFromAuthCookie } from "@/lib/auth.server"
import {
  createSurveyInputSchema,
  listSurveysPagedInputSchema,
  surveyIdParamSchema,
} from "@/lib/server-input-schemas"
import {
  createSurvey,
  deleteSurvey,
  getSurveyForOwner,
  listSurveysForOwnerPage,
} from "@/lib/db/queries"

function requireUser() {
  return getUserFromAuthCookie()
}

export const createSurveyFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSurveyInputSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const row = await createSurvey(user.email, data.title)
    if (!row) {
      return { ok: false as const, errors: ["Could not create survey"] }
    }
    return { ok: true as const, survey: row }
  })

export const listSurveysFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listSurveysPagedInputSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const { items, total } = await listSurveysForOwnerPage(user.email, data)
    return { ok: true as const, surveys: items, total }
  })

export const getSurveyFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => surveyIdParamSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const surveyRow = await getSurveyForOwner(user.email, data.surveyId)
    if (!surveyRow) {
      return {
        ok: false as const,
        errors: ["Survey not found or you do not have access"],
      }
    }
    return { ok: true as const, survey: surveyRow }
  })

export const deleteSurveyFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => surveyIdParamSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const row = await deleteSurvey(user.email, data.surveyId)
    if (!row) {
      return {
        ok: false as const,
        errors: ["Survey not found or you do not have access"],
      }
    }
    return { ok: true as const, survey: row }
  })
