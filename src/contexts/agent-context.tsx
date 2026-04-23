"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import type { AgentClientContext } from "@/lib/ai/client-agent-context"
import type { NavigateToAgentFormEditor } from "@/lib/ai/client/apply-open-form-editor"
import {
  applyOpenFormEditorResult,
  isOpenFormEditorOk,
} from "@/lib/ai/client/apply-open-form-editor"
import { lastOpenFormEditorInvocation } from "@/lib/ai/client/extract-open-form-editor-output"
import { applyOpenDrawEditorResult, isOpenDrawEditorOk } from "@/lib/ai/client/apply-open-draw-editor"
import { lastOpenDrawEditorInvocation } from "@/lib/ai/client/extract-open-draw-editor-output"
import {
  applyOpenReportArtifactResult,
  isOpenReportArtifactOk,
} from "@/lib/ai/client/apply-open-report-artifact"
import { lastOpenReportArtifactInvocation } from "@/lib/ai/client/extract-open-report-artifact-output"

export type AgentRuntime = ReturnType<typeof useChat>

export type AgentMode = "auto" | "survey" | "draw" | "report"

export type AgentCurrentContext = {
  screen: string
  context: string
}

function isContextCompatibleWithMode(
  mode: AgentMode,
  ctx: AgentCurrentContext | null,
): boolean {
  if (!ctx) return false
  if (mode === "auto") return true
  const screen = ctx.screen.trim().toLowerCase()
  const isSurveyDomain = screen === "survey" || screen.startsWith("survey/")
  if (mode === "survey") return isSurveyDomain
  if (mode === "draw") return !isSurveyDomain
  if (mode === "report") {
    return (
      screen === "report" ||
      screen.startsWith("report/") ||
      screen.includes("report")
    )
  }
  return true
}

const AgentRuntimeContext = React.createContext<AgentRuntime | null>(null)

const AgentModeContext = React.createContext<
  { mode: AgentMode; setMode: (mode: AgentMode) => void } | null
>(null)

const AgentActionsContext = React.createContext<{ resetAgent: () => void } | null>(
  null,
)

const AgentCurrentContextContext = React.createContext<
  | {
      isEnabled: boolean
      currentContext: AgentCurrentContext | null
      setCurrentContext: (value: AgentCurrentContext | null) => void
      setEnabled: (value: boolean) => void
    }
  | null
>(null)

const AgentClientUiContext =
  React.createContext<
    React.Dispatch<React.SetStateAction<AgentClientContext>> | null
  >(null)

