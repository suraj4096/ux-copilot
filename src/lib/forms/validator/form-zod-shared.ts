import { z } from "zod"

export const nonEmptyTrimmedString = z.string().trim().pipe(z.string().min(1))

export const formSubmissionAnswerRowSchema = z.object({
  question_id: nonEmptyTrimmedString,
  value: z.unknown(),
})

export const formSubmissionAnswersArraySchema = z.array(formSubmissionAnswerRowSchema)
