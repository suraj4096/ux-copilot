import { createFileRoute } from "@tanstack/react-router"

import { AuditSettingsPage } from "@/components/new/audit-settings-page"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/_protected/new/$auditId/settings")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: SettingsRoute,
})

function SettingsRoute() {
  const { auditId } = Route.useParams()
  return <AuditSettingsPage auditId={auditId} />
}