function emptyClientContext(): AgentClientContext {
  return {
    pathname: "",
    search: "",
    routeId: "",
    params: {},
    hints: { routeKind: "other" },
  }
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const appliedOpenFormEditorIdsRef = React.useRef(new Set<string>())
  const appliedOpenDrawEditorIdsRef = React.useRef(new Set<string>())
  const appliedOpenReportArtifactIdsRef = React.useRef(new Set<string>())
  const [mode, setMode] = React.useState<AgentMode>("auto")
  const [isContextEnabled, setIsContextEnabled] = React.useState(true)
  const [currentContext, setCurrentContext] =
    React.useState<AgentCurrentContext | null>(null)
  const [clientContext, setClientContext] =
    React.useState<AgentClientContext>(emptyClientContext)
  const clientContextRef = React.useRef(clientContext)
  clientContextRef.current = clientContext
  const currentContextRef = React.useRef(currentContext)
  currentContextRef.current = currentContext
  const isContextEnabledRef = React.useRef(isContextEnabled)
  isContextEnabledRef.current = isContextEnabled
  const modeRef = React.useRef(mode)
  modeRef.current = mode

  const runtime = useChat({
    id: "workspace-copilot",
    transport: new DefaultChatTransport({
      api: "/api/chat",
      credentials: "include",
      prepareSendMessagesRequest: ({
        body,
        messages,
        id,
        trigger,
        messageId,
      }) => ({
        body: {
          ...body,
          id,
          messages: messages.slice(-5),
          trigger,
          messageId,
          mode: modeRef.current,
          clientContext: clientContextRef.current,
          currentContext:
            isContextEnabledRef.current &&
            isContextCompatibleWithMode(modeRef.current, currentContextRef.current)
              ? currentContextRef.current
              : null,
        },
      }),
    }),
  })

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[AgentMode] current mode state", mode)
  }, [mode])

  React.useEffect(() => {
    const hit = lastOpenFormEditorInvocation(runtime.messages)
    if (!hit) return
    if (appliedOpenFormEditorIdsRef.current.has(hit.toolCallId)) return
    if (!isOpenFormEditorOk(hit.output)) return
    appliedOpenFormEditorIdsRef.current.add(hit.toolCallId)
    void applyOpenFormEditorResult(
      navigate as unknown as NavigateToAgentFormEditor,
      hit.output,
      {
        surveyId: clientContextRef.current.hints.surveyId,
        cloneFromFormId: clientContextRef.current.hints.cloneFromFormId ?? undefined,
      },
    )
  }, [runtime.messages, navigate])

  React.useEffect(() => {
    const hit = lastOpenDrawEditorInvocation(runtime.messages)
    if (!hit) return
    if (appliedOpenDrawEditorIdsRef.current.has(hit.toolCallId)) return
    if (!isOpenDrawEditorOk(hit.output)) return
    appliedOpenDrawEditorIdsRef.current.add(hit.toolCallId)
    void applyOpenDrawEditorResult(
      navigate as unknown as (opts: { to: "/draw"; search?: { draft?: string } }) => void,
      hit.output,
    )
  }, [runtime.messages, navigate])

  React.useEffect(() => {
    const hit = lastOpenReportArtifactInvocation(runtime.messages)
    if (!hit) return
    if (appliedOpenReportArtifactIdsRef.current.has(hit.toolCallId)) return
    if (!isOpenReportArtifactOk(hit.output)) return
    appliedOpenReportArtifactIdsRef.current.add(hit.toolCallId)
    void applyOpenReportArtifactResult(
      navigate as unknown as (opts: { to: "/report"; search?: { draft?: string } }) => void,
      hit.output,
    )
  }, [runtime.messages, navigate])

  const resetAgent = React.useCallback(() => {
    appliedOpenFormEditorIdsRef.current.clear()
    setMode("auto")
    setIsContextEnabled(true)
    setCurrentContext(null)
    setClientContext(emptyClientContext())
    try {
      runtime.stop()
    } catch {
      // ignore
    }
    const maybeSetMessages = (runtime as unknown as { setMessages?: (m: Array<any>) => void })
      .setMessages
    if (typeof maybeSetMessages === "function") {
      maybeSetMessages([])
    }
  }, [runtime])

  return (
    <AgentActionsContext.Provider value={{ resetAgent }}>
      <AgentModeContext.Provider value={{ mode, setMode }}>
        <AgentCurrentContextContext.Provider
          value={{
            isEnabled: isContextEnabled,
            currentContext,
            setCurrentContext,
            setEnabled: setIsContextEnabled,
          }}
        >
          <AgentClientUiContext.Provider value={setClientContext}>
            <AgentRuntimeContext.Provider value={runtime}>
              {children}
            </AgentRuntimeContext.Provider>
          </AgentClientUiContext.Provider>
        </AgentCurrentContextContext.Provider>
      </AgentModeContext.Provider>
    </AgentActionsContext.Provider>
  )
}

export function useAgentRuntime() {
  const ctx = React.useContext(AgentRuntimeContext)
  if (!ctx) {
    throw new Error("useAgentRuntime must be used within AgentProvider")
  }
  return ctx
}

export function useAgentMode() {
  const ctx = React.useContext(AgentModeContext)
  if (!ctx) {
    throw new Error("useAgentMode must be used within AgentProvider")
  }
  return ctx
}

export function useAgentActions() {
  const ctx = React.useContext(AgentActionsContext)
  if (!ctx) {
    throw new Error("useAgentActions must be used within AgentProvider")
  }
  return ctx
}

