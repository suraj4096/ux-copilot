import { createFileRoute, Link } from "@tanstack/react-router"
import { ClipboardList, PenLine } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { surveysListSearchDefaults } from "@/lib/router-search-defaults"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: HomePage,
})

function HomePage() {
  return (
    <AppShell mode="home">
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Choose a mode</h1>
          <p className="text-sm text-muted-foreground">
            Each mode uses its own assistant. You can switch anytime from the
            rail.
          </p>
        </div>
        <div className="grid min-h-0 flex-1 gap-4 sm:grid-cols-2 sm:items-stretch">
          <Link
            to="/surveys"
            search={surveysListSearchDefaults}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/30"
          >
            <ClipboardList
              className="size-10 shrink-0 text-primary"
              aria-hidden
            />
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Survey mode</h2>
              <p className="text-sm text-muted-foreground">
                Surveys, forms, and responses with a dedicated agent.
              </p>
            </div>
          </Link>
          <Link
            to="/draw"
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/30"
          >
            <PenLine className="size-10 shrink-0 text-primary" aria-hidden />
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Draw mode</h2>
              <p className="text-sm text-muted-foreground">
                Diagrams and drawing with a separate agent.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
