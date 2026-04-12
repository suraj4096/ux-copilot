"use client"

import { Link } from "@tanstack/react-router"
import { ClipboardList, FileText, Link2 } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function pathAndSearchFromHref(href: string): {
  path: string
  search: Record<string, string>
} {
  const q = href.indexOf("?")
  if (q < 0) return { path: href, search: {} }
  const path = href.slice(0, q)
  const params = new URLSearchParams(href.slice(q + 1))
  return { path, search: Object.fromEntries(params.entries()) }
}

function normalizedPathForKind(path: string): string {
  const base = path.split("?")[0] ?? path
  if (base === "/") return "/"
  return base.replace(/\/+$/, "") || "/"
}

function chipIconForPath(pathOnly: string) {
  const p = normalizedPathForKind(pathOnly)
  if (/^\/surveys\/[^/]+$/.test(p)) return ClipboardList
  if (/^\/surveys\/[^/]+\/form\/[^/]+$/.test(p)) return FileText
  return Link2
}

export function MarkdownCopilotChip(props: React.HTMLAttributes<HTMLElement>) {
  const { className, children: _children, ...rest } = props
  const r = rest as Record<string, unknown>
  const label = String(r.dataTitle ?? r["data-title"] ?? "").trim()
  const href = String(r.dataHref ?? r["data-href"] ?? "").trim()
  const { path, search } = pathAndSearchFromHref(href)
  const hasSearch = Object.keys(search).length > 0

  if (!href.startsWith("/") || !label) {
    return (
      <Badge
        className={cn(
          "max-w-full border-destructive/30 align-text-bottom text-destructive",
          className
        )}
        title="Invalid navigation chip"
      >
        <span className="min-w-0 truncate">{label || "Invalid chip"}</span>
      </Badge>
    )
  }

  const Icon = chipIconForPath(path)

  return (
    <Badge
      variant="outline"
      className={cn(
        "max-w-[min(100%,18rem)] min-w-0 shrink-0 align-text-bottom leading-none normal-case",
        className
      )}
      render={
        <Link
          to={path as never}
          {...(hasSearch ? { search: search as never } : {})}
          title={label}
        />
      }
    >
      <Icon className="opacity-70" data-icon="inline-start" aria-hidden />
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
  )
}
