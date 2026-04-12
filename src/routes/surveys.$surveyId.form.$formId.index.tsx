import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { FormResponsesView } from "@/components/form-responses-view"
import { formResponsesPageQueryOptions } from "@/lib/query-options"
import { formResponsesSearchSchema } from "@/lib/router-search-schemas"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/surveys/$surveyId/form/$formId/")({
  validateSearch: (search: Record<string, unknown>) =>
    formResponsesSearchSchema.parse(search),
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  loaderDeps: ({ search }) => ({
    rq: search.rq,
    roffset: search.roffset,
    rlimit: search.rlimit,
  }),
  loader: ({ context, params, deps }) =>
    context.queryClient.ensureQueryData(
      formResponsesPageQueryOptions(params.surveyId, params.formId, {
        search: deps.rq,
        offset: deps.roffset,
        limit: deps.rlimit,
      }),
    ),
  component: FormResponsesPage,
})

function FormResponsesPage() {
  const { surveyId, formId } = Route.useParams()
  const search = Route.useSearch()
  const { data, isFetching } = useQuery({
    ...formResponsesPageQueryOptions(surveyId, formId, {
      search: search.rq,
      offset: search.roffset,
      limit: search.rlimit,
    }),
    placeholderData: (previousData) => previousData,
  })

  if (!data) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    )
  }

  if (data.formRes.ok && data.formRes.surveyId !== surveyId) {
    return (
      <AppShell>
        <p className="text-sm text-destructive">
          This form does not belong to this survey.
        </p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <FormResponsesView
        surveyId={surveyId}
        formId={formId}
        data={data}
        listFetching={isFetching}
        highlightResponseId={search.highlightResponse}
        responsesList={{
          q: search.rq,
          offset: search.roffset,
          limit: search.rlimit,
          highlightResponse: search.highlightResponse,
        }}
      />
    </AppShell>
  )
}
