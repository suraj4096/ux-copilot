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

type AgentChatContextValue = ReturnType<typeof useChat>

const AgentChatContext = React.createContext<AgentChatContextValue | null>(null)

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

export function WorkspaceAgentRuntimeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const appliedOpenFormEditorIdsRef = React.useRef(new Set<string>())
  const [clientContext, setClientContext] =
    React.useState<AgentClientContext>(emptyClientContext)
  const clientContextRef = React.useRef(clientContext)
  clientContextRef.current = clientContext

  const chat = useChat({
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
          messages,
          trigger,
          messageId,
          mode: "survey",
          clientContext: clientContextRef.current,
        },
      }),
    }),
  })

  React.useEffect(() => {
    const hit = lastOpenFormEditorInvocation(chat.messages)
    if (!hit) return
    if (appliedOpenFormEditorIdsRef.current.has(hit.toolCallId)) return
    if (!isOpenFormEditorOk(hit.output)) return
    appliedOpenFormEditorIdsRef.current.add(hit.toolCallId)
    void applyOpenFormEditorResult(
      navigate as unknown as NavigateToAgentFormEditor,
      hit.output,
    )
  }, [chat.messages, navigate])

  return (
    <AgentClientUiContext.Provider value={setClientContext}>
      <AgentChatContext.Provider value={chat}>{children}</AgentChatContext.Provider>
    </AgentClientUiContext.Provider>
  )
}

export function useAgentChat() {
  const ctx = React.useContext(AgentChatContext)
  if (!ctx) {
    throw new Error("useAgentChat must be used within WorkspaceAgentRuntimeProvider")
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

    const surveyId = Object.hasOwn(params, "surveyId")
      ? params.surveyId
      : undefined
    const formId = Object.hasOwn(params, "formId") ? params.formId : undefined
    const surveyTitle = surveyId
      ? readSurveyTitleFromCache(qc, surveyId)
      : undefined
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
  }, [
    qc,
    setClientContext,
    input.pathname,
    input.search,
    input.routeId,
    input.params,
  ])
}
