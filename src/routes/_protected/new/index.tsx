import { createFileRoute } from "@tanstack/react-router"

import { AuditListPage } from "@/components/new/audit-list-page"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/_protected/new/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: AuditListPage,
})
