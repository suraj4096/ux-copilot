import { createOpenAI } from "@ai-sdk/openai"
import { tool } from "ai"
import { z } from "zod"

import {
  getSurveyForOwner,
  listFormResponsesForFormPage,
  listSurveyFormsForOwnerPage,
  listSurveysForOwnerPage,
} from "@/lib/db/queries"
import { normalizeListPageParams } from "@/lib/db/list-query-shared"
import { validateFormSchema } from "@/lib/forms/validator"

export function createOpenAIModel(modelId: string) {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openai(modelId)
}

const pageToolSchema = z.object({
  search: z.string().max(500).optional(),
  offset: z.number().int().min(0).max(100_000).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const agentModes = ["auto", "survey"] as const
export type AgentMode = (typeof agentModes)[number]

const surveyToolNames = [
  "search_surveys",
  "search_forms",
  "search_responses",
  "validate_form_json",
  "open_form_editor",
] as const

function createSurveyTools(ownerEmail: string) {
  return {
    search_surveys: tool({
      description:
        "Search and page surveys you own. Text matches survey title (case-insensitive). Default sort: title, then id. In replies, never print ids in prose; each survey is one chip [[surveyTitle:/surveys/<id>]] using the exact title string from results and the id only inside the path-not labels like \"Open ...\".",
      inputSchema: pageToolSchema,
      execute: async (input) => {
        const page = normalizeListPageParams(input)
        const { items, total } = await listSurveysForOwnerPage(ownerEmail, page)
        return {
          surveys: items.map((s) => ({ id: s.id, title: s.title })),
          total,
          offset: page.offset,
          limit: page.limit,
        }
      },
    }),

    search_forms: tool({
      description:
        "Search and page forms you own. Optionally pass surveyId (from UI context) to only list forms in that survey. Text matches form title, description, template JSON, or parent survey title. Default sort: survey title, form title, form id. In replies, never print ids in prose; each form is one chip [[formTitle:/surveys/<surveyId>/form/<formId>]] with the exact form title as the label and ids only in the path.",
      inputSchema: pageToolSchema.extend({
        surveyId: z
          .string()
          .min(1)
          .optional()
          .describe(
            "When the user is inside a survey, pass this surveyId to avoid forms with the same name in other surveys.",
          ),
      }),
      execute: async ({ surveyId, ...rest }) => {
        const page = normalizeListPageParams(rest)
        const { items, total } = await listSurveyFormsForOwnerPage(ownerEmail, {
          surveyId,
          ...page,
        })
        return {
          forms: items.map((f) => ({
            id: f.id,
            surveyId: f.surveyId,
            surveyTitle: f.surveyTitle,
            title: f.title,
            description: f.description,
          })),
          total,
          offset: page.offset,
          limit: page.limit,
        }
      },
    }),

    search_responses: tool({
      description:
        "Search and page responses for a form you own. Text matches serialized answers JSON. Default sort: newest submitted first. In replies, never print response ids in prose; link a row with [[short label e.g. submitted time:/surveys/<surveyId>/form/<formId>?highlightResponse=<id>]] using ids only in the path (derive surveyId/formId from context or prior tools).",
      inputSchema: pageToolSchema.extend({
        formId: z.string().min(1),
      }),
      execute: async ({ formId, ...rest }) => {
        const page = normalizeListPageParams(rest)
        const result = await listFormResponsesForFormPage(
          ownerEmail,
          formId,
          page,
        )
        if (result === null) {
          return {
            error: "Form not found or access denied.",
            responses: [] as Array<unknown>,
            total: 0,
            offset: page.offset,
            limit: page.limit,
          }
        }
        return {
          total: result.total,
          returned: result.items.length,
          offset: page.offset,
          limit: page.limit,
          responses: result.items.map((r) => ({
            id: r.id,
            submittedAt: r.submittedAt,
            answersPreview: truncateValue(r.answers, 2000),
          })),
        }
      },
    }),

    validate_form_json: tool({
      description:
        "Validate a full form draft in memory only-does not save or publish anything. Root: id, title, optional description, questions (>=1, unique question ids, >=1 required question). Question types ONLY: short_text, long_text, number, single_choice, multi_choice. Choice questions need options: [{ value, label }, ...] with unique values. If ok: false, fix the payload from errors and call this tool again with the full corrected JSON-repeat until ok: true before open_form_editor with formJson. Returns errors or the normalized form.",
      inputSchema: z.object({
        payload: z.unknown(),
      }),
      execute: ({ payload }) => {
        const parsed = validateFormSchema(payload)
        if (!parsed.ok) {
          return { ok: false as const, errors: parsed.errors }
        }
        return { ok: true as const, form: parsed.value }
      },
    }),

    open_form_editor: tool({
      description:
        "Triggers client navigation to the new-form editor for a survey and optionally injects a draft into the browser session. Does NOT persist the form-user must Save in the editor. Pass formJson only when it already passes validate_form_json (same shape: allowed types short_text, long_text, number, single_choice, multi_choice; choice options as {value,label} objects). Omit formJson for a blank form. Use cloneFromFormId to clone. Prefer surveyId from UI context.",
      inputSchema: z.object({
        surveyId: z.string().min(1),
        cloneFromFormId: z.string().min(1).optional(),
        formJson: z.unknown().optional(),
      }),
      execute: async ({ surveyId, cloneFromFormId, formJson }) => {
        const surveyRow = await getSurveyForOwner(ownerEmail, surveyId)
        if (!surveyRow) {
          return {
            ok: false as const,
            error: "Survey not found or access denied.",
          }
        }

        let stagedForm: unknown | undefined
        if (formJson !== undefined) {
          const parsed = validateFormSchema(formJson)
          if (!parsed.ok) {
            return {
              ok: false as const,
              errors: parsed.errors,
              hint: "Fix validation errors or call validate_form_json first.",
            }
          }
          stagedForm = parsed.value
        }

        return {
          ok: true as const,
          surveyId,
          cloneFromFormId: cloneFromFormId ?? null,
          stagedForm: stagedForm ?? null,
        }
      },
    }),
  }
}

export function listToolNamesForMode(mode: AgentMode): Array<string> {
  if (mode === "survey" || mode === "auto") {
    return [...surveyToolNames]
  }
  return [...surveyToolNames]
}

export function createAgentTools(ownerEmail: string, mode: AgentMode) {
  if (mode !== "survey" && mode !== "auto") return {}
  return createSurveyTools(ownerEmail)
}

function truncateValue(value: unknown, maxChars: number): unknown {
  const s = JSON.stringify(value)
  if (s.length <= maxChars) return value
  return s.slice(0, maxChars) + "…(truncated)"
}
