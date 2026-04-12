"use client"

import type { DynamicToolUIPart, ToolUIPart, UITools } from "ai"
import { getToolName } from "ai"
import {
  BadgeCheck,
  ChevronDown,
  ClipboardList,
  MessageSquareText,
  PenLine,
  Search,
  ShieldOff,
  Wrench,
} from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

type AnyToolPart = ToolUIPart<UITools> | DynamicToolUIPart

function formatParamValue(value: unknown): string {
  if (value === undefined || value === null) return ""
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function humanToolName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function iconForTool(name: string) {
  switch (name) {
    case "search_surveys":
      return Search
    case "search_forms":
      return ClipboardList
    case "search_responses":
      return MessageSquareText
    case "validate_form_json":
      return BadgeCheck
    case "open_form_editor":
      return PenLine
    default:
      return Wrench
  }
}

function isTerminalState(part: AnyToolPart): boolean {
  return (
    part.state === "output-available" ||
    part.state === "output-error" ||
    part.state === "output-denied"
  )
}

function isShimmerState(part: AnyToolPart): boolean {
  if (!isTerminalState(part)) return true
  if (part.state === "output-available" && part.preliminary === true) return true
  return false
}

export function AgentToolCallBlock({
  part,
  className,
}: {
  part: AnyToolPart
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const name = getToolName(part)
  const label = humanToolName(name)
  const Icon = iconForTool(name)
  const showChevron = isTerminalState(part)
  const shimmer = isShimmerState(part)
  const expandable = showChevron

  let body: React.ReactNode = null
  if (part.state === "output-available") {
    const text = formatParamValue(part.output)
    const clipped = text.length > 6000 ? `${text.slice(0, 6000)}…` : text
    body = (
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-foreground/90">
        {clipped}
      </pre>
    )
  } else if (part.state === "output-error") {
    body = <p className="text-[11px] text-destructive">{part.errorText}</p>
  } else if (part.state === "output-denied") {
    body = (
      <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <ShieldOff className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span>
          {part.approval.reason?.trim()
            ? part.approval.reason
            : "This tool call was not approved."}
        </span>
      </p>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-md py-0.5 text-left text-sm text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          expandable && "cursor-pointer hover:bg-muted/30",
          !expandable && "cursor-default",
        )}
        aria-expanded={expandable ? open : undefined}
        aria-disabled={!expandable}
        onClick={() => expandable && setOpen((v) => !v)}
        {...(!expandable ? { tabIndex: -1 } : {})}
      >
        <Icon className="size-3.5 shrink-0" aria-hidden />
        <span
          className={cn(
            "min-w-0",
            shimmer ? "agent-tool-name-shimmer" : undefined,
          )}
        >
          {label}
        </span>
        {showChevron ? (
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden
          />
        ) : (
          <span className="size-3.5 shrink-0" aria-hidden />
        )}
      </button>
      {expandable && open && body ? (
        <div className="mt-1 w-full">{body}</div>
      ) : null}
    </div>
  )
}
