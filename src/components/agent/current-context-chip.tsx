"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouterState } from "@tanstack/react-router"
import { Plus, X } from "lucide-react"

import { useAgentCurrentContext, useAgentMode } from "@/contexts/agent-context"
import { cn } from "@/lib/utils"

type ParsedArtifact =
  | { kind: "surveysList" }
  | { kind: "report" }
  | { kind: "surveyDetail"; surveyId: string }
  | { kind: "newForm"; surveyId: string }
  | { kind: "formResponses"; surveyId: string; formId: string }
  | { kind: "other" }

function parseArtifactPath(pathname: string): ParsedArtifact {
  const norm = pathname.replace(/\/+$/, "") || "/"
  const seg = norm.split("/").filter(Boolean)
  if (seg[0] === "report") return { kind: "report" }
  if (seg[0] !== "surveys") return { kind: "other" }
  if (seg.length === 1) return { kind: "surveysList" }
  const surveyId = seg[1]
  if (!surveyId) return { kind: "other" }
  if (seg.length === 2) return { kind: "surveyDetail", surveyId }
  if (seg[2] !== "form") return { kind: "other" }
  if (seg.length === 3) return { kind: "newForm", surveyId }
  const formId = seg[3]
  if (!formId) return { kind: "other" }
  return { kind: "formResponses", surveyId, formId }
}

function readSurveyTitleFromCache(qc: ReturnType<typeof useQueryClient>, surveyId: string) {
  const rows = qc.getQueriesData<any>({ queryKey: ["survey", surveyId, "detail"] })
  for (const [, data] of rows) {
    const title = data?.surveyRes?.ok ? data.surveyRes.survey?.title : undefined
    if (typeof title === "string" && title.trim()) return title.trim()
  }
  return undefined
}

function readFormResponsesFromCache(
  qc: ReturnType<typeof useQueryClient>,
  surveyId: string,
  formId: string,
) {
  const rows = qc.getQueriesData<any>({
    queryKey: ["surveyForm", formId, "responses", surveyId],
  })
  for (const [, data] of rows) {
    const formTitle =
      data?.formRes?.ok === true ? data.formRes.form?.title : undefined
    const total =
      data?.responsesRes?.ok === true ? data.responsesRes.total : undefined
    if (typeof formTitle === "string" && formTitle.trim()) {
      return { formTitle: formTitle.trim(), total }
    }
  }
  return undefined
}

function isSurveyDomainScreen(screen: string): boolean {
  const s = screen.trim().toLowerCase()
  return s === "survey" || s.startsWith("survey/")
}

export function CurrentContextChip({ className }: { className?: string }) {
  const qc = useQueryClient()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { mode } = useAgentMode()
  const { isEnabled, setEnabled, currentContext, setCurrentContext } =
    useAgentCurrentContext()

  const derived = React.useMemo(() => {
    const parsed = parseArtifactPath(pathname)
    if (parsed.kind === "surveysList") {
      return {
        label: "Surveys",
        screen: "survey",
        context: "User is on the survey list screen.",
      }
    }
    if (parsed.kind === "report") {
      return {
        label: "Report",
        screen: "report",
        context: "User is on the report artifact screen.",
      }
    }
    if (parsed.kind === "surveyDetail") {
      const title = readSurveyTitleFromCache(qc, parsed.surveyId)
      const json = title ? JSON.stringify({ title }) : JSON.stringify({})
      return {
        label: `Survey${title ? `: ${title}` : ""}`,
        screen: `survey/${parsed.surveyId}`,
        context: `Survey context: ${json}`,
      }
    }
    if (parsed.kind === "formResponses") {
      const hit = readFormResponsesFromCache(qc, parsed.surveyId, parsed.formId)
      const json = hit
        ? JSON.stringify({
            title: hit.formTitle,
            totalResponses:
              typeof hit.total === "number" ? hit.total : undefined,
          })
        : JSON.stringify({})
      return {
        label: `Form${hit?.formTitle ? `: ${hit.formTitle}` : ""}`,
        screen: `survey/${parsed.surveyId}/form/${parsed.formId}`,
        context: `Form responses context: ${json}`,
      }
    }
    if (parsed.kind === "newForm") {
      return {
        label: "New form",
        screen: `survey/${parsed.surveyId}/form/new`,
        context: "New form context is supplied by the form editor.",
      }
    }
    return null
  }, [pathname, qc])

  React.useEffect(() => {
    if (!derived) return
    if (derived.screen.includes("/form/new")) return
    if (mode !== "auto") {
      const isSurvey = isSurveyDomainScreen(derived.screen)
      if (mode === "survey" && !isSurvey) return
      if (mode === "draw" && isSurvey) return
      if (mode === "report" && !derived.screen.includes("report")) return
    }

    setCurrentContext({ screen: derived.screen, context: derived.context })
    {
      // eslint-disable-next-line no-console
      console.log("[AgentContext] currentContext", {
        screen: derived.screen,
        context: derived.context,
      })
    }
  }, [derived, mode, setCurrentContext])

  if (!derived) return null
  if (mode !== "auto") {
    const isSurvey = isSurveyDomainScreen(derived.screen)
    if (mode === "survey" && !isSurvey) return null
    if (mode === "draw" && isSurvey) return null
    if (mode === "report" && !derived.screen.includes("report")) return null
  }

  const isActive = isEnabled && Boolean(currentContext)
  const label = derived?.label ?? "Context"

  return (
    <button
      type="button"
      onClick={() => {
        setEnabled(!isEnabled)
      }}
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-dashed px-3 py-1 text-left text-xs transition-colors",
        isActive
          ? "border-border bg-background text-foreground hover:bg-muted/40"
          : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/60",
        className,
      )}
      aria-pressed={isEnabled}
    >
      <span className="min-w-0 truncate">{label}</span>
      {isEnabled ? (
        <X className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <Plus className="size-3.5 shrink-0" aria-hidden />
      )}
    </button>
  )
}

