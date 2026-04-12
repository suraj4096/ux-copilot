"use client"

import * as React from "react"
import { Code2, Download, Workflow } from "lucide-react"

import {
  useAgentChat,
  useDrawDiagramHistoryOptional,
} from "@/contexts/agent-chat-context"
import { DrawGenerationPillButton } from "@/components/draw-generation-pill"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

let mermaidInit = false

function downloadSvgElementAsPng(svgEl: SVGElement, filename: string) {
  const serializer = new XMLSerializer()
  const clone = svgEl.cloneNode(true) as SVGElement
  const vb = svgEl.viewBox?.baseVal
  const rect = svgEl.getBoundingClientRect()
  let w = svgEl.width?.baseVal?.value ?? 0
  let h = svgEl.height?.baseVal?.value ?? 0
  if (!w || !h) {
    try {
      const bb = svgEl.getBBox()
      w = bb.width || rect.width
      h = bb.height || rect.height
    } catch {
      w = rect.width
      h = rect.height
    }
  }
  if (vb?.width && vb?.height) {
    w = w || vb.width
    h = h || vb.height
  }
  w = Math.max(1, Math.round(w))
  h = Math.max(1, Math.round(h))

  clone.setAttribute("width", String(w))
  clone.setAttribute("height", String(h))
  if (vb && !clone.getAttribute("viewBox")) {
    clone.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.width} ${vb.height}`)
  }

  let source = serializer.serializeToString(clone)
  if (!source.startsWith("<?xml")) {
    source = `<?xml version="1.0" encoding="UTF-8"?>\n${source}`
  }

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`

  return new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement("canvas")
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not create canvas"))
        return
      }
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not build PNG"))
            return
          }
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = filename
          a.click()
          URL.revokeObjectURL(url)
          resolve()
        },
        "image/png",
        1,
      )
    }
    img.onerror = () => reject(new Error("Could not rasterize SVG"))
    img.src = dataUrl
  })
}

type DrawDiagramHistory = NonNullable<
  ReturnType<typeof useDrawDiagramHistoryOptional>
>

function DrawMermaidBoardImpl({
  className,
  diagramHistory,
}: {
  className?: string
  diagramHistory: DrawDiagramHistory
}) {
  const { status } = useAgentChat()
  const {
    generations,
    selectedGenerationId,
    setSelectedGenerationId,
    displayedMermaid,
  } = diagramHistory
  const definition = displayedMermaid

  const hostRef = React.useRef<HTMLDivElement>(null)
  const [renderError, setRenderError] = React.useState<string | null>(null)
  const [codeOpen, setCodeOpen] = React.useState(false)
  const [exportBusy, setExportBusy] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const canUseDiagram = Boolean(definition) && !renderError

  React.useEffect(() => {
    setActionError(null)
  }, [definition])

  async function onExportPng() {
    const host = hostRef.current
    const svg = host?.querySelector("svg")
    if (!svg) {
      setActionError("Nothing to export yet.")
      return
    }
    setActionError(null)
    setExportBusy(true)
    try {
      await downloadSvgElementAsPng(svg, "user-flow-diagram.png")
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Export failed. Try again.",
      )
    } finally {
      setExportBusy(false)
    }
  }

  React.useEffect(() => {
    if (!definition) {
      setRenderError(null)
      if (hostRef.current) hostRef.current.innerHTML = ""
      return
    }

    let cancelled = false
    setRenderError(null)

    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default
        if (!mermaidInit) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "neutral",
          })
          mermaidInit = true
        }
        const id = `draw-mermaid-${Math.random().toString(36).slice(2, 11)}`
        const { svg } = await mermaid.render(id, definition)
        if (cancelled || !hostRef.current) return
        hostRef.current.innerHTML = svg
      } catch (e) {
        if (!cancelled) {
          setRenderError(
            e instanceof Error ? e.message : "Could not render diagram",
          )
          if (hostRef.current) hostRef.current.innerHTML = ""
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [definition])

  const busy = status === "streaming" || status === "submitted"
  const latestGenerationId = generations.at(-1)?.id ?? null

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card",
        className,
      )}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-border px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">User flow diagram</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!canUseDiagram || exportBusy}
              onClick={() => void onExportPng()}
            >
              <Download className="size-3.5" aria-hidden />
              {exportBusy ? "Exporting…" : "Export PNG"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!definition}
              onClick={() => setCodeOpen(true)}
            >
              <Code2 className="size-3.5" aria-hidden />
              View code
            </Button>
          </div>
        </div>
        {generations.length > 0 ? (
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="toolbar"
            aria-label="Diagram revisions"
          >
            {generations.map((g) => {
              const isLatest = g.id === latestGenerationId
              const isActive =
                selectedGenerationId === g.id ||
                (selectedGenerationId === null && isLatest)
              return (
                <DrawGenerationPillButton
                  key={g.id}
                  generationId={g.id}
                  isLatest={isLatest}
                  active={isActive}
                  onClick={() =>
                    setSelectedGenerationId(isLatest ? null : g.id)
                  }
                />
              )
            })}
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!definition && !busy ? (
          <p className="text-sm text-muted-foreground">
            Describe a user story or flow in the assistant. A diagram will
            appear here.
          </p>
        ) : null}
        {busy && !definition ? (
          <p className="text-sm text-muted-foreground">Generating diagram…</p>
        ) : null}
        {renderError ? (
          <p className="text-sm text-destructive" role="alert">
            {renderError}
          </p>
        ) : null}
        {actionError ? (
          <p className="text-sm text-destructive" role="alert">
            {actionError}
          </p>
        ) : null}
        <div
          ref={hostRef}
          className={cn(
            "mermaid-host [&_svg]:max-h-none [&_svg]:max-w-full",
            !definition && "hidden",
          )}
        />
      </div>

      <Dialog open={codeOpen} onOpenChange={setCodeOpen}>
        <DialogContent
          className="flex max-h-[min(90dvh,40rem)] max-w-[calc(100%-2rem)] flex-col gap-3 sm:max-w-2xl"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>Mermaid source</DialogTitle>
            <DialogDescription>
              Mermaid source for the diagram you are viewing (selected
              revision).
            </DialogDescription>
          </DialogHeader>
          <pre className="min-h-0 flex-1 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap break-all text-foreground">
            {definition ?? ""}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function DrawMermaidBoard({ className }: { className?: string }) {
  const diagramHistory = useDrawDiagramHistoryOptional()

  if (!diagramHistory) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card",
          className,
        )}
        aria-hidden
      />
    )
  }

  return (
    <DrawMermaidBoardImpl
      className={className}
      diagramHistory={diagramHistory}
    />
  )
}
