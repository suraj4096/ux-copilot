"use client"

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  FileText,
  Info,
} from "lucide-react"

import type { AuditStep } from "@/components/ux-audit/data"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function statusIcon(status: AuditStep["status"]) {
  if (status === "generated") return CheckCircle2
  if (status === "review") return CircleDot
  return Clock3
}

function progressColor(status: AuditStep["status"]): string {
  if (status === "generated") return "bg-chart-2"
  if (status === "review") return "bg-chart-4"
  return "bg-chart-5"
}

function collapsedMarkerColor(status: AuditStep["status"]): string {
  if (status === "generated") return "before:bg-chart-2"
  if (status === "review") return "before:bg-chart-4"
  return "before:bg-chart-5"
}

export function StepPanel({
  steps,
  selectedStepId,
  collapsed,
  onCollapsedChange,
  onSelectStep,
  onViewReport,
}: {
  steps: Array<AuditStep>
  selectedStepId: string
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onSelectStep: (stepId: string) => void
  onViewReport: () => void
}) {
  return (
    <aside
      className={cn(
        "flex min-h-0 shrink-0 flex-col overflow-hidden border-r bg-muted/35 shadow-xs transition-[width] duration-200",
        collapsed ? "w-16" : "w-[280px]",
      )}
    >
      <div
        className={cn(
          "border-b bg-muted/50 p-3",
          collapsed ? "flex justify-center" : "space-y-1",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          {collapsed ? null : (
            <div>
              <div className="text-lg font-semibold tracking-tight">NeoUX Auditor</div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => onCollapsedChange(!collapsed)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={collapsed ? "Expand audit steps" : "Collapse audit steps"}
            >
              {collapsed ? (
                <ChevronRight className="size-4" aria-hidden />
              ) : (
                <ChevronLeft className="size-4" aria-hidden />
              )}
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expand steps" : "Collapse steps"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <div className="space-y-2">
          {steps.map((step) => {
            const selected = step.id === selectedStepId
            const Icon = statusIcon(step.status)

            if (collapsed) {
              return (
                <Tooltip key={step.id}>
                  <TooltipTrigger
                    type="button"
                    onClick={() => onSelectStep(step.id)}
                    className={cn(
                      "relative flex size-11 items-center justify-center overflow-hidden rounded-xl rounded-l-none border transition-colors before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-1 before:rounded-r-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      collapsedMarkerColor(step.status),
                      selected
                        ? "border-border bg-background shadow-xs"
                        : "border-border/45 bg-muted/60 hover:bg-muted",
                    )}
                    aria-label={`Step ${step.number}: ${step.title}`}
                  >
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full text-sm font-semibold",
                        selected
                          ? "bg-foreground text-background"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.number}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start">
                    <div className="font-medium">
                      Step {step.number}: {step.title}
                    </div>
                    <div className="mt-1 max-w-64 text-[11px] text-background/75">
                      {step.description}
                    </div>
                    <div className="mt-1 text-[11px] text-background/75">
                      {step.status} · {step.progress}%
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <div
                key={step.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectStep(step.id)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return
                  event.preventDefault()
                  onSelectStep(step.id)
                }}
                className={cn(
                  "w-full cursor-pointer p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  selected
                    ? "rounded-xl border border-border bg-background shadow-xs"
                    : "rounded-xl border border-border/45 hover:bg-background/70",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {step.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-1.5">
                        <div className="truncate text-sm font-medium" title={step.description}>
                          {step.title}
                        </div>
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label={`${step.title} details`}
                          >
                            <Info className="size-3.5" aria-hidden />
                          </TooltipTrigger>
                          <TooltipContent side="right" align="start" className="max-w-72">
                            {step.description}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", progressColor(step.status))}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[10px] text-muted-foreground">
                        {step.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="shrink-0 border-t p-2">
        <button
          type="button"
          onClick={onViewReport}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            collapsed && "size-11 px-0 py-0",
          )}
          aria-label="View report"
        >
          <FileText className="size-4" aria-hidden />
          {collapsed ? null : <span>View report</span>}
        </button>
      </div>
    </aside>
  )
}
