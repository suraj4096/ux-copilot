"use client"

import { Download, Eye, Presentation } from "lucide-react"

import type { AuditArtifact, AuditStep } from "@/components/ux-audit/data"
import {
  AuditBarChart,
  AuditPieChart,
  FeatureComparisonTable,
  FlowDiagram,
  ProsConsTable,
} from "@/components/ux-audit/infographic-components"
import {
  SlideLayout,
  SlidePage,
  SlideSection,
} from "@/components/ux-audit/slide-containers"
import { StatusChip } from "@/components/ux-audit/status-chip"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function cardGridClass(columns?: 2 | 4) {
  return columns === 2 ? "grid gap-2 sm:grid-cols-2" : "grid gap-2 sm:grid-cols-4"
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }).map((_, index) => (
        <span key={index} className={index < score ? "h-2 flex-1 bg-chart-5" : "h-2 flex-1 bg-muted"} />
      ))}
    </div>
  )
}

export function ArtifactContent({ artifact }: { artifact: AuditArtifact }) {
  if (artifact.type === "flowDiagram") {
    return <FlowDiagram artifact={artifact} />
  }

  if (artifact.type === "prosCons") {
    return <ProsConsTable artifact={artifact} />
  }

  if (artifact.type === "featureComparison") {
    return <FeatureComparisonTable artifact={artifact} />
  }

  if (artifact.type === "barChart") {
    return <AuditBarChart artifact={artifact} />
  }

  if (artifact.type === "pieChart") {
    return <AuditPieChart artifact={artifact} />
  }

  if (artifact.type === "brief") {
    return (
      <div className="space-y-4">
        {artifact.summary ? (
          <div className="space-y-1 text-sm leading-relaxed text-muted-foreground">
            {artifact.summary.split("\n").map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        <div className={cardGridClass(artifact.columns)}>
          {artifact.cards.map((card, index) => (
            <div
              key={card.label}
              className={( ["bg-chart-1/10", "bg-chart-2/10", "bg-chart-4/15", "bg-chart-5/15"] )[index % 4] + " rounded-xl p-2.5"}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 truncate whitespace-nowrap text-sm font-semibold leading-tight">{card.label}</div>
                {card.tag ? (
                  <StatusChip
                    text={card.tag}
                    color={card.tag.toLowerCase() === "critical" ? "chart5" : "chart4"}
                  />
                ) : null}
              </div>
              {card.value ? <div className="mt-1 text-sm font-medium tracking-tight">{card.value}</div> : null}
              {card.detail ? <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{card.detail}</p> : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (artifact.type === "persona") {
    return (
      <div className="grid gap-3">
        {artifact.personas.map((persona) => (
          <div key={persona.name} className="border-y bg-card px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight">{persona.name}</div>
                <div className="text-[11px] text-muted-foreground">{persona.segment}</div>
              </div>
              <StatusChip text="Persona" color="chart4" />
            </div>
            <div className="mt-2 grid gap-2 text-[11px] leading-4 sm:grid-cols-3">
              <div><span className="text-muted-foreground">Goal: </span>{persona.goal}</div>
              <div><span className="text-muted-foreground">Pain: </span>{persona.pain}</div>
              <div><span className="text-muted-foreground">Opportunity: </span>{persona.opportunity}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (artifact.type === "journey") {
    return (
      <div className="space-y-3">
        {artifact.stages.map((stage) => (
          <div key={stage.name} className="bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{stage.name}</div>
              <div className="text-sm font-semibold">{stage.emotion}/100</div>
            </div>
            <div className="mt-3 h-2 overflow-hidden bg-muted"><div className="h-full bg-chart-1" style={{ width: `${stage.emotion}%` }} /></div>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><span className="text-muted-foreground">Issue: </span>{stage.issue}</div>
              <div><span className="text-muted-foreground">Fix: </span>{stage.fix}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (artifact.type === "table") {
    return (
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-chart-3/10">
            <tr>{artifact.columns.map((column) => <th key={column} className="px-3 py-2 text-left font-medium">{column}</th>)}</tr>
          </thead>
          <tbody>
            {artifact.rows.map((row, index) => (
              <tr key={index} className="border-t">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3 align-top text-muted-foreground first:text-foreground">{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (artifact.type === "swot") {
    const groups = [
      ["Strengths", artifact.strengths],
      ["Weaknesses", artifact.weaknesses],
      ["Opportunities", artifact.opportunities],
      ["Threats", artifact.threats],
    ] as const
    return <div className="grid gap-3 sm:grid-cols-2">{groups.map(([title, items], index) => <div key={title} className="bg-card p-4"><StatusChip text={title} color={(["chart2", "chart5", "chart1", "chart4"] as const)[index]} /><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>)}</div>
  }

  if (artifact.type === "benchmark") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-[140px_repeat(5,1fr)] gap-2 text-xs font-medium text-muted-foreground">
          <div>Dimension</div>{artifact.competitors.map((competitor) => <div key={competitor} className="truncate text-center">{competitor}</div>)}
        </div>
        {artifact.rows.map((row) => (
          <div key={row.area} className="bg-card p-3">
            <div className="grid grid-cols-[140px_repeat(5,1fr)] gap-2 items-center">
              <div className="text-sm font-medium">{row.area}</div>
              {row.scores.map((score, index) => <div key={index} className="text-center text-sm font-semibold">{score}</div>)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{row.note}</p>
          </div>
        ))}
      </div>
    )
  }

  if (artifact.type === "risk") {
    return <div className="grid gap-3">{artifact.risks.map((risk) => <div key={risk.risk} className="bg-card p-4"><div className="flex items-start justify-between gap-4"><div className="font-medium">{risk.risk}</div><StatusChip text={`Score ${risk.impact * risk.likelihood}`} color="chart5" /></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><div><div className="mb-1 text-xs text-muted-foreground">Impact</div><ScoreDots score={risk.impact} /></div><div><div className="mb-1 text-xs text-muted-foreground">Likelihood</div><ScoreDots score={risk.likelihood} /></div></div><p className="mt-3 text-sm text-muted-foreground">{risk.mitigation}</p></div>)}</div>
  }

  return <div className="grid gap-3">{artifact.recommendations.map((item) => <div key={item.title} className="bg-card p-4"><div className="flex items-center justify-between gap-3"><div className="font-semibold">{item.title}</div><StatusChip text={item.priority} color={item.priority === "P0" ? "chart1" : "chart2"} /></div><p className="mt-2 text-sm text-muted-foreground">{item.impact}</p></div>)}</div>
}

export function ArtifactPanel({
  step,
  isLoading,
  onViewReport,
}: {
  step: AuditStep
  isLoading?: boolean
  onViewReport: () => void
}) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-background shadow-xs">
      <div className="flex items-center justify-between border-b bg-background/80 px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold"><Presentation className="size-4 text-chart-3" aria-hidden /> Step {step.number}: {step.title}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onViewReport}><Eye className="size-3.5" aria-hidden /> View report</Button>
          <Button variant="outline" size="sm"><Download className="size-3.5" aria-hidden /> PDF</Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="mx-auto max-w-6xl space-y-3">
            <Skeleton className="aspect-video rounded-2xl" />
          </div>
        ) : (
          <SlidePage title={step.slide?.title ?? step.title} pageNo={step.number}>
            <SlideLayout
              config={step.slide?.layout ?? { mode: "grid", cols: 1, rows: 1, gap: "md" }}
            >
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
        )}
      </div>
    </section>
  )
}
