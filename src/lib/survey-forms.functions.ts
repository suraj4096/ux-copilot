import { createServerFn } from "@tanstack/react-start"

import { getUserFromAuthCookie } from "@/lib/auth.server"
import {
  createSurveyFormInputSchema,
  formIdParamSchema,
  listSurveyFormsPagedInputSchema,
} from "@/lib/server-input-schemas"
import {
  createSurveyForm,
  deleteSurveyForm,
  getSurveyFormById,
  getSurveyFormForOwner,
  listSurveyFormsForSurveyPage,
} from "@/lib/db/queries"
import {
  parseBuilderPayloadForWrite,
  parseSurveyFormRowForRenderer,
} from "@/lib/forms/persist"

function requireUser() {
  return getUserFromAuthCookie()
}

export const getSurveyFormPublicFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => formIdParamSchema.parse(data))
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
  .inputValidator((data: unknown) => formIdParamSchema.parse(data))
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
  .inputValidator((data: unknown) => listSurveyFormsPagedInputSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const { surveyId, ...page } = data
    const result = await listSurveyFormsForSurveyPage(
      user.email,
      surveyId,
      page,
    )
    if (result === null) {
      return {
        ok: false as const,
        errors: ["Survey not found or you do not have access"],
      }
    }
    return { ok: true as const, forms: result.items, total: result.total }
  })

export const createSurveyFormFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSurveyFormInputSchema.parse(data))
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
    return {
      ok: true as const,
      form: { ...row, template: row.template as {} },
    }
  })

export const deleteSurveyFormFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => formIdParamSchema.parse(data))
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
    return {
      ok: true as const,
      form: { ...row, template: row.template as {} },
    }
  })
