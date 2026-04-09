"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"

import type { FormSchema } from "@/lib/forms/types"
import {
  coerceAnswerForQuestion,
  createEmptyAnswers,
} from "@/lib/forms/answers"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export function FormRenderer({
  form,
  className,
}: {
  form: FormSchema
  className?: string
}) {
  const formInstance = useForm({
    defaultValues: {
      answers: createEmptyAnswers(form),
    },
    onSubmit: async () => {},
  })

  React.useEffect(() => {
    formInstance.reset({
      answers: createEmptyAnswers(form),
    })
  }, [form, formInstance])

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(e) => {
        e.preventDefault()
        formInstance.handleSubmit()
      }}
      noValidate
    >
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <div className="text-lg font-semibold">{form.title}</div>
        {form.description?.trim() ? (
          <div className="mt-1 text-sm text-muted-foreground">
            {form.description}
          </div>
        ) : null}
      </div>

      {form.questions.map((q) => {
        const name = `answers.${q.id}` as const

        return (
          <formInstance.Field
            key={q.id}
            name={name as any}
            mode={q.type === "multi_choice" ? "array" : "value"}
            validators={{
              onSubmit: ({ value }) => {
                if (!q.required) return undefined
                const missing =
                  value == null ||
                  (typeof value === "string" && value.trim().length === 0) ||
                  (Array.isArray(value) && value.length === 0)
                return missing ? "This field is required." : undefined
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <div
                  className={cn(
                    "rounded-lg border bg-card p-4 text-card-foreground",
                    isInvalid && "border-destructive/50"
                  )}
                >
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldTitle>
                        <span>{q.label}</span>
                        {q.required ? (
                          <span className="text-destructive">*</span>
                        ) : null}
                      </FieldTitle>

                      {"placeholder" in q && q.type === "short_text" ? (
                        <Input
                          name={field.name}
                          value={String(field.state.value ?? "")}
                          placeholder={q.placeholder ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              coerceAnswerForQuestion(q, e.target.value) as any
                            )
                          }
                          aria-invalid={isInvalid}
                          autoComplete="off"
                        />
                      ) : null}

                      {"placeholder" in q && q.type === "number" ? (
                        <Input
                          name={field.name}
                          type="number"
                          value={
                            field.state.value == null
                              ? ""
                              : String(field.state.value)
                          }
                          min={q.min}
                          max={q.max}
                          placeholder={q.placeholder ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              coerceAnswerForQuestion(q, e.target.value) as any
                            )
                          }
                          aria-invalid={isInvalid}
                          autoComplete="off"
                        />
                      ) : null}

                      {"placeholder" in q && q.type === "long_text" ? (
                        <Textarea
                          name={field.name}
                          value={String(field.state.value ?? "")}
                          placeholder={q.placeholder ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              coerceAnswerForQuestion(q, e.target.value) as any
                            )
                          }
                          aria-invalid={isInvalid}
                        />
                      ) : null}

                      {"options" in q && q.type === "single_choice" ? (
                        <RadioGroup
                          name={field.name}
                          value={String(field.state.value ?? "")}
                          onValueChange={(value) =>
                            field.handleChange(
                              coerceAnswerForQuestion(q, value) as any
                            )
                          }
                        >
                          {q.options.map((opt) => {
                            const id = `${q.id}_${opt.value}`
                            return (
                              <Label
                                key={opt.value}
                                htmlFor={id}
                                className="rounded-lg border bg-background p-3"
                              >
                                <RadioGroupItem
                                  id={id}
                                  value={opt.value}
                                  aria-invalid={isInvalid}
                                />
                                <span>{opt.label}</span>
                              </Label>
                            )
                          })}
                        </RadioGroup>
                      ) : null}

                      {"options" in q && q.type === "multi_choice" ? (
                        <div className="flex flex-col gap-2">
                          {q.options.map((opt) => {
                            const id = `${q.id}_${opt.value}`
                            const current = Array.isArray(field.state.value)
                              ? (field.state.value as string[])
                              : []
                            const checked = current.includes(opt.value)
                            return (
                              <Label
                                key={opt.value}
                                htmlFor={id}
                                className="rounded-lg border bg-background p-3"
                              >
                                <Checkbox
                                  id={id}
                                  name={field.name}
                                  aria-invalid={isInvalid}
                                  checked={checked}
                                  onCheckedChange={(next) => {
                                    if (next) {
                                      field.pushValue(opt.value)
                                      return
                                    }

                                    const index = current.indexOf(opt.value)
                                    if (index > -1) {
                                      field.removeValue(index)
                                    }
                                  }}
                                />
                                <span>{opt.label}</span>
                              </Label>
                            )
                          })}
                        </div>
                      ) : null}

                      <FieldDescription className="sr-only">
                        {q.type}
                      </FieldDescription>
                      {isInvalid ? (
                        <FieldError
                          errors={field.state.meta.errors.map((message) => ({
                            message,
                          }))}
                        />
                      ) : null}
                    </FieldContent>
                  </Field>
                </div>
              )
            }}
          </formInstance.Field>
        )
      })}

      <div className="flex items-center justify-end gap-2">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}

