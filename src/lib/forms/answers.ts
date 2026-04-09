import type {
  FormAnswersByQuestionId,
  FormAnswerValue,
  FormQuestion,
  FormSchema,
} from "@/lib/forms/types"

function getDefaultAnswerValue(question: FormQuestion): FormAnswerValue {
  switch (question.type) {
    case "multi_choice":
      return []
    default:
      return null
  }
}

export function createEmptyAnswers(form: FormSchema): FormAnswersByQuestionId {
  return Object.fromEntries(
    form.questions.map((q) => [q.id, getDefaultAnswerValue(q)])
  )
}

export function coerceAnswerForQuestion(
  question: FormQuestion,
  value: FormAnswerValue
): FormAnswerValue {
  if (value == null) return null

  switch (question.type) {
    case "short_text":
    case "long_text":
      return String(value)
    case "number": {
      if (typeof value === "number") return value
      const n = Number(value)
      return Number.isFinite(n) ? n : null
    }
    case "single_choice":
      return String(value)
    case "multi_choice":
      return Array.isArray(value) ? value.map(String) : [String(value)]
  }
}

export function validateAnswers(form: FormSchema, answers: FormAnswersByQuestionId) {
  const errorsByQuestionId: Record<string, string | undefined> = {}

  for (const question of form.questions) {
    const value = answers[question.id]

    if (!question.required) continue

    const missing =
      value == null ||
      (typeof value === "string" && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0)

    if (missing) {
      errorsByQuestionId[question.id] = "This field is required."
    }
  }

  return {
    isValid: Object.values(errorsByQuestionId).every((v) => !v),
    errorsByQuestionId,
  }
}

