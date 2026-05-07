import { createFileRoute } from "@tanstack/react-router"

import UxAuditOrchestrator from "@/components/ux-audit/UxAuditOrchestrator"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/_protected/ux-audit/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: UxAuditOrchestrator,
})
