import { createServerFn } from "@tanstack/react-start"

import { getUserFromAuthCookie } from "@/lib/auth.server"
import {
  createSurvey,
  deleteSurvey,
  getSurveyForOwner,
  listSurveysByOwner,
} from "@/lib/db/queries"

function requireUser() {
  return getUserFromAuthCookie()
}

export const createSurveyFn = createServerFn({ method: "POST" })
  .inputValidator((data: { title: string }) => {
    if (typeof data?.title !== "string" || !data.title.trim()) {
      throw new Error("title is required")
    }
    return { title: data.title.trim() }
  })
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const row = await createSurvey(user.email, data.title)
    if (!row) {
      return { ok: false as const, errors: ["Could not create survey"] }
    }
    return { ok: true as const, survey: row }
  })

export const listSurveysFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const surveys = await listSurveysByOwner(user.email)
    return { ok: true as const, surveys }
  },
)

export const getSurveyFn = createServerFn({ method: "GET" })
  .inputValidator((data: { surveyId: string }) => {
    if (typeof data?.surveyId !== "string" || !data.surveyId.trim()) {
      throw new Error("surveyId is required")
    }
    return { surveyId: data.surveyId.trim() }
  })
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
  .inputValidator((data: { surveyId: string }) => {
    if (typeof data?.surveyId !== "string" || !data.surveyId.trim()) {
      throw new Error("surveyId is required")
    }
    return { surveyId: data.surveyId.trim() }
  })
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
