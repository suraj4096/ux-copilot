import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type SlideLayoutMode = "grid" | "flex"

export type SlideLayoutConfig = {
  mode: SlideLayoutMode
  rows?: number
  cols?: number
  gap?: "sm" | "md" | "lg"
}

const gapClass = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
}

export function SlidePage({
  title,
  pageNo,
  children,
}: {
  title: string
  pageNo: number
  children: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="flex h-full min-h-0 flex-col p-6">
          <header className="mb-4 flex shrink-0 items-center justify-between gap-4 border-b pb-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                UX Audit Report
              </div>
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            </div>
            <div className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              {pageNo.toString().padStart(2, "0")}
            </div>
          </header>
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function SlideLayout({
  config,
  children,
}: {
  config: SlideLayoutConfig
  children: ReactNode
}) {
  const gap = gapClass[config.gap ?? "md"]

  if (config.mode === "flex") {
    const vertical = (config.rows ?? 1) > (config.cols ?? 1)
    return (
      <div
        className={cn(
          "flex h-full min-h-0",
          vertical ? "flex-col" : "flex-row",
          gap,
        )}
      >
        {children}
      </div>
    )
  }

  const rows = config.rows ?? 1
  const cols = config.cols ?? 1

  return (
    <div
      className={cn("grid h-full min-h-0", gap)}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: rows === 2 && cols === 1 ? "auto minmax(0, 1fr)" : `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}

export function SlideSection({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card/60 p-4">
      {title || description ? (
        <div className="mb-3 shrink-0">
          {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  )
}
