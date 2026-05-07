"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import type { AuditScenario, AuditStep } from "@/components/ux-audit/data"
import { ArtifactContent } from "@/components/ux-audit/artifact-panel"
import {
  SlideLayout,
  SlidePage,
  SlideSection,
} from "@/components/ux-audit/slide-containers"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function TitleSlide({ scenario }: { scenario: AuditScenario }) {
  const completedSteps = scenario.steps.filter((step) => step.status !== "ready")

  return (
    <SlidePage title="Report index" pageNo={1}>
      <div className="grid h-full min-h-0 grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="flex min-h-0 flex-col justify-center pr-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Federated UX Audit
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance">
            {scenario.projectTitle}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            {scenario.reportDescription}
          </p>
        </div>
        <div className="flex min-h-0 flex-col rounded-2xl bg-muted/20 p-4">
          <div className="mb-3 text-sm font-semibold">Report sections</div>
          <div className="min-h-0 flex-1 overflow-auto pr-1">
            <div className="space-y-2">
              {completedSteps.map((step) => (
                <div
                  key={step.id}
                  className="grid grid-cols-[2.25rem_1fr] items-center gap-3 rounded-xl bg-background px-3 py-2"
                >
                  <div className="text-sm font-semibold text-muted-foreground">
                    {step.number.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm font-medium">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlidePage>
  )
}

function StepSlide({ step }: { step: AuditStep }) {
  return (
    <SlidePage title={step.slide?.title ?? step.title} pageNo={step.number}>
      <SlideLayout config={step.slide?.layout ?? { mode: "grid", cols: 1, rows: 1, gap: "md" }}>
        {(step.slide?.sections ?? [{ title: step.artifact.title, artifact: step.artifact }]).map(
          (section, index) => (
            <SlideSection
              key={`${section.title ?? "section"}-${index}`}
              title={section.title}
              description={section.description}
            >
              <ArtifactContent artifact={section.artifact} />
            </SlideSection>
          ),
        )}
      </SlideLayout>
    </SlidePage>
  )
}

export function ReportSlideshow({
  scenario,
  open,
  onOpenChange,
}: {
  scenario: AuditScenario
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const steps = scenario.steps
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const currentStep = steps[Math.max(0, currentIndex - 1)] ?? steps[0]

  React.useEffect(() => {
    if (open) setCurrentIndex(0)
  }, [open])

  if (!open) return null

  const goPrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  const goNext = () => {
    setCurrentIndex((index) => Math.min(steps.length, index + 1))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md">
      <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">
        <div>
          <div className="text-sm font-semibold">UX Audit Report</div>
          <div className="text-xs text-muted-foreground">
            {currentIndex === 0 ? "Title page" : `${currentIndex} of ${steps.length} · ${currentStep.title}`}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
          <X className="size-4" aria-hidden />
          <span className="sr-only">Close report slideshow</span>
        </Button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto px-16 py-6">
        <Button
          variant="outline"
          size="icon-lg"
          disabled={currentIndex === 0}
          onClick={goPrevious}
          className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full"
        >
          <ChevronLeft className="size-5" aria-hidden />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          disabled={currentIndex === steps.length}
          onClick={goNext}
          className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full"
        >
          <ChevronRight className="size-5" aria-hidden />
          <span className="sr-only">Next slide</span>
        </Button>
        <div className="flex min-h-full items-center justify-center">
          {currentIndex === 0 ? <TitleSlide scenario={scenario} /> : <StepSlide step={currentStep} />}
        </div>
      </div>

      <div className="shrink-0 border-t bg-background/90 px-5 py-3">
        <div className="mx-auto flex w-fit max-w-full gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCurrentIndex(0)}
            className={cn(
              "min-w-44 rounded-xl border px-3 py-2 text-left transition-colors",
              currentIndex === 0
                ? "border-border bg-muted shadow-xs"
                : "border-border/60 bg-background hover:bg-muted/50",
            )}
          >
            <div className="text-xs font-medium text-muted-foreground">Title</div>
            <div className="mt-1 truncate text-sm font-semibold">Report index</div>
          </button>
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentIndex(index + 1)}
              className={cn(
                "min-w-44 rounded-xl border px-3 py-2 text-left transition-colors",
                index + 1 === currentIndex
                  ? "border-border bg-muted shadow-xs"
                  : "border-border/60 bg-background hover:bg-muted/50",
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">
                Slide {step.number}
              </div>
              <div className="mt-1 truncate text-sm font-semibold">{step.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
