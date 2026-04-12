"use client"

import * as React from "react"
import { isTextUIPart, isToolUIPart } from "ai"
import { ArrowUp, MessageSquare, Workflow } from "lucide-react"
import { useRouterState } from "@tanstack/react-router"
import type { UIMessage } from "ai"

import {
  useAgentChat,
  useDrawDiagramHistoryOptional,
  useSyncAgentClientContextState,
} from "@/contexts/agent-chat-context"
import { DrawGenerationPillButton } from "@/components/draw-generation-pill"
import { mapAssistantMessageIdToMermaidGeneration } from "@/lib/draw/extract-mermaid"
import { AgentTopBar } from "@/components/agent-top-bar"
import { AgentToolCallBlock } from "@/components/agent-tool-call-block"
import { Markdown } from "@/components/markdown"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

function formatLocationSearch(search: unknown): string {
  if (search == null) return ""
  if (typeof search === "string") return search
  if (typeof search === "object" && !Array.isArray(search)) {
    const o = search as Record<string, unknown>
    const q = new URLSearchParams()
    for (const [key, value] of Object.entries(o)) {
      if (value === undefined || value === null) continue
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        q.set(key, String(value))
      } else {
        q.set(key, JSON.stringify(value))
      }
    }
    const s = q.toString()
    return s ? `?${s}` : ""
  }
  return ""
}

function isDrawPath(pathname: string) {
  return pathname === "/draw" || pathname === "/draw/"
}

function stripMermaidDiagramFences(markdown: string) {
  return markdown.replace(
    /```mermaid\s*[\s\S]*?```/gi,
    "\n\n*Diagram shown on the left.*\n\n",
  )
}

function assistantHasStreamedContent(message: UIMessage) {
  if (message.role !== "assistant") return false
  const parts = message.parts
  if (parts && parts.length > 0) {
    for (const part of parts) {
      if (isTextUIPart(part) && part.text.length > 0) return true
      if (isToolUIPart(part)) return true
    }
    return false
  }
  if ("content" in message && message.content) {
    return String(message.content).trim().length > 0
  }
  return false
}

const emptyGenerationMap = new Map<string, number>()

function renderMessageParts(
  message: UIMessage,
  stripDiagramFences: boolean,
) {
  const forAssistantMd = (text: string) =>
    stripDiagramFences ? stripMermaidDiagramFences(text) : text
  const parts = message.parts
  if (parts.length === 0 && "content" in message && message.content) {
    const text = String(message.content)
    if (message.role === "assistant") {
      return <Markdown markdown={forAssistantMd(text)} />
    }
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
    )
  }
  return (
    <div className="space-y-1">
      {parts.map((part, i) => {
        if (isTextUIPart(part)) {
          if (message.role === "assistant") {
            return (
              <Markdown key={i} markdown={forAssistantMd(part.text)} />
            )
          }
          return (
            <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
              {part.text}
            </p>
          )
        }
        if (isToolUIPart(part)) {
          return <AgentToolCallBlock key={i} part={part} />
        }
        return null
      })}
    </div>
  )
}

