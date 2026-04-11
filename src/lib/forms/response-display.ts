import type {
  FormAnswerValue,
  FormQuestion,
  FormSchema,
} from "@/lib/forms/types"
import { coerceAnswerForQuestion } from "@/lib/forms/answers"
import { validateCoercedAnswerForQuestion } from "@/lib/forms/validator/response"

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isEmptyAnswer(value: FormAnswerValue): boolean {
  if (value == null) return true
  if (typeof value === "string" && value.trim().length === 0) return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

export function extractAnswersMapFromStored(answers: unknown): Map<string, unknown> {
  const map = new Map<string, unknown>()
  if (!Array.isArray(answers)) return map
  for (const row of answers) {
    if (!isRecord(row)) continue
    if (typeof row.question_id !== "string" || !row.question_id.trim()) continue
    if (!("value" in row)) continue
    map.set(row.question_id.trim(), row.value)
  }
  return map
}

function collectStoredAnswersStructureIssues(
  knownQuestionIds: Set<string>,
  answers: unknown,
): Array<string> {
  const errors: Array<string> = []
  if (!Array.isArray(answers)) {
    errors.push("Answers must be an array.")
    return errors
  }

  const seen = new Set<string>()
  for (let i = 0; i < answers.length; i++) {
    const row = answers[i]
    const path = `answers[${i}]`
    if (!isRecord(row)) {
      errors.push(`${path} must be an object.`)
      continue
    }
    if (typeof row.question_id !== "string" || !row.question_id.trim()) {
      errors.push(`${path}.question_id must be a non-empty string.`)
      continue
    }
    const qid = row.question_id.trim()
    if (seen.has(qid)) {
      errors.push(`Duplicate question_id "${qid}" in stored answers.`)
      continue
    }
    seen.add(qid)
    if (!knownQuestionIds.has(qid)) {
      errors.push(`Unknown question_id "${qid}" in stored answers.`)
      continue
    }
    if (!("value" in row)) {
      errors.push(`${path}.value is required.`)
    }
  }

  return errors
}

export function formatAnswerForDisplay(
  question: FormQuestion,
  coerced: FormAnswerValue,
): string {
  if (coerced == null) return "—"
  switch (question.type) {
    case "short_text":
    case "long_text":
      return typeof coerced === "string" ? coerced : String(coerced)
    case "number":
      return typeof coerced === "number" ? String(coerced) : String(coerced)
    case "single_choice": {
      if (typeof coerced !== "string") return String(coerced)
      const opt = question.options.find((o) => o.value === coerced)
      return opt?.label ?? coerced
    }
    case "multi_choice": {
      if (!Array.isArray(coerced)) return String(coerced)
      return coerced
        .map(
          (v) =>
            question.options.find((o) => o.value === String(v))?.label ??
            String(v),
        )
        .join(", ")
    }
    default:
      return String(coerced)
  }
}

export type ResponseTableCell = {
  questionId: string
  display: string
  error: string | null
}

export type ResponseTableRow = {
  responseId: string
  submittedAt: Date | string
  cells: Array<ResponseTableCell>
  payloadErrors: Array<string>
}

export function buildResponseTableRows(
  form: FormSchema,
  responses: Array<{
    id: string
    submittedAt: Date | string
    answers: unknown
  }>,
): Array<ResponseTableRow> {
  const knownQuestionIds = new Set(form.questions.map((q) => q.id))

  return responses.map((r) => {
    const payloadErrors = collectStoredAnswersStructureIssues(
      knownQuestionIds,
      r.answers,
    )

    const byId = extractAnswersMapFromStored(r.answers)

    const cells: Array<ResponseTableCell> = form.questions.map((question) => {
      const raw = byId.get(question.id)

      if (raw === undefined) {
        if (question.required) {
          return {
            questionId: question.id,
            display: "—",
            error: "Required answer missing.",
          }
        }
        return { questionId: question.id, display: "—", error: null }
      }

      const coerced = coerceAnswerForQuestion(question, raw as FormAnswerValue)

      if (isEmptyAnswer(coerced)) {
        if (question.required) {
          return {
            questionId: question.id,
            display: "—",
            error: "Required answer missing.",
          }
        }
        return { questionId: question.id, display: "—", error: null }
      }

      const answerErr = validateCoercedAnswerForQuestion(question, coerced)
      const display = formatAnswerForDisplay(question, coerced)

      if (answerErr) {
        return {
          questionId: question.id,
          display: isEmptyAnswer(coerced) ? "—" : display,
          error: answerErr,
        }
      }

      return { questionId: question.id, display, error: null }
    })

    return {
      responseId: r.id,
      submittedAt: r.submittedAt,
      cells,
      payloadErrors,
    }
  })
}
