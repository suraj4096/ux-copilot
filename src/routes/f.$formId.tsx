import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { PublicFormPage } from "@/components/form/public-form-page"
import { publicFormQueryOptions } from "@/lib/query-options"

export const Route = createFileRoute("/f/$formId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(publicFormQueryOptions(params.formId)),
  component: PublicFormRoute,
})

function PublicFormRoute() {
  const { formId } = Route.useParams()
  const { data } = useSuspenseQuery(publicFormQueryOptions(formId))

  if (!data.ok) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
        <p className="text-sm text-muted-foreground">This form is not available.</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <PublicFormPage formId={formId} form={data.form} />
    </div>
  )
}
