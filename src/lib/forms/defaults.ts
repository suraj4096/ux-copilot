import type {
  FormChoiceOption,
  FormQuestion,
  FormQuestionType,
  FormSchema,
} from "@/lib/forms/types"

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyForm(): FormSchema {
  return {
    id: createId("form"),
    title: "Untitled form",
    description: "",
    questions: [],
  }
}

function defaultOption(label: string): FormChoiceOption {
  return { value: label.toLowerCase().replaceAll(/\s+/g, "_"), label }
}

export function createQuestion(type: FormQuestionType): FormQuestion {
  const base = {
    id: createId("q"),
    type,
    label: "Untitled question",
    required: false,
  } as const

  switch (type) {
    case "short_text":
      return { ...base, type, placeholder: "Your answer" }
    case "long_text":
      return { ...base, type, placeholder: "Your answer" }
    case "number":
      return { ...base, type, placeholder: "Enter a number" }
    case "single_choice":
      return {
        ...base,
        type,
        options: [defaultOption("Option 1"), defaultOption("Option 2")],
      }
    case "multi_choice":
      return {
        ...base,
        type,
        options: [defaultOption("Option 1"), defaultOption("Option 2")],
      }
  }
}

