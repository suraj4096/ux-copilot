import type {
  FormAnswerValue,
  FormAnswersByQuestionId,
  FormQuestion,
  FormResponseAnswer,
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

export function answersRecordToSubmissionArray(
  form: FormSchema,
  answers: FormAnswersByQuestionId,
): Array<FormResponseAnswer> {
  const out: Array<FormResponseAnswer> = []
  for (const q of form.questions) {
    const raw = answers[q.id]
    if (
      raw == null ||
      (typeof raw === "string" && raw.trim() === "") ||
      (Array.isArray(raw) && raw.length === 0)
    ) {
      continue
    }
    if (q.type === "multi_choice") {
      const arr = Array.isArray(raw) ? raw.map(String) : [String(raw)]
      out.push({ question_id: q.id, value: arr })
      continue
    }
    if (q.type === "number" && typeof raw === "number") {
      out.push({ question_id: q.id, value: raw })
      continue
    }
    out.push({ question_id: q.id, value: String(raw) })
  }
  return out
}
