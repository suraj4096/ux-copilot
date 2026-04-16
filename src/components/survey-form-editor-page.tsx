"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import type { FormSchema } from "@/lib/forms/types"
import { validateFormSchema } from "@/lib/forms/validator"
import { FormBuilder } from "@/components/form/form-builder"
import { useFormBuilder } from "@/contexts/form-builder-context"
import { FormRenderer } from "@/components/form/form-renderer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createSurveyFormFn } from "@/lib/data.functions"
import { formResponsesSearchDefaults } from "@/lib/router-search-defaults"

export function SurveyFormEditorPage({
  surveyId,
  cloneError,
  clonedFromFormId,
}: {
  surveyId: string
  cloneError?: string | null
  clonedFromFormId?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createForm = useServerFn(createSurveyFormFn)
  const { values } = useFormBuilder()
  const [activeTab, setActiveTab] = React.useState("edit")
  const [clientValidationError, setClientValidationError] = React.useState<
    string | null
  >(null)

  const saveMutation = useMutation({
    mutationFn: async (payload: FormSchema) => {
      const res = (await createForm({ data: { surveyId, payload } })) as
        | { ok: false; errors: Array<string> }
        | { ok: true; form: { id: string } }
      if (!res.ok) throw new Error(res.errors.join(" "))
      return res
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: ["survey", surveyId, "detail"],
      })
      await navigate({
        to: "/surveys/$surveyId/form/$formId",
        params: { surveyId, formId: res.form.id },
        search: formResponsesSearchDefaults,
      })
    },
  })

  function onSave() {
    const parsed = validateFormSchema(values)
    if (!parsed.ok) {
      setClientValidationError(parsed.errors.join(" "))
      return
    }
    setClientValidationError(null)
    saveMutation.mutate(values)
  }

  const saveError =
    clientValidationError ??
    (saveMutation.isError && saveMutation.error instanceof Error
      ? saveMutation.error.message
      : null)

  const hasTopAlerts =
    Boolean(cloneError) ||
    Boolean(clonedFromFormId && !cloneError) ||
    Boolean(saveError)

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-24">
      {cloneError ? (
        <div
          className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {cloneError}
        </div>
      ) : null}

      {clonedFromFormId && !cloneError ? (
        <div className="mt-3 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Draft copied from an existing form. Nothing is saved until you click Save.
        </div>
      ) : null}

      {saveError ? (
        <div
          className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {saveError}
        </div>
      ) : null}

      {hasTopAlerts ? <Separator className="my-4" /> : null}

      <div className="min-h-0 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="edit" className="h-full">
            <FormBuilder />
          </TabsContent>
          <TabsContent value="preview" className="h-full">
            <div className="grid h-full min-h-0 gap-4 md:grid-cols-[16rem_1fr]">
              <div
                className="hidden self-start rounded-lg border border-transparent p-3 md:block"
                aria-hidden
              />
              <section className="flex min-w-0 flex-col gap-4">
                <div className="mx-auto w-full max-w-2xl">
                  <FormRenderer form={values} mode="preview" />
                </div>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-50">
        <div className="mx-auto flex w-fit max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-2 rounded-full border bg-background/80 p-2 shadow-sm backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
          <Separator orientation="vertical" className="hidden h-8 sm:block" />
          <Button onClick={onSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
