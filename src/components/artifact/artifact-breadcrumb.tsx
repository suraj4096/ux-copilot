"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  formResponsesPageQueryOptions,
  surveyDetailQueryOptions,
} from "@/lib/query-options"
import {
  formResponsesSearchSchema,
  surveyDetailSearchSchema,
} from "@/lib/router-search-schemas"
import {
  surveyDetailSearchDefaults,
  surveysListSearchDefaults,
} from "@/lib/router-search-defaults"

type ParsedPath =
  | { kind: "list" }
  | { kind: "draw" }
  | { kind: "report" }
  | { kind: "survey"; surveyId: string }
  | { kind: "newForm"; surveyId: string }
  | { kind: "form"; surveyId: string; formId: string }
  | { kind: "other" }

function coerceSearchRecord(search: unknown): Record<string, unknown> {
  if (search !== null && typeof search === "object" && !Array.isArray(search)) {
    return search as Record<string, unknown>
  }
  if (typeof search === "string") {
    const q = search.startsWith("?") ? search.slice(1) : search
    return Object.fromEntries(new URLSearchParams(q).entries())
  }
  return {}
}

function parseArtifactPath(pathname: string): ParsedPath {
  const norm = pathname.replace(/\/+$/, "") || "/"
  const seg = norm.split("/").filter(Boolean)
  if (seg[0] === "draw") return { kind: "draw" }
  if (seg[0] === "report") return { kind: "report" }
  if (seg[0] !== "surveys") return { kind: "other" }
  if (seg.length === 1) return { kind: "list" }
  const surveyId = seg[1]
  if (!surveyId) return { kind: "other" }
  if (seg.length === 2) return { kind: "survey", surveyId }
  if (seg[2] !== "form") return { kind: "other" }
  if (seg.length === 3) return { kind: "newForm", surveyId }
  const formId = seg[3]
  if (!formId) return { kind: "other" }
  return { kind: "form", surveyId, formId }
}

const backButtonClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

export function ArtifactBreadcrumb({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const rawSearch = useRouterState({ select: (s) => s.location.search })
  const parsed = React.useMemo(() => parseArtifactPath(pathname), [pathname])
  const searchRecord = React.useMemo(
    () => coerceSearchRecord(rawSearch),
    [rawSearch],
  )

  const detailSearch = React.useMemo(
    () => surveyDetailSearchSchema.parse(searchRecord),
    [searchRecord],
  )
  const responsesSearch = React.useMemo(
    () => formResponsesSearchSchema.parse(searchRecord),
    [searchRecord],
  )

  const surveyDetailQuery = useQuery({
    ...surveyDetailQueryOptions(
      parsed.kind === "survey" ? parsed.surveyId : "",
      {
        search: detailSearch.fq,
        offset: detailSearch.foffset,
        limit: detailSearch.flimit,
      },
    ),
    enabled: parsed.kind === "survey",
  })

  const formPageQuery = useQuery({
    ...formResponsesPageQueryOptions(
      parsed.kind === "form" ? parsed.surveyId : "",
      parsed.kind === "form" ? parsed.formId : "",
      {
        search: responsesSearch.rq,
        offset: responsesSearch.roffset,
        limit: responsesSearch.rlimit,
      },
    ),
    enabled: parsed.kind === "form",
  })

  if (parsed.kind === "list") {
    return (
      <span
        className={cn(
          "min-w-0 truncate text-sm font-medium text-foreground",
          className,
        )}
      >
        Surveys
      </span>
    )
  }

  if (parsed.kind === "draw") {
    return (
      <span
        className={cn(
          "min-w-0 truncate text-sm font-medium text-foreground",
          className,
        )}
      >
        Draw
      </span>
    )
  }

  if (parsed.kind === "report") {
    return (
      <span
        className={cn(
          "min-w-0 truncate text-sm font-medium text-foreground",
          className,
        )}
      >
        Report
      </span>
    )
  }

  if (parsed.kind === "survey") {
    const title =
      surveyDetailQuery.data?.surveyRes.ok === true
        ? surveyDetailQuery.data.surveyRes.survey.title
        : null
    return (
      <div className={cn("flex min-w-0 items-center gap-1", className)}>
        <Link
          to="/surveys"
          search={surveysListSearchDefaults}
          className={backButtonClass}
          aria-label="Back to surveys"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {title ?? (surveyDetailQuery.isPending ? "…" : "Survey")}
        </span>
      </div>
    )
  }

  if (parsed.kind === "newForm") {
    return (
      <div className={cn("flex min-w-0 items-center gap-1", className)}>
        <Link
          to="/surveys/$surveyId"
          params={{ surveyId: parsed.surveyId }}
          search={surveyDetailSearchDefaults}
          className={backButtonClass}
          aria-label="Back to survey"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          New form
        </span>
      </div>
    )
  }

  if (parsed.kind === "form") {
    const title =
      formPageQuery.data?.formRes.ok === true
        ? formPageQuery.data.formRes.form.title
        : null
    return (
      <div className={cn("flex min-w-0 items-center gap-1", className)}>
        <Link
          to="/surveys/$surveyId"
          params={{ surveyId: parsed.surveyId }}
          search={surveyDetailSearchDefaults}
          className={backButtonClass}
          aria-label="Back to survey"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {title ?? (formPageQuery.isPending ? "…" : "Form")}
        </span>
      </div>
    )
  }

  return (
    <span className={cn("min-w-0 truncate text-sm text-muted-foreground", className)}>
      Breadcrumb placeholder
    </span>
  )
}

