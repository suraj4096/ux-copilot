import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { FormBuilderProvider } from "@/contexts/form-builder-context"
import { SurveyFormEditorPage } from "@/components/survey-form-editor-page"
import { newFormCloneQueryOptions } from "@/lib/query-options"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/surveys/$surveyId/form/")({
  validateSearch: (search: Record<string, unknown>) => ({
    cloneFrom:
      typeof search.cloneFrom === "string" && search.cloneFrom.trim()
        ? search.cloneFrom.trim()
        : undefined,
  }),
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  loaderDeps: ({ search }) => ({
    cloneFrom: search.cloneFrom,
  }),
  loader: ({ context, params, deps }) =>
    context.queryClient.ensureQueryData(
      newFormCloneQueryOptions(params.surveyId, deps.cloneFrom),
    ),
  component: NewSurveyFormPage,
})

function NewSurveyFormPage() {
  const { surveyId } = Route.useParams()
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(
    newFormCloneQueryOptions(surveyId, search.cloneFrom),
  )

  const key = `${surveyId}-${search.cloneFrom ?? "new"}`

  return (
    <AppShell>
      <FormBuilderProvider key={key} initialForm={data.initialForm ?? undefined}>
        <SurveyFormEditorPage
          surveyId={surveyId}
          cloneError={data.cloneError}
          clonedFromFormId={search.cloneFrom}
        />
      </FormBuilderProvider>
    </AppShell>
  )
}
