import { createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { DrawMermaidBoard } from "@/components/draw-mermaid-board"
import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/draw")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: DrawPage,
})

function DrawPage() {
  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col">
        <DrawMermaidBoard className="min-h-0 flex-1" />
      </div>
    </AppShell>
  )
}
