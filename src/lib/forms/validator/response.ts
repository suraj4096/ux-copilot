import type {
  FormQuestion,
  FormResponseAnswer,
} from "@/lib/forms/types"
import type { ValidationResult } from "@/lib/forms/validator/result"
import { coerceAnswerForQuestion } from "@/lib/forms/answers"
import {
  isEmptyAnswer,
  validateCoercedAnswerForQuestion,
} from "@/lib/forms/validator/answer-value-schema"
import { formSubmissionAnswersArraySchema } from "@/lib/forms/validator/form-zod-shared"
import {
  validationFailure,
  validationOk,
} from "@/lib/forms/validator/result"
import { zodSafeParseToResult } from "@/lib/forms/validator/zod-to-result"

export { validateCoercedAnswerForQuestion }

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
  const parsed = zodSafeParseToResult(formSubmissionAnswersArraySchema, input)
  if (!parsed.ok) return parsed

  const questionIds = new Set(questions.map((q) => q.id))
  const byQuestionId = new Map<string, unknown>()
  const seen = new Set<string>()

  for (const row of parsed.value) {
    const qid = row.question_id
    if (seen.has(qid)) {
      return validationFailure([`Duplicate question_id "${qid}" in submission.`])
    }
    seen.add(qid)
    if (!questionIds.has(qid)) {
      return validationFailure([`Unknown question_id "${qid}".`])
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
