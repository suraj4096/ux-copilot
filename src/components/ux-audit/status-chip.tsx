import { cn } from "@/lib/utils"

export type StatusChipColor = "chart1" | "chart2" | "chart3" | "chart4" | "chart5" | "muted"

const colorClass: Record<StatusChipColor, string> = {
  chart1: "border-chart-1/35 bg-chart-1/20 text-chart-1",
  chart2: "border-chart-2/35 bg-chart-2/20 text-chart-2",
  chart3: "border-chart-3/35 bg-chart-3/20 text-chart-3",
  chart4: "border-chart-4/35 bg-chart-4/25 text-chart-4",
  chart5: "border-chart-5/35 bg-chart-5/25 text-chart-5",
  muted: "border-border bg-muted text-muted-foreground",
}

export function StatusChip({
  text,
  color = "muted",
  className,
}: {
  text: string
  color?: StatusChipColor
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize leading-none",
        colorClass[color],
        className,
      )}
    >
      {text}
    </span>
  )
}
