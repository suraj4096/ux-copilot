import { createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { SurveyDetailView } from "@/components/survey-detail-view"
import { surveyDetailQueryOptions } from "@/lib/query-options"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/surveys/$surveyId/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      surveyDetailQueryOptions(params.surveyId),
    ),
  component: SurveyDetailPage,
})

function SurveyDetailPage() {
  const { surveyId } = Route.useParams()
  return (
    <AppShell>
      <SurveyDetailView surveyId={surveyId} />
    </AppShell>
  )
}
