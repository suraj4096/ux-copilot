import { createServerFn } from "@tanstack/react-start"

import { getUserFromAuthCookie } from "@/lib/auth.server"
import {
  createSurveyForm,
  deleteSurveyForm,
  getSurveyFormById,
  getSurveyFormForOwner,
  listSurveyFormsBySurveyId,
} from "@/lib/db/queries"
import {
  parseBuilderPayloadForWrite,
  parseSurveyFormRowForRenderer,
} from "@/lib/forms/persist"

function requireUser() {
  return getUserFromAuthCookie()
}

export const getSurveyFormPublicFn = createServerFn({ method: "GET" })
  .inputValidator((data: { formId: string }) => {
    if (typeof data?.formId !== "string" || !data.formId.trim()) {
      throw new Error("formId is required")
    }
    return { formId: data.formId.trim() }
  })
  .handler(async ({ data }) => {
    const row = await getSurveyFormById(data.formId)
    if (!row) {
      return { ok: false as const, errors: ["Form not found"] }
    }

    const parsed = parseSurveyFormRowForRenderer({
      id: row.id,
      title: row.title,
      description: row.description,
      template: row.template,
    })
    if (!parsed.ok) {
      return { ok: false as const, errors: parsed.errors }
    }

    return { ok: true as const, form: parsed.value }
  })

export const getSurveyFormForOwnerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { formId: string }) => {
    if (typeof data?.formId !== "string" || !data.formId.trim()) {
      throw new Error("formId is required")
    }
    return { formId: data.formId.trim() }
  })
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const row = await getSurveyFormForOwner(user.email, data.formId)
    if (!row) {
      return {
        ok: false as const,
        errors: ["Form not found or you do not have access"],
      }
    }

    const parsed = parseSurveyFormRowForRenderer({
      id: row.id,
      title: row.title,
      description: row.description,
      template: row.template,
    })
    if (!parsed.ok) {
      return { ok: false as const, errors: parsed.errors }
    }

    return {
      ok: true as const,
      form: parsed.value,
      surveyId: row.surveyId,
    }
  })

export const listSurveyFormsFn = createServerFn({ method: "GET" })
  .inputValidator((data: { surveyId: string }) => {
    if (typeof data?.surveyId !== "string" || !data.surveyId.trim()) {
      throw new Error("surveyId is required")
    }
    return { surveyId: data.surveyId.trim() }
  })
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const forms = await listSurveyFormsBySurveyId(user.email, data.surveyId)
    if (forms === null) {
      return {
        ok: false as const,
        errors: ["Survey not found or you do not have access"],
      }
    }
    return { ok: true as const, forms }
  })

export const createSurveyFormFn = createServerFn({ method: "POST" })
  .inputValidator((data: { surveyId: string; payload: unknown }) => {
    if (typeof data?.surveyId !== "string" || !data.surveyId.trim()) {
      throw new Error("surveyId is required")
    }
    return { surveyId: data.surveyId.trim(), payload: data.payload }
  })
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const parsed = parseBuilderPayloadForWrite(data.payload)
    if (!parsed.ok) {
      return { ok: false as const, errors: parsed.errors }
    }

    const row = await createSurveyForm(user.email, {
      surveyId: data.surveyId,
      title: parsed.value.title,
      description: parsed.value.description,
      template: parsed.value.template,
    })
    if (!row) {
      return {
        ok: false as const,
        errors: ["Survey not found or you do not have access"],
      }
    }
    return { ok: true as const, form: row }
  })

export const deleteSurveyFormFn = createServerFn({ method: "POST" })
  .inputValidator((data: { formId: string }) => {
    if (typeof data?.formId !== "string" || !data.formId.trim()) {
      throw new Error("formId is required")
    }
    return { formId: data.formId.trim() }
  })
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const row = await deleteSurveyForm(user.email, data.formId)
    if (!row) {
      return {
        ok: false as const,
        errors: ["Form not found or you do not have access"],
      }
    }
    return { ok: true as const, form: row }
  })
