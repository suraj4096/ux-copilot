import { z } from "zod"

import type { FormAnswerValue, FormQuestion } from "@/lib/forms/types"
import { coerceAnswerForQuestion } from "@/lib/forms/answers"

export function isEmptyAnswer(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === "string" && value.trim().length === 0) return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function singleChoiceValueSchema(
  question: Extract<FormQuestion, { type: "single_choice" }>,
) {
  const allowed = new Set(question.options.map((o) => o.value))
  return z.string().superRefine((v, ctx) => {
    if (!allowed.has(v)) {
      ctx.addIssue({
        code: "custom",
        message: "Value must be one of the defined options.",
      })
    }
  })
}

export function coercedNonEmptyAnswerSchema(question: FormQuestion): z.ZodTypeAny {
  switch (question.type) {
    case "short_text":
    case "long_text":
      return z.string()
    case "single_choice":
      return singleChoiceValueSchema(question)
    case "number": {
      return z.number().superRefine((n, ctx) => {
        if (!Number.isFinite(n)) {
          ctx.addIssue({ code: "custom", message: "Value must be a finite number." })
          return
        }
        if (question.min !== undefined && n < question.min) {
          ctx.addIssue({
            code: "custom",
            message: `Value must be at least ${question.min}.`,
          })
        }
        if (question.max !== undefined && n > question.max) {
          ctx.addIssue({
            code: "custom",
            message: `Value must be at most ${question.max}.`,
          })
        }
      })
    }
    case "multi_choice": {
      const allowed = new Set(question.options.map((o) => o.value))
      return z.array(z.string()).superRefine((arr, ctx) => {
        if (!arr.every((x) => typeof x === "string")) {
          ctx.addIssue({
            code: "custom",
            message: "Value must be an array of strings.",
          })
          return
        }
        for (const v of arr) {
          if (!allowed.has(v)) {
            ctx.addIssue({
              code: "custom",
              message:
                "Each selected value must be one of the defined options.",
            })
            return
          }
        }
      })
    }
  }
}

export function validateCoercedAnswerForQuestion(
  question: FormQuestion,
  coerced: FormAnswerValue,
): string | null {
  if (coerced == null || isEmptyAnswer(coerced)) {
    return null
  }
  const r = coercedNonEmptyAnswerSchema(question).safeParse(coerced)
  if (r.success) return null
  return r.error.issues[0]?.message ?? "Invalid value."
}

export function validateFillAnswerForQuestion(
  question: FormQuestion,
  raw: FormAnswerValue,
): string | undefined {
  const coerced = coerceAnswerForQuestion(question, raw)
  if (question.required && (coerced == null || isEmptyAnswer(coerced))) {
    return "This field is required."
  }
  if (!question.required && (coerced == null || isEmptyAnswer(coerced))) {
    return undefined
  }
  const r = coercedNonEmptyAnswerSchema(question).safeParse(coerced)
  if (!r.success) return r.error.issues[0]?.message
  return undefined
}
