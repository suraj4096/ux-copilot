"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { deleteSurveyFn, deleteSurveyFormFn } from "@/lib/data.functions"
import {
  listSurveysQueryOptions,
  surveyDetailQueryOptions,
} from "@/lib/query-options"
import { cn } from "@/lib/utils"

export function SurveyDetailView({ surveyId }: { surveyId: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(surveyDetailQueryOptions(surveyId))

  const deleteSurvey = useServerFn(deleteSurveyFn)
  const deleteForm = useServerFn(deleteSurveyFormFn)

  const deleteSurveyMutation = useMutation({
    mutationFn: async () => {
      const res = await deleteSurvey({ data: { surveyId } })
      if (!res.ok) throw new Error(res.errors.join(" "))
      return res
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listSurveysQueryOptions().queryKey,
      })
      await navigate({ to: "/surveys" })
    },
  })

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      const res = await deleteForm({ data: { formId } })
      if (!res.ok) throw new Error(res.errors.join(" "))
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: surveyDetailQueryOptions(surveyId).queryKey,
      })
    },
  })

  function onDeleteSurvey() {
    if (!window.confirm("Delete this survey and all of its forms and responses?")) {
      return
    }
    deleteSurveyMutation.mutate()
  }

  function onDeleteForm(formId: string) {
    if (!window.confirm("Delete this form and all responses?")) return
    deleteFormMutation.mutate(formId)
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">{survey.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link
              to="/surveys"
              className="underline-offset-4 hover:underline"
            >
              All surveys
            </Link>
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleteSurveyMutation.isPending}
          onClick={onDeleteSurvey}
        >
          {deleteSurveyMutation.isPending ? "Deleting…" : "Delete survey"}
        </Button>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-medium">Forms</h2>
        <Link
          to="/surveys/$surveyId/form"
          params={{ surveyId }}
          className={cn(buttonVariants())}
        >
          New form
        </Link>
      </div>

      {forms.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No forms yet. Create one to collect responses.
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
                  search={{ cloneFrom: f.id }}
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
                  onClick={() => onDeleteForm(f.id)}
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
    </div>
  )
}
