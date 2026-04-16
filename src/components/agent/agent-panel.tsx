"use client"

import * as React from "react"
import { getToolName, isTextUIPart, isToolUIPart } from "ai"
import { ChevronDown, ChevronRight, Wrench } from "lucide-react"

import { AgentInput } from "@/components/agent/agent-input"
import { Markdown } from "@/components/markdown"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/contexts/auth-context"
import { useAgentRuntime } from "@/contexts/agent-context"
import { greetingByHour } from "@/lib/user-identity"
import { cn } from "@/lib/utils"

export function AgentPanel({ className }: { className?: string }) {
  const runtime = useAgentRuntime()
  const { identity, isLoading } = useAuth()
  const [draft, setDraft] = React.useState("")
  const [expandedTools, setExpandedTools] = React.useState<Set<string>>(
    () => new Set(),
  )
  const [isThinking, setIsThinking] = React.useState(false)
  const thinkingFromIndexRef = React.useRef(0)

  const greeting = greetingByHour(new Date())
  const name = identity?.name || "there"
  const hasMessages = runtime.messages.length > 0

  const toggleTool = React.useCallback((toolCallId: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev)
      if (next.has(toolCallId)) next.delete(toolCallId)
      else next.add(toolCallId)
      return next
    })
  }, [])

  React.useEffect(() => {
    if (!isThinking) return
    const from = thinkingFromIndexRef.current
    const newMessages = runtime.messages.slice(from)
    const hasAssistantReply = newMessages.some((m) => m.role === "assistant")
    if (hasAssistantReply) setIsThinking(false)
  }, [isThinking, runtime.messages])

  return (
    <section
      className={cn(
        "mx-auto flex min-h-0 w-full max-w-4xl flex-col overflow-hidden",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-b from-background via-background to-muted/15">
        {!hasMessages ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-6 md:px-6">
            <div className="mx-auto w-full max-w-2xl pt-[24vh]">
              <div className="space-y-3">
                <div className="text-center text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                  {isLoading ? "Loading..." : `${greeting}, ${name}`}
                </div>
              </div>

              <div className="mt-8">
                <AgentInput
                  value={draft}
                  onChange={setDraft}
                  isDisabled={!draft.trim()}
                  onSubmit={() => {
                    if (!draft.trim()) return
                    void runtime.sendMessage({ text: draft.trim() })
                    setDraft("")
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 py-4 pb-28 md:px-6">
                <div className="space-y-3">
                  {runtime.messages.map((message) => {
                    const parts = (message as any).parts ?? []
                    const hasText = Array.isArray(parts)
                      ? parts.some(isTextUIPart)
                      : false
                    const hasTools = Array.isArray(parts)
                      ? parts.some(isToolUIPart)
                      : false

                    if (!hasText && !hasTools) return null

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex max-w-[92%] flex-col gap-2 rounded-xl px-4 py-3 text-sm",
                          message.role === "user"
                            ? "ml-auto border-primary/20 bg-primary/10"
                            : "mr-auto border-border bg-card",
                        )}
                      >
                        {Array.isArray(parts)
                          ? parts.map((part: any, idx: number) => {
                              if (isTextUIPart(part)) {
                                return (
                                  <div
                                    key={`${message.id}-text-${idx}`}
                                    className="text-foreground"
                                  >
                                    <Markdown
                                      markdown={part.text}
                                      className="prose-p:my-0 prose-ul:my-0 prose-ol:my-0"
                                    />
                                  </div>
                                )
                              }

                              if (isToolUIPart(part)) {
                                const toolName = getToolName(part)
                                const toolCallId = part.toolCallId as string
                                const isRunning = part.state !== "output-available"
                                const isExpanded = expandedTools.has(toolCallId)

                                return (
                                  <div
                                    key={`${message.id}-tool-${toolCallId}-${idx}`}
                                    className="rounded-lg border bg-background/60"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleTool(toolCallId)}
                                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                                    >
                                      <div className="flex min-w-0 items-center gap-2">
                                        <Wrench
                                          className="size-4 shrink-0 text-muted-foreground"
                                          aria-hidden
                                        />
                                        <div
                                          className={cn(
                                            "min-w-0 truncate text-xs font-medium text-muted-foreground",
                                            isRunning ? "agent-tool-name-shimmer" : null,
                                          )}
                                        >
                                          {toolName}
                                        </div>
                                      </div>
                                      {isExpanded ? (
                                        <ChevronDown
                                          className="size-4 shrink-0 text-muted-foreground"
                                          aria-hidden
                                        />
                                      ) : (
                                        <ChevronRight
                                          className="size-4 shrink-0 text-muted-foreground"
                                          aria-hidden
                                        />
                                      )}
                                    </button>
                                    {isExpanded ? (
                                      <div className="border-t px-3 py-2">
                                        {isRunning ? (
                                          <div className="text-xs text-muted-foreground">
                                            Running…
                                          </div>
                                        ) : (
                                          <pre className="max-h-64 overflow-auto rounded-md bg-muted/40 p-2 text-xs text-foreground">
                                            {JSON.stringify(part.output ?? null, null, 2)}
                                          </pre>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                )
                              }

                              return null
                            })
                          : null}
                      </div>
                    )
                  })}

                  {isThinking ? (
                    <div className="mr-auto flex max-w-[92%] flex-col gap-2 rounded-xl border-border bg-card px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Spinner className="size-4" aria-hidden />
                        <span className="text-xs font-medium">Thinking…</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="sticky bottom-0 z-10 shrink-0 bg-background/80 backdrop-blur">
                <AgentInput
                  className="p-4"
                  value={draft}
                  onChange={setDraft}
                  isDisabled={!draft.trim()}
                  onSubmit={() => {
                    if (!draft.trim()) return
                    thinkingFromIndexRef.current = runtime.messages.length
                    setIsThinking(true)
                    void runtime.sendMessage({ text: draft.trim() })
                    setDraft("")
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
