import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import * as go from "gojs"
import { Download } from "lucide-react"

import { DrawCanvas } from "@/components/draw/draw-canvas"
import { useArtifactActions } from "@/components/artifact/artifact-actions-context"
import { Button } from "@/components/ui/button"
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
  const [diagram, setDiagram] = React.useState<go.Diagram | null>(null)

  const staged = React.useMemo(() => {
    if (!search.draft) return null
    return readAgentDrawDraft(search.draft) ?? null
  }, [search.draft])

  React.useEffect(() => {
    const handleSavePng = () => {
      if (!diagram) return

      const imageData = diagram.makeImageData({
        type: "image/png",
        returnType: "string",
      })

      if (typeof imageData !== "string") return

      const blob = dataUrlToBlob(imageData)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `${search.draft ?? "draw"}.png`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    }

    setActions(
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-foreground">Draw</div>
        <div className="text-xs text-muted-foreground">
          Drag, edit text, create links.
        </div>
        <Button variant="outline" size="sm" disabled={!diagram} onClick={handleSavePng}>
          <Download className="size-3.5" aria-hidden />
          Save PNG
        </Button>
      </div>,
    )
    return () => {
      clearActions()
    }
  }, [clearActions, diagram, search.draft, setActions])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DrawCanvas
        initialDiagram={staged}
        diagramKey={search.draft ?? "default"}
        onDiagramReady={setDiagram}
      />
    </div>
  )
}

function dataUrlToBlob(dataUrl: string) {
  const [header, encoded] = dataUrl.split(",")
  const mimeTypeMatch = /^data:([^;]+);base64$/.exec(header ?? "")
  const mimeType = mimeTypeMatch?.[1] ?? "image/png"
  const binary = atob(encoded ?? "")
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: mimeType })
}

