export type FormQuestionType =
  | "short_text"
  | "long_text"
  | "number"
  | "single_choice"
  | "multi_choice"

export type FormChoiceOption = {
  value: string
  label: string
}

type BaseQuestion = {
  id: string
  type: FormQuestionType
  label: string
  required: boolean
}

export type ShortTextQuestion = BaseQuestion & {
  type: "short_text"
  placeholder?: string
}

export type LongTextQuestion = BaseQuestion & {
  type: "long_text"
  placeholder?: string
}

export type NumberQuestion = BaseQuestion & {
  type: "number"
  placeholder?: string
  min?: number
  max?: number
}

export type SingleChoiceQuestion = BaseQuestion & {
  type: "single_choice"
  options: FormChoiceOption[]
}

export type MultiChoiceQuestion = BaseQuestion & {
  type: "multi_choice"
  options: FormChoiceOption[]
}

export type FormQuestion =
  | ShortTextQuestion
  | LongTextQuestion
  | NumberQuestion
  | SingleChoiceQuestion
  | MultiChoiceQuestion

export type FormSchema = {
  id: string
  title: string
  description?: string
  questions: FormQuestion[]
}

export type FormAnswerValue = string | number | string[] | null

export type FormAnswersByQuestionId = Record<string, FormAnswerValue>

