import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { NewSurveyDialog } from "@/components/new-survey-dialog"
import { listSurveysQueryOptions } from "@/lib/query-options"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/surveys/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(listSurveysQueryOptions()),
  component: SurveysPage,
})

function SurveysPage() {
  const { data } = useSuspenseQuery(listSurveysQueryOptions())

  if (!data.ok) {
    return (
      <AppShell>
        <p className="text-sm text-destructive">{data.errors.join(" ")}</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Surveys</h1>
          <NewSurveyDialog>
            <span>New survey</span>
          </NewSurveyDialog>
        </div>
        {data.surveys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No surveys yet. Create one to add forms.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {data.surveys.map((s) => (
              <li key={s.id}>
                <Link
                  to="/surveys/$surveyId"
                  params={{ surveyId: s.id }}
                  className="block px-4 py-3 text-sm font-medium hover:bg-muted/50"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
