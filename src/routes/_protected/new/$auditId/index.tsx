import { createFileRoute } from "@tanstack/react-router"

import { NewUxAuditWorkspace } from "@/components/new/NewUxAuditWorkspace"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/_protected/new/$auditId/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: AuditDetailRoute,
})

function AuditDetailRoute() {
  const { auditId } = Route.useParams()
  return <NewUxAuditWorkspace auditId={auditId} />
}
