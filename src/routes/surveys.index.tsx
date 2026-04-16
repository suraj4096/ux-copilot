import { useQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import * as React from "react"

import {
  DebouncedSearchField,
  OffsetPaginationBar,
} from "@/components/offset-pagination-bar"
import { NewSurveyDialog } from "@/components/new-survey-dialog"
import { listSurveysQueryOptions } from "@/lib/query-options"
import { surveyDetailSearchDefaults } from "@/lib/router-search-defaults"
import { surveysListSearchSchema } from "@/lib/router-search-schemas"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/surveys/")({
  validateSearch: (search: Record<string, unknown>) =>
    surveysListSearchSchema.parse(search),
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  loaderDeps: ({ search }) => ({
    q: search.q,
    offset: search.offset,
    limit: search.limit,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      listSurveysQueryOptions({
        search: deps.q,
        offset: deps.offset,
        limit: deps.limit,
      }),
    ),
  component: SurveysPage,
})

function SurveysPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [navPending, startTransition] = React.useTransition()

  const { data, isFetching } = useQuery({
    ...listSurveysQueryOptions({
      search: search.q,
      offset: search.offset,
      limit: search.limit,
    }),
    placeholderData: (previousData) => previousData,
  })

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!data.ok) {
    return <p className="text-sm text-destructive">{data.errors.join(" ")}</p>
  }

  const { surveys, total } = data

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Surveys</h1>
        <NewSurveyDialog>
          <span>New survey</span>
        </NewSurveyDialog>
      </div>

      <DebouncedSearchField
        urlValue={search.q ?? ""}
        isBusy={isFetching || navPending}
        onDebouncedCommit={(text) => {
          startTransition(() => {
            void navigate({
              to: ".",
              replace: true,
              search: (prev) => ({
                ...prev,
                q: text,
                offset: 0,
              }),
            })
          })
        }}
        placeholder="Search by title…"
        inputId="surveys-list-search"
      />

      {surveys.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No surveys match. Try another search or create a survey.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {surveys.map((s) => (
            <li key={s.id}>
              <Link
                to="/surveys/$surveyId"
                params={{ surveyId: s.id }}
                search={surveyDetailSearchDefaults}
                className="block px-4 py-3 text-sm font-medium hover:bg-muted/50"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <OffsetPaginationBar
        total={total}
        offset={search.offset}
        limit={search.limit}
        buildSearch={({ offset }) => ({
          q: search.q,
          offset,
          limit: search.limit,
        })}
      />
    </div>
  )
}
