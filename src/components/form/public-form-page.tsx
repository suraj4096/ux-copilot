"use client"

import * as React from "react"

import type { FormSchema } from "@/lib/forms/types"
import { FormRenderer } from "@/components/form/form-renderer"

export function PublicFormPage({
  formId,
  form,
}: {
  formId: string
  form: FormSchema
}) {
  const [submitted, setSubmitted] = React.useState(false)

  if (submitted) {
    return (
      <div className="mx-auto max-w-md space-y-2 p-6 text-center">
        <h1 className="text-lg font-semibold">Thank you</h1>
        <p className="text-sm text-muted-foreground">Your response was recorded.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pb-16">
      <FormRenderer
        form={form}
        mode="submit"
        surveyFormId={formId}
        onSubmitted={() => setSubmitted(true)}
      />
    </div>
  )
}
