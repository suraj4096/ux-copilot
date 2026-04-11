import type {
  FormQuestion,
  FormResponseAnswer,
} from "@/lib/forms/types"
import type {ValidationResult} from "@/lib/forms/validator/result";
import { coerceAnswerForQuestion } from "@/lib/forms/answers"

import {
  
  validationFailure,
  validationOk
} from "@/lib/forms/validator/result"

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isEmptyAnswer(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === "string" && value.trim().length === 0) return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function allowedOptionValues(question: FormQuestion): Set<string> | null {
  if (question.type === "single_choice" || question.type === "multi_choice") {
    return new Set(question.options.map((o) => o.value))
  }
  return null
}

function validateValueShape(
  question: FormQuestion,
  coerced: ReturnType<typeof coerceAnswerForQuestion>,
): string | null {
  if (coerced == null) return null

  switch (question.type) {
    case "short_text":
    case "long_text":
    case "single_choice":
      return typeof coerced === "string" ? null : "Value must be a string."
    case "number":
      return typeof coerced === "number" && Number.isFinite(coerced)
        ? null
        : "Value must be a finite number."
    case "multi_choice":
      return Array.isArray(coerced) && coerced.every((v) => typeof v === "string")
        ? null
        : "Value must be an array of strings."
    default:
      return "Unknown question type."
  }
}

export function validateCoercedAnswerForQuestion(
  question: FormQuestion,
  coerced: ReturnType<typeof coerceAnswerForQuestion>,
): string | null {
  const shapeErr = validateValueShape(question, coerced)
  if (shapeErr) return shapeErr
  return validateConstraints(question, coerced)
}

function validateConstraints(
  question: FormQuestion,
  coerced: ReturnType<typeof coerceAnswerForQuestion>,
): string | null {
  if (coerced == null) return null

  if (question.type === "number" && typeof coerced === "number") {
    if (question.min !== undefined && coerced < question.min) {
      return `Value must be at least ${question.min}.`
    }
    if (question.max !== undefined && coerced > question.max) {
      return `Value must be at most ${question.max}.`
    }
  }

  const allowed = allowedOptionValues(question)
  if (allowed) {
    if (question.type === "single_choice" && typeof coerced === "string") {
      if (!allowed.has(coerced)) return "Value must be one of the defined options."
    }
    if (question.type === "multi_choice" && Array.isArray(coerced)) {
      for (const v of coerced) {
        if (!allowed.has(v)) return "Each selected value must be one of the defined options."
      }
    }
  }

  return null
}

function toResponseValue(
  question: FormQuestion,
  coerced: ReturnType<typeof coerceAnswerForQuestion>,
): FormResponseAnswer["value"] | null {
  if (coerced == null) return null
  if (question.type === "multi_choice" && Array.isArray(coerced)) {
    return [...coerced]
  }
  if (question.type === "number" && typeof coerced === "number") {
    return coerced
  }
  if (typeof coerced === "string") {
    return coerced
  }
  return null
}

export function validateFormResponsePayload(
  questions: Array<FormQuestion>,
  input: unknown,
): ValidationResult<Array<FormResponseAnswer>> {
  if (!Array.isArray(input)) {
    return validationFailure(["Answers must be an array."])
  }

  const questionIds = new Set(questions.map((q) => q.id))
  const byQuestionId = new Map<string, unknown>()
  const seen = new Set<string>()

  for (let i = 0; i < input.length; i++) {
    const row = input[i]
    const path = `answers[${i}]`
    if (!isRecord(row)) {
      return validationFailure([`${path} must be an object.`])
    }
    if (typeof row.question_id !== "string" || !row.question_id.trim()) {
      return validationFailure([`${path}.question_id must be a non-empty string.`])
    }
    const qid = row.question_id.trim()
    if (seen.has(qid)) {
      return validationFailure([`Duplicate question_id "${qid}" in submission.`])
    }
    seen.add(qid)
    if (!questionIds.has(qid)) {
      return validationFailure([`Unknown question_id "${qid}".`])
    }
    if (!("value" in row)) {
      return validationFailure([`${path}.value is required.`])
    }
    byQuestionId.set(qid, row.value)
  }

  const out: Array<FormResponseAnswer> = []
  const errors: Array<string> = []

  for (const question of questions) {
    const raw = byQuestionId.get(question.id)

    if (raw === undefined) {
      if (question.required) {
        errors.push(`Missing required answer for question "${question.id}".`)
      }
      continue
    }

    if (raw === null && !question.required) {
      continue
    }

    const coerced = coerceAnswerForQuestion(question, raw as never)

    if (question.required && isEmptyAnswer(coerced)) {
      errors.push(`Question "${question.id}" is required.`)
      continue
    }

    if (!question.required && isEmptyAnswer(coerced)) {
      continue
    }

    const answerErr = validateCoercedAnswerForQuestion(question, coerced)
    if (answerErr) {
      errors.push(`Question "${question.id}": ${answerErr}`)
      continue
    }

    const value = toResponseValue(question, coerced)
    if (value == null) {
      errors.push(`Question "${question.id}": invalid value.`)
      continue
    }

    out.push({ question_id: question.id, value })
  }

  if (errors.length > 0) {
    return validationFailure(errors)
  }

  return validationOk(out)
}
