import { z } from "zod"

import type { FormQuestion, FormSchema } from "@/lib/forms/types"
import type { ValidationResult } from "@/lib/forms/validator/result"
import { nonEmptyTrimmedString } from "@/lib/forms/validator/form-zod-shared"
import { zodSafeParseToResult } from "@/lib/forms/validator/zod-to-result"

const formChoiceOptionSchema = z.object({
  value: nonEmptyTrimmedString,
  label: nonEmptyTrimmedString,
})

const choiceOptionsSchema = z
  .array(formChoiceOptionSchema)
  .min(1, "Must have at least one option.")
  .superRefine((options, ctx) => {
    const seen = new Set<string>()
    for (let i = 0; i < options.length; i++) {
      const v = options[i].value
      if (seen.has(v)) {
        ctx.addIssue({
          code: "custom",
          message: `Has duplicate option value "${v}".`,
          path: [i, "value"],
        })
      }
      seen.add(v)
    }
  })

const shortTextQuestionSchema = z.object({
  id: nonEmptyTrimmedString,
  type: z.literal("short_text"),
  label: nonEmptyTrimmedString,
  required: z.boolean(),
  placeholder: z.string().optional(),
})

const longTextQuestionSchema = z.object({
  id: nonEmptyTrimmedString,
  type: z.literal("long_text"),
  label: nonEmptyTrimmedString,
  required: z.boolean(),
  placeholder: z.string().optional(),
})

const numberQuestionSchema = z
  .object({
    id: nonEmptyTrimmedString,
    type: z.literal("number"),
    label: nonEmptyTrimmedString,
    required: z.boolean(),
    placeholder: z.string().optional(),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
  })
  .superRefine((q, ctx) => {
    if (q.min !== undefined && q.max !== undefined && q.min > q.max) {
      ctx.addIssue({
        code: "custom",
        message: "min must be less than or equal to max.",
        path: ["min"],
      })
    }
  })

const singleChoiceQuestionSchema = z.object({
  id: nonEmptyTrimmedString,
  type: z.literal("single_choice"),
  label: nonEmptyTrimmedString,
  required: z.boolean(),
  options: choiceOptionsSchema,
})

const multiChoiceQuestionSchema = z.object({
  id: nonEmptyTrimmedString,
  type: z.literal("multi_choice"),
  label: nonEmptyTrimmedString,
  required: z.boolean(),
  options: choiceOptionsSchema,
})

const formQuestionSchema = z.discriminatedUnion("type", [
  shortTextQuestionSchema,
  longTextQuestionSchema,
  numberQuestionSchema,
  singleChoiceQuestionSchema,
  multiChoiceQuestionSchema,
])

const storedFormTemplateSchema = z
  .object({
    id: nonEmptyTrimmedString.optional(),
    questions: z.array(formQuestionSchema),
  })
  .superRefine((t, ctx) => {
    const ids = t.questions.map((q) => q.id)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        message: "Question ids must be unique within the template.",
        path: ["questions"],
      })
    }
  })

const formSchemaSchema = z
  .object({
    id: nonEmptyTrimmedString,
    title: nonEmptyTrimmedString,
    description: z.string().optional(),
    questions: z.array(formQuestionSchema),
  })
  .superRefine((f, ctx) => {
    const ids = f.questions.map((q) => q.id)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        message: "Question ids must be unique within the template.",
        path: ["questions"],
      })
    }
    if (f.questions.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least one question.",
        path: ["questions"],
      })
    }
    if (f.questions.length > 0 && !f.questions.some((q) => q.required)) {
      ctx.addIssue({
        code: "custom",
        message: "At least one question must be marked required.",
        path: ["questions"],
      })
    }
  })

export type StoredFormTemplate = {
  id?: string
  questions: Array<FormQuestion>
}

export function validateStoredFormTemplate(
  input: unknown,
): ValidationResult<StoredFormTemplate> {
  return zodSafeParseToResult(storedFormTemplateSchema, input)
}

export function validateFormSchema(input: unknown): ValidationResult<FormSchema> {
  return zodSafeParseToResult(formSchemaSchema, input)
}