export function useOptionalAgentActions() {
  return React.useContext(AgentActionsContext)
}

export function useAgentCurrentContext() {
  const ctx = React.useContext(AgentCurrentContextContext)
  if (!ctx) {
    throw new Error("useAgentCurrentContext must be used within AgentProvider")
  }
  return ctx
}

export function useSetAgentClientContext() {
  const ctx = React.useContext(AgentClientUiContext)
  if (!ctx) {
    throw new Error(
      "useSetAgentClientContext must be used within an agent runtime provider",
    )
  }
  return ctx
}

export function deriveAgentRouteKind(
  pathname: string,
): AgentClientContext["hints"]["routeKind"] {
  const p = pathname.replace(/\/$/, "") || "/"
  if (p === "/") return "home"
  if (p === "/login") return "login"
  if (p === "/report") return "report"
  if (p.startsWith("/f/")) return "public-form"
  if (p === "/surveys") return "surveys-list"
  if (/^\/surveys\/[^/]+\/form\/[^/]+$/.test(p)) return "form-detail"
  if (/^\/surveys\/[^/]+\/form$/.test(p)) return "survey-forms"
  if (/^\/surveys\/[^/]+$/.test(p)) return "survey-detail"
  return "other"
}

type SurveyDetailCache = {
  surveyRes?: { ok: true; survey: { title: string } } | { ok: false }
}

type FormResponsesCache = {
  formRes?: { ok: true; form: { title: string } } | { ok: false }
}

function readSurveyTitleFromCache(
  qc: QueryClient,
  surveyId: string,
): string | undefined {
  const rows = qc.getQueriesData<SurveyDetailCache>({
    queryKey: ["survey", surveyId, "detail"],
  })
  for (const [, data] of rows) {
    if (data?.surveyRes?.ok) return data.surveyRes.survey.title
  }
  return undefined
}

function readFormTitleFromCache(
  qc: QueryClient,
  surveyId: string,
  formId: string,
): string | undefined {
  const rows = qc.getQueriesData<FormResponsesCache>({
    queryKey: ["surveyForm", formId, "responses", surveyId],
  })
  for (const [, data] of rows) {
    if (data?.formRes?.ok) return data.formRes.form.title
  }
  return undefined
}

function parseSearchParam(search: string, name: string): string | undefined {
  const q = search.startsWith("?") ? search.slice(1) : search
  const v = new URLSearchParams(q).get(name)
  return v && v.trim() ? v.trim() : undefined
}

export function useSyncAgentClientContextState(input: {
  pathname: string
  search: string
  routeId: string
  params: Record<string, unknown>
}) {
  const qc = useQueryClient()
  const setClientContext = useSetAgentClientContext()

  React.useLayoutEffect(() => {
    const params: Record<string, string> = {}
    for (const [k, v] of Object.entries(input.params)) {
      if (v === undefined || v === null) continue
      const s = String(v)
      if (s !== "") params[k] = s
    }

    const surveyId = Object.hasOwn(params, "surveyId") ? params.surveyId : undefined
    const formId = Object.hasOwn(params, "formId") ? params.formId : undefined
    const surveyTitle = surveyId ? readSurveyTitleFromCache(qc, surveyId) : undefined
    const formTitle =
      surveyId && formId ? readFormTitleFromCache(qc, surveyId, formId) : undefined

    const routeKind = deriveAgentRouteKind(input.pathname)
    const cloneFromFormId =
      routeKind === "survey-forms"
        ? parseSearchParam(input.search, "cloneFrom")
        : undefined
    const agentDraftId =
      routeKind === "survey-forms"
        ? parseSearchParam(input.search, "agentDraft")
        : undefined

    setClientContext({
      pathname: input.pathname,
      search: input.search,
      routeId: input.routeId,
      params,
      hints: {
        routeKind,
        surveyId,
        surveyTitle,
        formId,
        formTitle,
        cloneFromFormId,
        agentDraftId,
      },
    })
  }, [qc, setClientContext, input.pathname, input.search, input.routeId, input.params])
}

