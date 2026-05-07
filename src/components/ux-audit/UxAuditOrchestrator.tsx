"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, Pencil, X } from "lucide-react"

import { ArtifactPanel } from "@/components/ux-audit/artifact-panel"
import { AuditChatPanel } from "@/components/ux-audit/audit-chat-panel"
import { ConfigureAuditDialog } from "@/components/ux-audit/configure-audit-dialog"
import { ReportSlideshow } from "@/components/ux-audit/report-slideshow"
import { StepPanel } from "@/components/ux-audit/step-panel"
import { StatusChip } from "@/components/ux-audit/status-chip"
import { fetchAuditStep, fetchUxAuditScenario } from "@/components/ux-audit/data"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Skeleton } from "@/components/ui/skeleton"

function UxAuditOrchestrator() {
  const scenarioQuery = useQuery({
    queryKey: ["ux-audit", "scenario"],
    queryFn: fetchUxAuditScenario,
  })
  const scenario = scenarioQuery.data
  const [selectedStepId, setSelectedStepId] = React.useState("discovery")
  const [stepsCollapsed, setStepsCollapsed] = React.useState(false)
  const [editingTitle, setEditingTitle] = React.useState(false)
  const [reportOpen, setReportOpen] = React.useState(false)

  const stepQuery = useQuery({
    queryKey: ["ux-audit", "step", selectedStepId],
    queryFn: () => fetchAuditStep(selectedStepId),
    enabled: Boolean(scenario),
  })

  if (scenarioQuery.isLoading || !scenario) {
    return (
      <div className="grid h-full min-h-0 grid-cols-1 gap-3 p-3 lg:grid-cols-[280px_minmax(360px,0.9fr)_minmax(420px,1.1fr)]">
        <Skeleton className="h-full rounded-2xl" />
        <Skeleton className="h-full rounded-2xl" />
        <Skeleton className="h-full rounded-2xl" />
      </div>
    )
  }

  const selectedStep = stepQuery.data ?? scenario.steps.find((step) => step.id === selectedStepId) ?? scenario.steps[0]

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-linear-to-b from-background via-background to-muted/20 p-3">
      <StepPanel
        steps={scenario.steps}
        selectedStepId={selectedStepId}
        collapsed={stepsCollapsed}
        onCollapsedChange={setStepsCollapsed}
        onSelectStep={setSelectedStepId}
        onViewReport={() => setReportOpen(true)}
      />
      <div className="ml-3 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur">
          <div>
            {editingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={scenario.projectTitle}
                  readOnly
                  className="h-8 rounded-lg border bg-background px-2 text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Audit project title"
                />
                <button
                  type="button"
                  onClick={() => setEditingTitle(false)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Save title"
                >
                  <Check className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTitle(false)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Cancel title edit"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-semibold tracking-tight">{scenario.projectTitle}</h1>
                <button
                  type="button"
                  onClick={() => setEditingTitle(true)}
                  className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Edit audit project title"
                >
                  <Pencil className="size-3.5" aria-hidden />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{scenario.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {scenario.features.map((feature) => (
              <StatusChip
                key={feature.label}
                text={feature.label}
                color={feature.color}
              />
            ))}
            <ConfigureAuditDialog config={scenario.config} />
          </div>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden pt-3">
          <ResizablePanelGroup>
            <ResizablePanel defaultSize={44} minSize={30} className="min-h-0">
              <AuditChatPanel step={selectedStep} isLoading={stepQuery.isFetching} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={56} minSize={34} className="min-h-0">
              <ArtifactPanel
                step={selectedStep}
                isLoading={stepQuery.isFetching}
                onViewReport={() => setReportOpen(true)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      <ReportSlideshow
        scenario={scenario}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </div>
  )
}

export { UxAuditOrchestrator }
export default UxAuditOrchestrator
