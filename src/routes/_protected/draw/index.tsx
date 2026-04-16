import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { DrawCanvas } from "@/components/draw/draw-canvas"
import { useArtifactActions } from "@/components/artifact/artifact-actions-context"
import { drawSearchSchema } from "@/lib/router-search-schemas"
import { readAgentDrawDraft } from "@/lib/ai/client/agent-draw-storage"

export const Route = createFileRoute("/_protected/draw/")({
  validateSearch: (search: Record<string, unknown>) =>
    drawSearchSchema.parse(search),
  component: DrawRoute,
})

function DrawRoute() {
  const { setActions, clearActions } = useArtifactActions()
  const search = Route.useSearch()

  const staged = React.useMemo(() => {
    if (!search.draft) return null
    return readAgentDrawDraft(search.draft) ?? null
  }, [search.draft])

  React.useEffect(() => {
    setActions(
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-foreground">Draw</div>
        <div className="text-xs text-muted-foreground">
          Drag, edit text, create links.
        </div>
      </div>,
    )
    return () => {
      clearActions()
    }
  }, [clearActions, setActions])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DrawCanvas initialDiagram={staged} diagramKey={search.draft ?? "default"} />
    </div>
  )
}

