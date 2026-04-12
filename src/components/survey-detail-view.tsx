"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import * as React from "react"

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
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { deleteSurveyFn, deleteSurveyFormFn } from "@/lib/data.functions"
import { surveyDetailQueryOptions } from "@/lib/query-options"
import {
  formResponsesSearchDefaults,
  newFormSearchDefaults,
  surveysListSearchDefaults,
} from "@/lib/router-search-defaults"
import { cn } from "@/lib/utils"

export function SurveyDetailView({
  surveyId,
  formsList,
}: {
  surveyId: string
  formsList: { q?: string; offset: number; limit: number }
}) {
  const navigate = useNavigate({ from: "/surveys/$surveyId/" })
  const queryClient = useQueryClient()
  const [navPending, startTransition] = React.useTransition()
  const [deleteIntent, setDeleteIntent] = React.useState<
    null | { type: "survey" } | { type: "form"; formId: string }
  >(null)

  const { data, isFetching } = useQuery({
    ...surveyDetailQueryOptions(surveyId, {
      search: formsList.q,
      offset: formsList.offset,
      limit: formsList.limit,
    }),
    placeholderData: (previousData) => previousData,
  })

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  const deleteSurvey = useServerFn(deleteSurveyFn)
  const deleteForm = useServerFn(deleteSurveyFormFn)

  const deleteSurveyMutation = useMutation({
    mutationFn: async () => {
      const res = (await deleteSurvey({ data: { surveyId } })) as
        | { ok: false; errors: Array<string> }
        | { ok: true }
      if (!res.ok) throw new Error(res.errors.join(" "))
      return res
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["surveys", "list"] })
      await navigate({ to: "/surveys", search: surveysListSearchDefaults })
    },
  })

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      const res = (await deleteForm({ data: { formId } })) as
        | { ok: false; errors: Array<string> }
        | { ok: true }
      if (!res.ok) throw new Error(res.errors.join(" "))
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["survey", surveyId, "detail"],
      })
    },
  })

  if (!data.surveyRes.ok) {
    return (
      <p className="text-sm text-destructive">{data.surveyRes.errors.join(" ")}</p>
    )
  }

  if (!data.formsRes.ok) {
    return (
      <p className="text-sm text-destructive">{data.formsRes.errors.join(" ")}</p>
    )
  }

  const survey = data.surveyRes.survey
  const forms = data.formsRes.forms
  const formsTotal = data.formsRes.total

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-lg font-semibold">{survey.title}</h1>
        <div className="flex min-w-0 max-w-full flex-[1_1_16rem] flex-wrap items-center justify-end gap-2 sm:flex-[0_1_auto]">
          <Link
            to="/surveys/$surveyId/form"
            params={{ surveyId }}
            search={newFormSearchDefaults}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            New form
          </Link>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteSurveyMutation.isPending}
            onClick={() => setDeleteIntent({ type: "survey" })}
          >
            {deleteSurveyMutation.isPending ? "Deleting…" : "Delete survey"}
          </Button>
          <DebouncedSearchField
            urlValue={formsList.q ?? ""}
            isBusy={isFetching || navPending}
            onDebouncedCommit={(text) => {
              startTransition(() => {
                void navigate({
                  to: ".",
                  replace: true,
                  search: (prev) => ({
                    ...prev,
                    fq: text,
                    foffset: 0,
                  }),
                })
              })
            }}
            placeholder="Search forms (title, description, questions)…"
            inputId={`survey-forms-search-${surveyId}`}
            className="min-w-48 max-w-md basis-52 sm:max-w-xs"
          />
        </div>
      </div>

      <Separator />

      {forms.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No forms match. Try another search or create a form.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {forms.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div className="min-w-0">
                <Link
                  to="/surveys/$surveyId/form/$formId"
                  params={{ surveyId, formId: f.id }}
                  search={formResponsesSearchDefaults}
                  className="font-medium hover:underline"
                >
                  {f.title}
                </Link>
                {f.description ? (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {f.description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  to="/surveys/$surveyId/form"
                  params={{ surveyId }}
                  search={{ ...newFormSearchDefaults, cloneFrom: f.id }}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Clone
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    deleteFormMutation.isPending &&
                    deleteFormMutation.variables === f.id
                  }
                  onClick={() => setDeleteIntent({ type: "form", formId: f.id })}
                >
                  {deleteFormMutation.isPending &&
                  deleteFormMutation.variables === f.id
                    ? "Deleting…"
                    : "Delete"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <OffsetPaginationBar
        total={formsTotal}
        offset={formsList.offset}
        limit={formsList.limit}
        buildSearch={({ offset }) => ({
          fq: formsList.q,
          foffset: offset,
          flimit: formsList.limit,
        })}
      />

      <AlertDialog
        open={deleteIntent !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteIntent(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteIntent?.type === "survey"
                ? "Delete this survey?"
                : "Delete this form?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteIntent?.type === "survey"
                ? "This removes the survey and all of its forms and responses. This cannot be undone."
                : "This removes the form and all of its responses. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              disabled={
                deleteSurveyMutation.isPending || deleteFormMutation.isPending
              }
              onClick={() => {
                const intent = deleteIntent
                setDeleteIntent(null)
                if (intent?.type === "survey") deleteSurveyMutation.mutate()
                else if (intent?.type === "form") {
                  deleteFormMutation.mutate(intent.formId)
                }
              }}
            >
              {deleteSurveyMutation.isPending || deleteFormMutation.isPending
                ? "Deleting…"
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
