import type {
  FormChoiceOption,
  FormQuestion,
  FormQuestionType,
  FormSchema,
} from "@/lib/forms/types"

import {
  validationFailure,
  validationOk,
  type ValidationResult,
} from "@/lib/forms/validator/result"

const QUESTION_TYPES: FormQuestionType[] = [
  "short_text",
  "long_text",
  "number",
  "single_choice",
  "multi_choice",
]

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isQuestionType(v: unknown): v is FormQuestionType {
  return typeof v === "string" && (QUESTION_TYPES as string[]).includes(v)
}

function parseOptions(
  raw: unknown,
  path: string,
): { ok: true; options: FormChoiceOption[] } | { ok: false; errors: string[] } {
  if (!Array.isArray(raw)) {
    return { ok: false, errors: [`${path} must be an array.`] }
  }
  if (raw.length < 1) {
    return { ok: false, errors: [`${path} must have at least one option.`] }
  }
  const options: FormChoiceOption[] = []
  const values = new Set<string>()
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i]
    const p = `${path}[${i}]`
    if (!isRecord(item)) {
      return { ok: false, errors: [`${p} must be an object.`] }
    }
    if (typeof item.value !== "string" || !item.value.trim()) {
      return { ok: false, errors: [`${p}.value must be a non-empty string.`] }
    }
    if (typeof item.label !== "string" || !item.label.trim()) {
      return { ok: false, errors: [`${p}.label must be a non-empty string.`] }
    }
    const value = item.value.trim()
    if (values.has(value)) {
      return { ok: false, errors: [`${path} has duplicate option value "${value}".`] }
    }
    values.add(value)
    options.push({ value, label: item.label.trim() })
  }
  return { ok: true, options }
}

function parseOptionalNumber(
  raw: unknown,
  path: string,
): { ok: true; n: number | undefined } | { ok: false; errors: string[] } {
  if (raw === undefined) return { ok: true, n: undefined }
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return { ok: false, errors: [`${path} must be a finite number when provided.`] }
  }
  return { ok: true, n: raw }
}

function parseFormQuestion(raw: unknown, index: number): ValidationResult<FormQuestion> {
  const path = `questions[${index}]`
  if (!isRecord(raw)) {
    return validationFailure([`${path} must be an object.`])
  }

  if (typeof raw.id !== "string" || !raw.id.trim()) {
    return validationFailure([`${path}.id must be a non-empty string.`])
  }
  const id = raw.id.trim()

  if (!isQuestionType(raw.type)) {
    return validationFailure([
      `${path}.type must be one of: ${QUESTION_TYPES.join(", ")}.`,
    ])
  }
  const type = raw.type

  if (typeof raw.label !== "string" || !raw.label.trim()) {
    return validationFailure([`${path}.label must be a non-empty string.`])
  }
  const label = raw.label.trim()

  if (typeof raw.required !== "boolean") {
    return validationFailure([`${path}.required must be a boolean.`])
  }
  const required = raw.required

  const base = { id, type, label, required } as const

  switch (type) {
    case "short_text":
    case "long_text": {
      let placeholder: string | undefined
      if (raw.placeholder !== undefined) {
        if (typeof raw.placeholder !== "string") {
          return validationFailure([`${path}.placeholder must be a string when provided.`])
        }
        placeholder = raw.placeholder
      }
      return validationOk(
        type === "short_text"
          ? { ...base, type: "short_text", placeholder }
          : { ...base, type: "long_text", placeholder },
      )
    }
    case "number": {
      let placeholder: string | undefined
      if (raw.placeholder !== undefined) {
        if (typeof raw.placeholder !== "string") {
          return validationFailure([`${path}.placeholder must be a string when provided.`])
        }
        placeholder = raw.placeholder
      }
      const minR = parseOptionalNumber(raw.min, `${path}.min`)
      if (!minR.ok) return validationFailure(minR.errors)
      const maxR = parseOptionalNumber(raw.max, `${path}.max`)
      if (!maxR.ok) return validationFailure(maxR.errors)
      const min = minR.n
      const max = maxR.n
      if (min !== undefined && max !== undefined && min > max) {
        return validationFailure([`${path}.min must be less than or equal to max.`])
      }
      return validationOk({ ...base, type: "number", placeholder, min, max })
    }
    case "single_choice":
    case "multi_choice": {
      const opt = parseOptions(raw.options, `${path}.options`)
      if (!opt.ok) return validationFailure(opt.errors)
      return validationOk(
        type === "single_choice"
          ? { ...base, type: "single_choice", options: opt.options }
          : { ...base, type: "multi_choice", options: opt.options },
      )
    }
  }
}

export type StoredFormTemplate = {
  id?: string
  questions: FormQuestion[]
}

export function validateStoredFormTemplate(
  input: unknown,
): ValidationResult<StoredFormTemplate> {
  if (!isRecord(input)) {
    return validationFailure(["Template must be an object."])
  }

  const errors: string[] = []
  let id: string | undefined

  if (input.id !== undefined) {
    if (typeof input.id !== "string" || !input.id.trim()) {
      errors.push("Template.id must be a non-empty string when provided.")
    } else {
      id = input.id.trim()
    }
  }

  if (!Array.isArray(input.questions)) {
    return validationFailure(["Template.questions must be an array."])
  }

  const questions: FormQuestion[] = []
  for (let i = 0; i < input.questions.length; i++) {
    const parsed = parseFormQuestion(input.questions[i], i)
    if (!parsed.ok) {
      errors.push(...parsed.errors)
    } else {
      questions.push(parsed.value)
    }
  }

  const ids = questions.map((q) => q.id)
  const unique = new Set(ids)
  if (unique.size !== ids.length) {
    errors.push("Question ids must be unique within the template.")
  }

  if (errors.length > 0) {
    return validationFailure(errors)
  }

  return validationOk({ id, questions })
}

export function validateFormSchema(input: unknown): ValidationResult<FormSchema> {
  if (!isRecord(input)) {
    return validationFailure(["Form must be an object."])
  }

  if (typeof input.id !== "string" || !input.id.trim()) {
    return validationFailure(["Form.id must be a non-empty string."])
  }
  const id = input.id.trim()

  if (typeof input.title !== "string" || !input.title.trim()) {
    return validationFailure(["Form.title must be a non-empty string."])
  }
  const title = input.title.trim()

  let description: string | undefined
  if (input.description !== undefined) {
    if (typeof input.description !== "string") {
      return validationFailure(["Form.description must be a string when provided."])
    }
    description = input.description
  }

  const template = validateStoredFormTemplate({
    id,
    questions: input.questions,
  })
  if (!template.ok) {
    return validationFailure(template.errors)
  }

  return validationOk({
    id,
    title,
    description,
    questions: template.value.questions,
  })
}
