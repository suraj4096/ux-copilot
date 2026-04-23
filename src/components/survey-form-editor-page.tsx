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
import { useArtifactActions } from "@/components/artifact/artifact-actions-context"
import { useAgentCurrentContext } from "@/contexts/agent-context"
import { discardAgentFormDraft } from "@/lib/ai/client/agent-draft-storage"

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
  const { setActions, clearActions } = useArtifactActions()
  const { setCurrentContext } = useAgentCurrentContext()
  const { values } = useFormBuilder()
  const [activeTab, setActiveTab] = React.useState("edit")
  const [clientValidationError, setClientValidationError] = React.useState<
    string | null
  >(null)

  const valuesRef = React.useRef(values)
  React.useEffect(() => {
    valuesRef.current = values
  }, [values])

  const saveMutation = useMutation({
    mutationFn: async (payload: FormSchema) => {
      const res = (await createForm({ data: { surveyId, payload } })) as
        | { ok: false; errors: Array<string> }
        | { ok: true; form: { id: string } }
      if (!res.ok) throw new Error(res.errors.join(" "))
      return res
    },
    onSuccess: async (res) => {
      discardAgentFormDraft()
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

  const mutateSave = saveMutation.mutate
  const isSaving = saveMutation.isPending

  const onSave = React.useCallback(() => {
    const nextValues = valuesRef.current
    const parsed = validateFormSchema(nextValues)
    if (!parsed.ok) {
      setClientValidationError(parsed.errors.join(" "))
      return
    }
    setClientValidationError(null)
    mutateSave(nextValues)
  }, [mutateSave])

  const saveError =
    clientValidationError ??
    (saveMutation.isError && saveMutation.error instanceof Error
      ? saveMutation.error.message
      : null)

  const hasTopAlerts =
    Boolean(cloneError) ||
    Boolean(clonedFromFormId && !cloneError) ||
    Boolean(saveError)

  const formContextJson = React.useMemo(() => {
    try {
      return JSON.stringify(values)
    } catch {
      return "{}"
    }
  }, [values])

  React.useEffect(() => {
    const screen = `survey/${surveyId}/form/new`
    const context = `New form (draft JSON): ${formContextJson}`
    setCurrentContext({ screen, context })
    // eslint-disable-next-line no-console
    console.log("[AgentContext] currentContext", { screen, context })
  }, [formContextJson, setCurrentContext, surveyId])

  React.useEffect(() => {
    setActions(
      <div className="flex items-center gap-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator orientation="vertical" className="hidden h-8 sm:block" />
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>,
    )
    return () => {
      clearActions()
    }
  }, [activeTab, clearActions, isSaving, onSave, setActions])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
            <div className="grid h-full min-h-0 gap-4 md:grid-cols-[1fr_16rem]">
              <section className="flex min-w-0 flex-col gap-4">
                <div className="mx-auto w-full max-w-2xl">
                  <FormRenderer form={values} mode="preview" />
                </div>
              </section>
              <div
                className="hidden self-start rounded-lg border border-transparent p-3 md:block"
                aria-hidden
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
