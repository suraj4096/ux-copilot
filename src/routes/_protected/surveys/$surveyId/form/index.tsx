import * as React from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import type { FormSchema } from "@/lib/forms/types"
import { SurveyFormEditorPage } from "@/components/survey-form-editor-page"
import { FormBuilderProvider } from "@/contexts/form-builder-context"
import { readAgentFormDraft } from "@/lib/ai/client/agent-draft-storage"
import { validateFormSchema } from "@/lib/forms/validator"
import { newFormCloneQueryOptions } from "@/lib/query-options"
import { newFormSearchSchema } from "@/lib/router-search-schemas"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/_protected/surveys/$surveyId/form/")({
  validateSearch: (search: Record<string, unknown>) =>
    newFormSearchSchema.parse(search),
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
  const navigate = Route.useNavigate()
  const { data } = useSuspenseQuery(
    newFormCloneQueryOptions(surveyId, search.cloneFrom),
  )

  const [agentInitial, setAgentInitial] = React.useState<
    FormSchema | undefined
  >(undefined)
  React.useLayoutEffect(() => {
    const raw = readAgentFormDraft()
    if (raw === undefined) {
      if (search.agentDraft) {
        void navigate({
          search: (prev) => ({ ...prev, agentDraft: undefined }),
          replace: true,
        })
      }
      return
    }
    const parsed = validateFormSchema(raw)
    if (parsed.ok) {
      setAgentInitial(parsed.value)
    }
    if (search.agentDraft) {
      void navigate({
        search: (prev) => ({ ...prev, agentDraft: undefined }),
        replace: true,
      })
    }
  }, [navigate, search.agentDraft])

  const initialForm = agentInitial ?? data.initialForm ?? undefined
  const key = `${surveyId}-${search.cloneFrom ?? "new"}-${agentInitial?.id ?? "default"}`

  return (
    <FormBuilderProvider key={key} initialForm={initialForm}>
      <SurveyFormEditorPage
        surveyId={surveyId}
        cloneError={data.cloneError}
        clonedFromFormId={search.cloneFrom}
      />
    </FormBuilderProvider>
  )
}

