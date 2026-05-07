"use client"

import { Check, GitBranch, X } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type {
  AuditBarChartArtifact,
  AuditFeatureComparisonArtifact,
  AuditFlowDiagramArtifact,
  AuditPieChartArtifact,
  AuditProsConsArtifact,
} from "@/components/ux-audit/data"

const toneClass = {
  neutral: "bg-background text-foreground",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  error: "bg-red-500/10 text-red-700 dark:text-red-300",
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function FlowDiagram({ artifact }: { artifact: AuditFlowDiagramArtifact }) {
  const nodeById = new Map(artifact.nodes.map((node) => [node.id, node]))
  const vertical = artifact.orientation === "vertical"

  return (
    <div className="bg-card p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <GitBranch className="size-4 text-muted-foreground" aria-hidden />
        {artifact.title}
      </div>
      <div className={vertical ? "min-h-80 space-y-3 py-4" : "min-h-52 overflow-auto py-6"}>
        <div className={vertical ? "mx-auto flex max-w-xs flex-col items-stretch" : "flex min-w-max items-center"}>
          {artifact.nodes.map((node, index) => {
            const outgoing = artifact.edges.filter((edge) => edge.from === node.id)
            const nextEdge = outgoing.find((edge) => artifact.nodes[index + 1]?.id === edge.to)
            const nodeClass = toneClass[node.tone ?? "neutral"]

            return (
              <div key={node.id} className={vertical ? "flex flex-col items-center" : "flex items-center"}>
                <div
                  className={
                    node.kind === "decision"
                      ? `flex min-h-14 min-w-14 rotate-45 items-center justify-center ${nodeClass}`
                      : `flex min-h-11 min-w-28 items-center justify-center px-3 py-2 text-center ${nodeClass}`
                  }
                >
                  <span className={node.kind === "decision" ? "max-w-14 -rotate-45 text-center text-[10px] font-medium leading-tight" : "text-xs font-medium"}>
                    {node.label}
                  </span>
                </div>
                {index < artifact.nodes.length - 1 ? (
                  <div className={vertical ? "flex h-9 flex-col items-center justify-center" : "flex w-12 items-center justify-center"}>
                    {nextEdge?.label ? (
                      <span className={vertical ? "mb-1 text-[9px] text-muted-foreground" : "absolute -mt-6 text-[9px] text-muted-foreground"}>
                        {nextEdge.label}
                      </span>
                    ) : null}
                    <div className={vertical ? "h-7 w-px bg-border" : "h-px w-9 bg-border"} />
                    <div className={vertical ? "size-2 rotate-45 border-r border-b border-border" : "size-2 rotate-45 border-t border-r border-border"} />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
      {artifact.edges.some((edge) => !nodeById.has(edge.from) || !nodeById.has(edge.to)) ? (
        <p className="mt-3 text-xs text-destructive">Some flow connections reference missing nodes.</p>
      ) : null}
    </div>
  )
}

export function ProsConsTable({ artifact }: { artifact: AuditProsConsArtifact }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="overflow-hidden bg-card">
        <div className="bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          {artifact.positiveHeader}
        </div>
        <div className="divide-y">
          {artifact.positiveRows.map((row) => (
            <div key={row} className="flex items-start gap-3 px-4 py-3 text-sm">
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Check className="size-3.5" aria-hidden />
              </span>
              <span>{row}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden bg-card">
        <div className="bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
          {artifact.negativeHeader}
        </div>
        <div className="divide-y">
          {artifact.negativeRows.map((row) => (
            <div key={row} className="flex items-start gap-3 px-4 py-3 text-sm">
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-700 dark:text-red-300">
                <X className="size-3.5" aria-hidden />
              </span>
              <span>{row}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FeatureComparisonTable({
  artifact,
}: {
  artifact: AuditFeatureComparisonArtifact
}) {
  return (
    <div className="overflow-auto bg-card">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="w-48 px-3 py-3 text-left font-medium text-muted-foreground" />
            {artifact.entities.map((entity) => (
              <th key={entity} className="px-3 py-3 text-left font-medium">
                {entity}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {artifact.rows.map((row) => (
            <tr key={row.feature} className="border-t">
              <td className="px-3 py-3 font-medium">{row.feature}</td>
              {row.cells.map((cell, index) => (
                <td key={`${row.feature}-${artifact.entities[index]}`} className="px-3 py-3 text-muted-foreground">
                  {cell === true ? (
                    <Check className="size-4 text-emerald-600" aria-label="Available" />
                  ) : cell === false || cell === "-" ? (
                    <span className="text-muted-foreground/60">—</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AuditBarChart({ artifact }: { artifact: AuditBarChartArtifact }) {
  return (
    <div className="bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{artifact.title}</div>
          <div className="text-xs text-muted-foreground">
            {artifact.xAxisLabel} · {artifact.yAxisLabel}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {artifact.series.map((series, index) => (
            <div key={series.key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
              {series.label}
            </div>
          ))}
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={artifact.data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey={artifact.xKey} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip cursor={{ fill: "color-mix(in oklab, var(--muted) 60%, transparent)" }} />
            {artifact.series.map((series, index) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                fill={chartColors[index % chartColors.length]}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AuditPieChart({ artifact }: { artifact: AuditPieChartArtifact }) {
  return (
    <div className="bg-card p-4">
      <div className="mb-4 text-sm font-semibold">{artifact.title}</div>
      <div className="grid gap-4 md:grid-cols-[minmax(220px,1fr)_220px] md:items-center">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={artifact.data} dataKey="value" nameKey="label" innerRadius={58} outerRadius={96} paddingAngle={3}>
                {artifact.data.map((entry, index) => (
                  <Cell key={entry.label} fill={entry.color ?? chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {artifact.data.map((entry, index) => (
            <div key={entry.label} className="flex items-center justify-between gap-3 bg-muted/40 px-3 py-2 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color ?? chartColors[index % chartColors.length] }} />
                <span className="truncate">{entry.label}</span>
              </div>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
