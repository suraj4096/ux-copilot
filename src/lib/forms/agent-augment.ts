import { z } from "zod"

import type { FormChoiceOption, FormQuestion, FormSchema } from "@/lib/forms/types"
import { validateFormSchema } from "@/lib/forms/validator/template"
import {
  validationFailure,
  validationOk,
  type ValidationResult,
} from "@/lib/forms/validator/result"
import { nonEmptyTrimmedString } from "@/lib/forms/validator/form-zod-shared"

function generateId(prefix: string): string {
  const uuid =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}_${uuid}`
}

function slugifyValue(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "")
}

function normalizeChoiceOptions(
  options: Array<Partial<FormChoiceOption>>,
): Array<FormChoiceOption> {
  const seen = new Set<string>()
  return options.map((opt, idx) => {
    const label = typeof opt.label === "string" ? opt.label.trim() : ""
    const base =
      typeof opt.value === "string" && opt.value.trim()
        ? opt.value.trim()
        : slugifyValue(label) || `option_${idx + 1}`

    let value = base
    let n = 2
    while (seen.has(value)) {
      value = `${base}_${n}`
      n++
    }
    seen.add(value)
    return { value, label: label || `Option ${idx + 1}` }
  })
}

const agentChoiceOptionSchema = z.object({
  value: z.string().optional(),
  label: nonEmptyTrimmedString,
})

const agentShortTextQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("short_text"),
  label: nonEmptyTrimmedString,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
})

const agentLongTextQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("long_text"),
  label: nonEmptyTrimmedString,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
})

const agentNumberQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("number"),
  label: nonEmptyTrimmedString,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  min: z.number().finite().optional(),
  max: z.number().finite().optional(),
})

const agentSingleChoiceQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("single_choice"),
  label: nonEmptyTrimmedString,
  required: z.boolean().optional(),
  options: z.array(agentChoiceOptionSchema).min(1),
})

const agentMultiChoiceQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("multi_choice"),
  label: nonEmptyTrimmedString,
  required: z.boolean().optional(),
  options: z.array(agentChoiceOptionSchema).min(1),
})

const agentQuestionSchema = z.discriminatedUnion("type", [
  agentShortTextQuestionSchema,
  agentLongTextQuestionSchema,
  agentNumberQuestionSchema,
  agentSingleChoiceQuestionSchema,
  agentMultiChoiceQuestionSchema,
])

const agentFormDraftSchema = z.object({
  id: z.string().optional(),
  title: nonEmptyTrimmedString,
  description: z.string().optional(),
  questions: z.array(agentQuestionSchema).min(1),
})

export function augmentAgentFormDraft(input: unknown): ValidationResult<FormSchema> {
  const alreadyValid = validateFormSchema(input)
  if (alreadyValid.ok) return alreadyValid

  const parsed = agentFormDraftSchema.safeParse(input)
  if (!parsed.success) {
    return validationFailure(
      parsed.error.issues.map((iss) => {
        const p = iss.path.length ? `${iss.path.join(".")}: ` : ""
        return `${p}${iss.message}`
      }),
    )
  }

  const draft = parsed.data

  const questions: Array<FormQuestion> = draft.questions.map((q) => {
    const base = {
      id: typeof q.id === "string" && q.id.trim() ? q.id.trim() : generateId("q"),
      type: q.type,
      label: q.label,
      required: q.required ?? false,
    } as const

    switch (q.type) {
      case "short_text":
        return { ...base, type: q.type, placeholder: q.placeholder }
      case "long_text":
        return { ...base, type: q.type, placeholder: q.placeholder }
      case "number":
        return {
          ...base,
          type: q.type,
          placeholder: q.placeholder,
          min: q.min,
          max: q.max,
        }
      case "single_choice":
        return {
          ...base,
          type: q.type,
          options: normalizeChoiceOptions(q.options),
        }
      case "multi_choice":
        return {
          ...base,
          type: q.type,
          options: normalizeChoiceOptions(q.options),
        }
    }
  })

  if (questions.length > 0 && !questions.some((q) => q.required)) {
    questions[0] = { ...questions[0], required: true }
  }

  const form: FormSchema = {
    id: typeof draft.id === "string" && draft.id.trim() ? draft.id.trim() : generateId("form"),
    title: draft.title,
    description: draft.description,
    questions,
  }

  const validated = validateFormSchema(form)
  if (!validated.ok) return validated
  return validationOk(validated.value)
}

