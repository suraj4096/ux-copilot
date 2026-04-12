"use client"

import { Workflow } from "lucide-react"

import { badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function DrawGenerationPillButton(props: {
  generationId: number
  isLatest: boolean
  active: boolean
  onClick: () => void
  className?: string
}) {
  const { generationId, isLatest, active, onClick, className } = props
  return (
    <button
      type="button"
      className={cn(
        badgeVariants({ variant: active ? "default" : "outline" }),
        "max-w-[min(100%,14rem)] min-w-0 cursor-pointer normal-case",
        className,
      )}
      aria-pressed={active}
      onClick={onClick}
    >
      <Workflow
        className="opacity-70"
        data-icon="inline-start"
        aria-hidden
      />
      <span className="min-w-0 truncate">
        Generation {generationId}
        {isLatest ? " (latest)" : ""}
      </span>
    </button>
  )
}
