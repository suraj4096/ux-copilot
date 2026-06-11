"use client"

import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  ChevronDown,
  ChevronsLeftRight,
  Download,
  FileText,
  MessageSquare,
  Pencil,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react"
import type { FileUIPart } from "ai"

import type { AuditChatMessage, AuditStep, AuditToolCall } from "@/components/ux-audit/data"
import { AgentInput } from "@/components/agent/agent-input"
import { EditSlideDialog } from "@/components/new/edit-slide-dialog"
import { useNewShellSidecar } from "@/components/new/new-shell-context"
import {
  Sidebar2SidecarContent,
  Sidebar2SidecarFooter,
  Sidebar2SidecarHeader,
} from "@/components/new/sidebar2"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { ArtifactContent } from "@/components/ux-audit/artifact-panel"
import { ReportSlideshow } from "@/components/ux-audit/report-slideshow"
import { auditApi } from "@/lib/audit-api"
import {
  SlideLayout,
  SlidePage,
  SlideSection,
} from "@/components/ux-audit/slide-containers"
import { cn } from "@/lib/utils"

function ToolCallRow({ tool, active }: { tool: AuditToolCall; active?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const Icon = tool.name.includes("search")
    ? Search
    : tool.name.includes("generate")
      ? Sparkles
      : Wrench

  return (
    <div className="rounded-xl border bg-background/75 p-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 text-left text-xs text-muted-foreground"
      >
        <Icon className={cn("size-3.5", active && "animate-pulse text-chart-3")} aria-hidden />
        <span className={cn("min-w-0 flex-1 truncate", active && "agent-tool-name-shimmer")}>{tool.label}</span>
        {active ? <Spinner className="size-3" /> : <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />}
      </button>
      {open && !active ? <p className="mt-2 text-xs leading-5 text-foreground/85">{tool.output}</p> : null}
    </div>
  )
}

function ChatMessage({ message, loading }: { message: AuditChatMessage; loading?: boolean }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] rounded-xl px-4 py-3 text-sm leading-6",
          isUser ? "border border-primary/20 bg-primary/10 text-foreground" : "border border-border bg-card text-foreground",
        )}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
        {message.files?.length ? (
          <div className="mt-3 grid gap-2">
            {message.files.map((file) => (
              <div key={file.name} className="flex items-center gap-2 rounded-xl border bg-background/80 px-2 py-1.5 text-foreground">
                <FileText className="size-3.5 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{file.name}</div>
                  <div className="text-[10px] text-muted-foreground">{file.type} · {file.size}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {message.tools?.length ? (
          <div className="mt-3 grid gap-2">
            {message.tools.map((tool, index) => (
              <ToolCallRow key={tool.id} tool={tool} active={loading && index === message.tools!.length - 1} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function NewChatPanel({ step, auditId, isLoading }: { step: AuditStep; auditId: string; isLoading?: boolean }) {
  const [draft, setDraft] = React.useState("Generate the next audit slide and show evidence used.")
  const [files, setFiles] = React.useState<Array<FileUIPart>>([])
  const navigate = useNavigate()

  const handleFilesChange = React.useCallback(
    (nextFiles: Array<FileUIPart>) => {
      const addedFiles = nextFiles.length > files.length
      setFiles(nextFiles)
      if (addedFiles) {
        void navigate({ to: "/new/$auditId/files", params: { auditId } })
      }
    },
    [auditId, files.length, navigate],
  )

  return (
    <section className="flex size-full min-h-0 flex-col overflow-hidden bg-background">
      <Sidebar2SidecarHeader className="h-14 justify-center border-b px-3 py-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="size-4 text-chart-3" aria-hidden /> Audit chat
            </div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">Step {step.number}: {step.title}</div>
          </div>
          <div className="w-16 shrink-0" />
        </div>
      </Sidebar2SidecarHeader>

      <Sidebar2SidecarContent className="px-3 py-4">
        <div className="space-y-4">
          {step.chat.map((message, index) => (
            <ChatMessage key={message.id} message={message} loading={isLoading && index === step.chat.length - 1} />
          ))}
          {isLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2 text-xs text-muted-foreground">
              <Spinner className="size-3.5" /> Updating audit canvas…
            </div>
          ) : null}
        </div>
      </Sidebar2SidecarContent>

      <Sidebar2SidecarFooter className="border-t bg-background/90 p-3 backdrop-blur">
        <AgentInput
          value={draft}
          onChange={setDraft}
          files={files}
          onFilesChange={handleFilesChange}
          onSubmit={() => setDraft("Generate the next audit slide and show evidence used.")}
          isDisabled={!draft.trim() && files.length === 0}
        />
      </Sidebar2SidecarFooter>
    </section>
  )
}

function MiniArtifactPreview({ step }: { step: AuditStep }) {
  const sections = step.slide?.sections ?? [{ title: step.artifact.title, artifact: step.artifact }]
  const primaryArtifact = sections[0]?.artifact ?? step.artifact

  if (primaryArtifact.type === "barChart") {
    return (
      <div className="flex h-full items-end gap-1 px-1 pt-4">
        {primaryArtifact.data.slice(0, 5).map((item, index) => {
          const value = Number(item[primaryArtifact.series[0]?.key ?? ""] ?? 40)
          return <div key={index} className="flex-1 rounded-t bg-chart-1/70" style={{ height: `${Math.max(18, Math.min(90, value))}%` }} />
        })}
      </div>
    )
  }

  if (primaryArtifact.type === "pieChart") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-12 rounded-full border-[10px] border-chart-1 border-r-chart-2 border-b-chart-4 bg-background" />
      </div>
    )
  }

  if (primaryArtifact.type === "flowDiagram") {
    return (
      <div className="flex h-full flex-col justify-center gap-1.5 px-5">
        {primaryArtifact.nodes.slice(0, 4).map((node) => (
          <div key={node.id} className="mx-auto h-3 w-full rounded-full bg-chart-3/25 ring-1 ring-chart-3/30" />
        ))}
      </div>
    )
  }

  if (primaryArtifact.type === "persona" || primaryArtifact.type === "summary") {
    const count = primaryArtifact.type === "persona" ? primaryArtifact.personas.length : primaryArtifact.recommendations.length
    return (
      <div className="grid h-full content-center gap-1.5 p-3">
        {Array.from({ length: Math.min(3, count) }).map((_, index) => (
          <div key={index} className="h-4 rounded-md bg-chart-4/20 ring-1 ring-chart-4/25" />
        ))}
      </div>
    )
  }

  if (primaryArtifact.type === "featureComparison" || primaryArtifact.type === "table" || primaryArtifact.type === "prosCons") {
    return (
      <div className="grid h-full grid-cols-2 gap-1 p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-sm bg-muted-foreground/15" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid h-full content-center gap-1.5 p-3">
      {sections.slice(0, 3).map((section, index) => (
        <div key={`${section.title ?? "section"}-${index}`} className="rounded-md bg-muted-foreground/15 p-1.5">
          <div className="h-1.5 w-2/3 rounded-full bg-foreground/20" />
          <div className="mt-1 h-1.5 w-full rounded-full bg-foreground/10" />
        </div>
      ))}
    </div>
  )
}

function StepThumbnail({
  step,
  selected,
  onSelect,
}: {
  step: AuditStep
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group grid w-full grid-cols-[2rem_1fr] gap-2 rounded-xl border p-2 text-left transition-colors",
        selected ? "border-primary bg-primary/5 shadow-xs" : "border-border/70 bg-background hover:bg-muted/50",
      )}
    >
      <div className="pt-1 text-center text-xs font-semibold text-muted-foreground">{step.number}</div>
      <div className="min-w-0">
        <div className="aspect-video overflow-hidden rounded-lg border bg-background shadow-xs">
          <div className="h-full p-2">
            <div className="h-full rounded bg-muted/25">
              <MiniArtifactPreview step={step} />
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn("size-1.5 shrink-0 rounded-full", step.status === "generated" ? "bg-chart-2" : step.status === "review" ? "bg-chart-4" : "bg-chart-5")} />
          <span className="truncate text-xs font-medium">{step.title}</span>
        </div>
      </div>
    </button>
  )
}

function AuditCanvas({ step, isLoading }: { step: AuditStep; isLoading?: boolean }) {
  if (isLoading) {
    return <Skeleton className="aspect-video w-full max-w-6xl rounded-2xl" />
  }

  return (
    <SlidePage title={step.slide?.title ?? step.title} pageNo={step.number}>
      <SlideLayout config={step.slide?.layout ?? { mode: "grid", cols: 1, rows: 1, gap: "md" }}>
        {(step.slide?.sections ?? [{ title: step.artifact.title, artifact: step.artifact }]).map((section, index) => (
          <SlideSection key={`${section.title ?? "section"}-${index}`} title={section.title} description={section.description}>
            <ArtifactContent artifact={section.artifact} />
          </SlideSection>
        ))}
      </SlideLayout>
    </SlidePage>
  )
}

function WorkspaceContent({ auditId }: { auditId: string }) {
  const auditQuery = useQuery({
    queryKey: ["audit", auditId],
    queryFn: () => auditApi.getAudit(auditId),
  })
  const scenario = auditQuery.data
  const [selectedStepId, setSelectedStepId] = React.useState("discovery")
  const [reportOpen, setReportOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [localSteps, setLocalSteps] = React.useState<Array<AuditStep>>([])

  React.useEffect(() => {
    if (scenario) setLocalSteps(structuredClone(scenario.steps))
  }, [scenario])

  const steps = localSteps.length ? localSteps : scenario?.steps ?? []
  const selectedStep: AuditStep | undefined = steps.find((step) => step.id === selectedStepId) ?? steps.at(0)
  const sidecarContent = React.useMemo(
    () => selectedStep ? <NewChatPanel step={selectedStep} auditId={auditId} isLoading={auditQuery.isFetching} /> : null,
    [auditId, auditQuery.isFetching, selectedStep],
  )
  useNewShellSidecar(sidecarContent)

  if (auditQuery.isLoading || !scenario || !selectedStep) {
    return (
      <div className="flex h-full min-h-0 gap-3 bg-sidebar p-2">
        <Skeleton className="h-full w-12 rounded-2xl" />
        <Skeleton className="h-full flex-1 rounded-2xl" />
      </div>
    )
  }

  return (
        <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
          <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-r bg-background">
            <div className="flex h-14 shrink-0 items-center border-b px-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Audit slides</div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              <div className="space-y-2">
                {steps.map((step) => (
                  <StepThumbnail
                    key={step.id}
                    step={step}
                    selected={step.id === selectedStepId}
                    onSelect={() => setSelectedStepId(step.id)}
                  />
                ))}
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f7f8] dark:bg-background">
            <div className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="size-4 text-chart-2" aria-hidden />
                <span className="truncate text-sm font-medium">Step {selectedStep.number}: {selectedStep.title}</span>
                <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">{selectedStep.progress}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="size-3.5" aria-hidden /> Edit slide</Button>
                <Button variant="outline" size="sm"><Download className="size-3.5" aria-hidden /> Export</Button>
                <Button size="sm" onClick={() => setReportOpen(true)}><ChevronsLeftRight className="size-3.5" aria-hidden /> View report</Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-8">
              <div className="flex min-h-full items-center justify-center">
                <AuditCanvas step={selectedStep} isLoading={auditQuery.isFetching} />
              </div>
            </div>
          </main>
          <ReportSlideshow scenario={{ ...scenario, steps }} open={reportOpen} onOpenChange={setReportOpen} />
          <EditSlideDialog
            step={selectedStep}
            open={editOpen}
            onOpenChange={setEditOpen}
            onSave={(updatedStep) => {
              setLocalSteps((current) => current.map((step) => step.id === updatedStep.id ? updatedStep : step))
            }}
          />
        </div>
  )
}

export function NewUxAuditWorkspace({ auditId }: { auditId: string }) {
  return <WorkspaceContent auditId={auditId} />
}

export default NewUxAuditWorkspace
