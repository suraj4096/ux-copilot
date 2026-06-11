import { createFileRoute } from "@tanstack/react-router"

import { AuditFilesPage } from "@/components/new/audit-files-page"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/_protected/new/$auditId/files")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: FilesRoute,
})

function FilesRoute() {
  const { auditId } = Route.useParams()
  return <AuditFilesPage auditId={auditId} />
}
