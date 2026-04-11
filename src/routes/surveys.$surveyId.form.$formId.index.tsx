import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { FormResponsesView } from "@/components/form-responses-view"
import { formResponsesPageQueryOptions } from "@/lib/query-options"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/surveys/$surveyId/form/$formId/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  loader: ({ context, params }) => {
    const { surveyId, formId } = params
    return context.queryClient.ensureQueryData(
      formResponsesPageQueryOptions(surveyId, formId),
    )
  },
  component: FormResponsesPage,
})

function FormResponsesPage() {
  const { surveyId, formId } = Route.useParams()
  const { data } = useSuspenseQuery(
    formResponsesPageQueryOptions(surveyId, formId),
  )

  if (data.formRes.ok && data.formRes.surveyId !== surveyId) {
    return (
      <AppShell>
        <p className="text-sm text-destructive">This form does not belong to this survey.</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <FormResponsesView surveyId={surveyId} formId={formId} data={data} />
    </AppShell>
  )
}
