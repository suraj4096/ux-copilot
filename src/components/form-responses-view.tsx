"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { LayoutGrid, Table2 } from "lucide-react"
import * as React from "react"

import type { FormResponsesPageQueryData } from "@/lib/query-options"
import { FormResponsesCards } from "@/components/form-responses-cards"
import { FormResponsesTable } from "@/components/form-responses-table"
import {
  DebouncedSearchField,
  OffsetPaginationBar,
} from "@/components/offset-pagination-bar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { deleteFormResponseFn } from "@/lib/data.functions"
import { copilotResponseAnchorId } from "@/lib/copilot-links"
import { cn } from "@/lib/utils"

export function FormResponsesView({
  surveyId,
  formId,
  data,
  listFetching,
  highlightResponseId,
  responsesList,
}: {
  surveyId: string
  formId: string
  data: FormResponsesPageQueryData
  listFetching: boolean
  highlightResponseId?: string
  responsesList: {
    q?: string
    offset: number
    limit: number
    highlightResponse?: string
  }
}) {
  const navigate = useNavigate({
    from: "/surveys/$surveyId/form/$formId/",
  })
  const [navPending, startTransition] = React.useTransition()
  const [responseToDelete, setResponseToDelete] = React.useState<string | null>(
    null,
  )
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
        queryKey: ["surveyForm", formId, "responses", surveyId],
      })
    },
  })

  const publicFormPath = `/f/${formId}`

  function onDeleteResponse(responseId: string) {
    setResponseToDelete(responseId)
  }

  const formResOk = data.formRes.ok
  const responsesResOk = data.responsesRes.ok
  const responsesForScroll =
    formResOk && responsesResOk ? data.responsesRes.responses : []

  const [responsesTab, setResponsesTab] = React.useState("cards")

  React.useEffect(() => {
    if (highlightResponseId) setResponsesTab("cards")
  }, [highlightResponseId])

  const responseIdsKey = responsesForScroll.map((r) => r.id).join(",")

  React.useLayoutEffect(() => {
    if (!highlightResponseId || responsesForScroll.length === 0) return
    const id = copilotResponseAnchorId(highlightResponseId)
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    })
  }, [
    highlightResponseId,
    responseIdsKey,
    listFetching,
    responsesForScroll.length,
    responsesTab,
  ])

  React.useEffect(() => {
    if (!highlightResponseId) return
    const t = window.setTimeout(() => {
      void navigate({
        to: ".",
        replace: true,
        search: (prev) => ({ ...prev, highlightResponse: undefined }),
      })
    }, 5000)
    return () => window.clearTimeout(t)
  }, [highlightResponseId, navigate])

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
  const total = data.responsesRes.total
  const deletePendingId = deleteResponseMutation.isPending
    ? deleteResponseMutation.variables
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1 className="min-w-0 truncate text-lg font-semibold">{form.title}</h1>
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
        {publicFormPath}
      </div>

      <Separator />

      <Tabs
        value={responsesTab}
        onValueChange={(v) => setResponsesTab(String(v))}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-base font-medium">Responses</h2>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-[0_1_auto]">
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
            <DebouncedSearchField
              urlValue={responsesList.q ?? ""}
              isBusy={listFetching || navPending}
              onDebouncedCommit={(text) => {
                startTransition(() => {
                  void navigate({
                    to: ".",
                    replace: true,
                    search: (prev) => ({
                      ...prev,
                      rq: text,
                      roffset: 0,
                      highlightResponse: undefined,
                    }),
                  })
                })
              }}
              placeholder="Search in answers (JSON text)…"
              inputId={`form-responses-search-${formId}`}
              className="min-w-48 max-w-md basis-52 sm:max-w-xs"
            />
          </div>
        </div>

        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {total === 0 && !responsesList.q
              ? "No responses yet."
              : "No responses match this page or search."}
          </p>
        ) : (
          <>
            <TabsContent value="cards" className="mt-0">
              <FormResponsesCards
                form={form}
                responses={responses}
                deletePendingId={deletePendingId}
                highlightResponseId={highlightResponseId}
                assignCopilotAnchorId={responsesTab === "cards"}
                onDeleteResponse={onDeleteResponse}
              />
            </TabsContent>
            <TabsContent value="table" className="mt-0">
              <FormResponsesTable
                form={form}
                responses={responses}
                deletePendingId={deletePendingId}
                highlightResponseId={highlightResponseId}
                assignCopilotAnchorId={responsesTab === "table"}
                onDeleteResponse={onDeleteResponse}
              />
            </TabsContent>
          </>
        )}

        <OffsetPaginationBar
          total={total}
          offset={responsesList.offset}
          limit={responsesList.limit}
          buildSearch={({ offset }) => ({
            rq: responsesList.q,
            roffset: offset,
            rlimit: responsesList.limit,
            highlightResponse: responsesList.highlightResponse,
          })}
        />
      </Tabs>

      <AlertDialog
        open={responseToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setResponseToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this response?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the submission. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              disabled={deleteResponseMutation.isPending}
              onClick={() => {
                const id = responseToDelete
                setResponseToDelete(null)
                if (id) deleteResponseMutation.mutate(id)
              }}
            >
              {deleteResponseMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
