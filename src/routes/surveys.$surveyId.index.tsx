import { createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { SurveyDetailView } from "@/components/survey-detail-view"
import { surveyDetailQueryOptions } from "@/lib/query-options"
import { surveyDetailSearchSchema } from "@/lib/router-search-schemas"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/surveys/$surveyId/")({
  validateSearch: (search: Record<string, unknown>) =>
    surveyDetailSearchSchema.parse(search),
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  loaderDeps: ({ search }) => ({
    fq: search.fq,
    foffset: search.foffset,
    flimit: search.flimit,
  }),
  loader: ({ context, params, deps }) =>
    context.queryClient.ensureQueryData(
      surveyDetailQueryOptions(params.surveyId, {
        search: deps.fq,
        offset: deps.foffset,
        limit: deps.flimit,
      }),
    ),
  component: SurveyDetailPage,
})

function SurveyDetailPage() {
  const { surveyId } = Route.useParams()
  const search = Route.useSearch()

  return (
    <AppShell>
      <SurveyDetailView
        surveyId={surveyId}
        formsList={{
          q: search.fq,
          offset: search.foffset,
          limit: search.flimit,
        }}
      />
    </AppShell>
  )
}
