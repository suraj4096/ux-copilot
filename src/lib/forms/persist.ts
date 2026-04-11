import type {
  FormQuestion,
  FormResponseAnswer,
  FormSchema,
} from "@/lib/forms/types"

import type { ValidationResult } from "@/lib/forms/validator/result"
import type { StoredFormTemplate } from "@/lib/forms/validator/template"
import {
  validateFormResponsePayload,
  validateFormSchema,
  validateStoredFormTemplate,
} from "@/lib/forms/validator"

export type SurveyFormRowShape = {
  id: string
  title: string
  description: string | null
  template: unknown
}

export type SurveyFormWritePayload = {
  title: string
  description: string | null
  template: StoredFormTemplate
}

export function parseSurveyFormRowForRenderer(
  row: SurveyFormRowShape,
): ValidationResult<FormSchema> {
  const template = validateStoredFormTemplate(row.template)
  if (!template.ok) {
    return template
  }

  return {
    ok: true,
    value: {
      id: template.value.id ?? row.id,
      title: row.title,
      description: row.description ?? undefined,
      questions: template.value.questions,
    },
  }
}

export function parseBuilderPayloadForWrite(
  input: unknown,
): ValidationResult<SurveyFormWritePayload> {
  const form = validateFormSchema(input)
  if (!form.ok) {
    return form
  }

  const { title, description, id, questions } = form.value
  return {
    ok: true,
    value: {
      title,
      description: description ?? null,
      template: { id, questions },
    },
  }
}

export function parseResponseAnswersForPersist(
  questions: Array<FormQuestion>,
  input: unknown,
): ValidationResult<Array<FormResponseAnswer>> {
  return validateFormResponsePayload(questions, input)
}
