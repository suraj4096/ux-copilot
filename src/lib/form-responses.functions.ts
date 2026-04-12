import { createServerFn } from "@tanstack/react-start"

import { getUserFromAuthCookie } from "@/lib/auth.server"
import {
  createFormResponse,
  deleteFormResponse,
  getSurveyFormById,
  listFormResponsesForFormPage,
} from "@/lib/db/queries"
import {
  parseResponseAnswersForPersist,
  parseSurveyFormRowForRenderer,
} from "@/lib/forms/persist"
import {
  deleteFormResponseInputSchema,
  listFormResponsesPagedInputSchema,
  submitFormResponseInputSchema,
} from "@/lib/server-input-schemas"

function requireUser() {
  return getUserFromAuthCookie()
}

export const submitFormResponseFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitFormResponseInputSchema.parse(data))
  .handler(async ({ data }) => {
    const row = await getSurveyFormById(data.surveyFormId)
    if (!row) {
      return { ok: false as const, errors: ["Form not found"] }
    }

    const parsedForm = parseSurveyFormRowForRenderer({
      id: row.id,
      title: row.title,
      description: row.description,
      template: row.template,
    })
    if (!parsedForm.ok) {
      return { ok: false as const, errors: parsedForm.errors }
    }

    const validated = parseResponseAnswersForPersist(
      parsedForm.value.questions,
      data.answers,
    )
    if (!validated.ok) {
      return { ok: false as const, errors: validated.errors }
    }

    const inserted = await createFormResponse({
      surveyFormId: data.surveyFormId,
      answers: validated.value,
    })
    if (!inserted) {
      return { ok: false as const, errors: ["Could not save response"] }
    }

    return {
      ok: true as const,
      response: { ...inserted, answers: inserted.answers as {} },
    }
  })

export const listFormResponsesFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listFormResponsesPagedInputSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const { surveyFormId, ...page } = data
    const result = await listFormResponsesForFormPage(
      user.email,
      surveyFormId,
      page,
    )
    if (result === null) {
      return {
        ok: false as const,
        errors: ["Form not found or you do not have access"],
      }
    }
    return {
      ok: true as const,
      responses: result.items.map((r) => ({ ...r, answers: r.answers as {} })),
      total: result.total,
    }
  })

export const deleteFormResponseFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => deleteFormResponseInputSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!user) return { ok: false as const, errors: ["Unauthorized"] }

    const row = await deleteFormResponse(user.email, data.responseId)
    if (!row) {
      return {
        ok: false as const,
        errors: ["Response not found or you do not have access"],
      }
    }
    return {
      ok: true as const,
      response: { ...row, answers: row.answers as {} },
    }
  })
