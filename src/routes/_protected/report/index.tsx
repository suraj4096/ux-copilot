import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { usePDF } from "react-to-pdf"
import { Download, FileText } from "lucide-react"

import { Markdown } from "@/components/markdown"
import { useArtifactActions } from "@/components/artifact/artifact-actions-context"
import { Button } from "@/components/ui/button"
import { useAgentCurrentContext } from "@/contexts/agent-context"
import { readAgentReportDraft } from "@/lib/ai/client/agent-report-storage"
import { reportSearchSchema } from "@/lib/router-search-schemas"

export const Route = createFileRoute("/_protected/report/")({
  validateSearch: (search: Record<string, unknown>) =>
    reportSearchSchema.parse(search),
  component: ReportRoute,
})

function ReportRoute() {
  const { setActions, clearActions } = useArtifactActions()
  const { setCurrentContext } = useAgentCurrentContext()
  const search = Route.useSearch()

  const staged = React.useMemo(() => {
    if (!search.draft) return null
    return readAgentReportDraft(search.draft) ?? null
  }, [search.draft])

  const fileBaseName = React.useMemo(() => {
    const raw = staged?.title?.trim() || "ux-report"
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "ux-report"
  }, [staged?.title])

  const pdfOptions = React.useMemo(
    () => ({
      filename: `${fileBaseName}.pdf`,
      method: "save" as const,
    }),
    [fileBaseName],
  )

  const { toPDF, targetRef } = usePDF(pdfOptions)

  const handleDownloadPdf = React.useCallback(() => {
    if (!staged) return
    toPDF(pdfOptions)
  }, [pdfOptions, staged, toPDF])

  const handleDownloadMarkdown = React.useCallback(() => {
    if (!staged) return
    const blob = new Blob([staged.markdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${fileBaseName}.md`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }, [fileBaseName, staged])

  React.useEffect(() => {
    setActions(
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-foreground">Report</div>
        <div className="text-xs text-muted-foreground">Markdown artifact preview.</div>
        <Button
          variant="outline"
          size="sm"
          disabled={!staged}
          onClick={handleDownloadPdf}
        >
          <Download className="size-3.5" aria-hidden />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!staged}
          onClick={handleDownloadMarkdown}
        >
          <FileText className="size-3.5" aria-hidden />
          Markdown
        </Button>
      </div>,
    )
    return () => {
      clearActions()
    }
  }, [clearActions, handleDownloadMarkdown, handleDownloadPdf, setActions, staged])

  React.useEffect(() => {
    if (!staged) {
      setCurrentContext({
        screen: "report",
        context: "No staged report is currently loaded.",
      })
      return
    }

    const lines = staged.markdown.split(/\r?\n/)
    const numberedPreview = lines
      .map((line, idx) => `${idx + 1}: ${line}`)
      .join("\n")

    setCurrentContext({
      screen: "report",
      context: [
        `Report title: ${staged.title ?? "(untitled)"}`,
        `Report total lines: ${lines.length}`,
        "Current report markdown with line numbers:",
        numberedPreview,
      ].join("\n"),
    })
  }, [staged, setCurrentContext])

  return (
    <div ref={targetRef} className="flex min-h-0 flex-1 flex-col overflow-auto">
      {staged ? (
        <div className="space-y-3">
          {staged.title ? (
            <h1 className="text-lg font-semibold text-foreground">{staged.title}</h1>
          ) : null}
          <Markdown markdown={staged.markdown} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          No report staged yet. Use Report mode in the agent to generate a UX report.
        </div>
      )}
    </div>
  )
}
