"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { LayoutGrid, Table2 } from "lucide-react"

import type {FormResponsesPageQueryData} from "@/lib/query-options";
import { FormResponsesCards } from "@/components/form-responses-cards"
import { FormResponsesTable } from "@/components/form-responses-table"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { deleteFormResponseFn } from "@/lib/data.functions"
import {
  
  formResponsesPageQueryOptions
} from "@/lib/query-options"
import { cn } from "@/lib/utils"

export function FormResponsesView({
  surveyId,
  formId,
  data,
}: {
  surveyId: string
  formId: string
  data: FormResponsesPageQueryData
}) {
  const queryClient = useQueryClient()
  const deleteResponse = useServerFn(deleteFormResponseFn)

  const deleteResponseMutation = useMutation({
    mutationFn: async (responseId: string) => {
      const res = (await deleteResponse({
        data: { responseId },
      })) as { ok: false; errors: Array<string> } | { ok: true }
      if (!res.ok) throw new Error(res.errors.join(" "))
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: formResponsesPageQueryOptions(surveyId, formId).queryKey,
      })
    },
  })

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${formId}`
      : `/f/${formId}`

  function onDeleteResponse(responseId: string) {
    if (!window.confirm("Delete this response?")) return
    deleteResponseMutation.mutate(responseId)
  }

  if (!data.formRes.ok) {
    return (
      <p className="text-sm text-destructive">{data.formRes.errors.join(" ")}</p>
    )
  }

  if (!data.responsesRes.ok) {
    return (
      <p className="text-sm text-destructive">
        {data.responsesRes.errors.join(" ")}
      </p>
    )
  }

  const form = data.formRes.form
  const responses = data.responsesRes.responses
  const deletePendingId = deleteResponseMutation.isPending
    ? deleteResponseMutation.variables
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">{form.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link
              to="/surveys/$surveyId"
              params={{ surveyId }}
              className="underline-offset-4 hover:underline"
            >
              Back to survey
            </Link>
          </p>
        </div>
        <Link
          to="/f/$formId"
          params={{ formId }}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Open public form
        </Link>
      </div>

      <div className="rounded-lg border bg-muted/30 px-3 py-2 font-mono text-xs break-all text-muted-foreground">
        {publicUrl}
      </div>

      <Separator />

      <Tabs defaultValue="cards" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-base font-medium">Responses</h2>
          {responses.length > 0 ? (
            <TabsList className="shrink-0">
              <TabsTrigger value="cards" className="gap-1.5 px-3">
                <LayoutGrid className="size-4" aria-hidden />
                Cards
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-1.5 px-3">
                <Table2 className="size-4" aria-hidden />
                Table
              </TabsTrigger>
            </TabsList>
          ) : null}
        </div>

        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No responses yet.</p>
        ) : (
          <>
            <TabsContent value="cards" className="mt-0">
              <FormResponsesCards
                form={form}
                responses={responses}
                deletePendingId={deletePendingId}
                onDeleteResponse={onDeleteResponse}
              />
            </TabsContent>
            <TabsContent value="table" className="mt-0">
              <FormResponsesTable
                form={form}
                responses={responses}
                deletePendingId={deletePendingId}
                onDeleteResponse={onDeleteResponse}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