export function AgentPanel() {
  const [draft, setDraft] = React.useState("")

  const route = useRouterState({
    select: (s) => {
      const leaf = s.matches.at(-1)
      const parsedSearch: unknown = s.location.search
      const searchString =
        typeof parsedSearch === "string"
          ? parsedSearch.startsWith("?")
            ? parsedSearch
            : parsedSearch
              ? `?${parsedSearch}`
              : ""
          : formatLocationSearch(parsedSearch)
      return {
        pathname: s.location.pathname,
        parsedSearch,
        searchString,
        routeId: leaf?.routeId ?? "—",
        params: (leaf?.params ?? {}) as Record<string, unknown>,
      }
    },
  })

  const { messages, sendMessage, status, error } = useAgentChat()
  const drawDiagramHistory = useDrawDiagramHistoryOptional()

  const messageGenerationById = React.useMemo(
    () =>
      isDrawPath(route.pathname)
        ? mapAssistantMessageIdToMermaidGeneration(messages)
        : emptyGenerationMap,
    [route.pathname, messages],
  )

  const latestGenerationNumber = React.useMemo(() => {
    let max = 0
    for (const n of messageGenerationById.values()) {
      if (n > max) max = n
    }
    return max
  }, [messageGenerationById])

  useSyncAgentClientContextState({
    pathname: route.pathname,
    search: route.searchString,
    routeId: route.routeId,
    params: route.params,
  })

  const busy = status === "streaming" || status === "submitted"
  const isDraw = isDrawPath(route.pathname)

  const lastMessage = messages.at(-1)
  const showThinking =
    busy &&
    (lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" &&
        !assistantHasStreamedContent(lastMessage)))

  const listMessages =
    busy &&
    lastMessage?.role === "assistant" &&
    !assistantHasStreamedContent(lastMessage)
      ? messages.slice(0, -1)
      : messages

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/20">
      <AgentTopBar pathname={route.pathname} />

      <div className="flex min-h-0 flex-1 flex-col px-3 pt-3 text-xs">
        {listMessages.length === 0 && !showThinking ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-1 text-center">
            {isDraw ? (
              <Workflow
                className="size-10 shrink-0 text-muted-foreground"
                strokeWidth={1.25}
                aria-hidden
              />
            ) : (
              <MessageSquare
                className="size-10 shrink-0 text-muted-foreground"
                strokeWidth={1.25}
                aria-hidden
              />
            )}
            <p className="max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
              {isDraw
                ? "Describe a user flow or journey in plain language—this assistant turns it into diagrams and maps you can export, then refine and iterate with follow-up prompts."
                : "Ask about your surveys, explore response insights, sketch new forms, or get help with anything on this screen."}
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-2 pb-2">
                {listMessages.map((m) => {
                  const generationNumber = messageGenerationById.get(m.id)
                  const showTimelineChip =
                    isDraw &&
                    drawDiagramHistory &&
                    m.role === "assistant" &&
                    generationNumber !== undefined

                  return (
                    <div
                      key={m.id}
                      className={
                        m.role === "user"
                          ? "rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-2"
                          : "py-2"
                      }
                    >
                      {showTimelineChip ? (
                        <div className="mb-1.5 flex flex-wrap gap-1.5">
                          <DrawGenerationPillButton
                            generationId={generationNumber}
                            isLatest={
                              generationNumber === latestGenerationNumber
                            }
                            active={
                              drawDiagramHistory.selectedGenerationId ===
                                generationNumber ||
                              (drawDiagramHistory.selectedGenerationId ===
                                null &&
                                generationNumber === latestGenerationNumber)
                            }
                            onClick={() =>
                              drawDiagramHistory.setSelectedGenerationId(
                                generationNumber === latestGenerationNumber
                                  ? null
                                  : generationNumber,
                              )
                            }
                          />
                        </div>
                      ) : null}
                      {renderMessageParts(m, isDraw)}
                    </div>
                  )
                })}
                {showThinking ? (
                  <div
                    className="flex items-center gap-2 py-2 text-sm text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    <Spinner className="size-3.5 shrink-0" aria-hidden />
                    <span>Thinking…</span>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        )}
        {error ? (
          <p className="mt-2 shrink-0 pb-1 text-sm text-destructive" role="alert">
            {error.message}
          </p>
        ) : null}
      </div>

      <footer className="shrink-0 p-3 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const text = draft.trim()
            if (!text || busy) return
            setDraft("")
            void sendMessage({ text })
          }}
        >
          <div className="flex items-end gap-0 rounded-2xl border border-border bg-background py-1.5 pl-2.5 pr-1.5">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                isDraw
                  ? "Describe a user flow or journey…"
                  : "e.g. List my surveys…"
              }
              onKeyDown={(e) => {
                if (e.key !== "Enter" || e.shiftKey) return
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }}
              rows={1}
              disabled={busy}
              className="min-h-10 max-h-64 min-w-0 flex-1 resize-none border-0 bg-transparent px-0 py-2 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0 disabled:bg-transparent dark:bg-transparent"
            />
            <div className="inline-flex shrink-0 pb-0.5">
              <Button
                type="submit"
                size="icon-sm"
                variant="default"
                disabled={busy || !draft.trim()}
                aria-label={busy ? "Sending…" : "Send message"}
              >
                <ArrowUp className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </form>
      </footer>
    </aside>
  )
}
