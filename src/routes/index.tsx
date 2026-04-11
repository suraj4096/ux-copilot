import { createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: HomePage,
})

function HomePage() {
  return (
    <AppShell>
      <div className="space-y-2">
        <h1 className="text-lg font-semibold">Welcome</h1>
        <p className="text-sm text-muted-foreground">
          Manage surveys and forms from the sidebar, or open{" "}
          <span className="text-foreground">Surveys</span> to get started.
        </p>
      </div>
    </AppShell>
  )
}
