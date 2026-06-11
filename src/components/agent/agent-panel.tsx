"use client"

import * as React from "react"
import {  isFileUIPart, isTextUIPart, isToolUIPart } from "ai"
import type {FileUIPart} from "ai";
import { AgentInput } from "@/components/agent/agent-input"
import { AgentToolCallBlock } from "@/components/agent-tool-call-block"
import { Markdown } from "@/components/markdown"
import { Spinner } from "@/components/ui/spinner"
import { useAgentRuntime } from "@/contexts/agent-context"
import { cn } from "@/lib/utils"

export function AgentPanel({ className }: { className?: string }) {
  const runtime = useAgentRuntime()
  const [draft, setDraft] = React.useState("")
  const [files, setFiles] = React.useState<Array<FileUIPart>>([])
  const [isThinking, setIsThinking] = React.useState(false)
  const thinkingFromIndexRef = React.useRef(0)

  const hasMessages = runtime.messages.length > 0
  const suggestions = [
    "Start a UX audit from uploaded PDFs and screenshots.",
    "Create a survey to validate the main usability risks.",
    "Sketch a user flow for the current product journey.",
    "Generate an executive UX report from the audit findings.",
  ]

  React.useEffect(() => {
    if (!isThinking) return
    const from = thinkingFromIndexRef.current
    const newMessages = runtime.messages.slice(from)
    const hasAssistantReply = newMessages.some((m) => m.role === "assistant")
    if (hasAssistantReply) setIsThinking(false)
  }, [isThinking, runtime.messages])

  const submitMessage = React.useCallback(() => {
    const text = draft.trim()
    if (!text && files.length === 0) return
    thinkingFromIndexRef.current = runtime.messages.length
    setIsThinking(true)
    if (text.length > 0) {
      void runtime.sendMessage({ text, files })
    } else {
      void runtime.sendMessage({ files })
    }
    setDraft("")
    setFiles([])
  }, [draft, files, runtime])

  const formatBytes = React.useCallback((bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }, [])

  return (
    <section
      className={cn(
        "mx-auto flex min-h-0 w-full max-w-4xl flex-col overflow-hidden",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-b from-background via-background to-muted/15">
        {!hasMessages ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto px-4 py-8 pb-32 md:px-6">
              <div className="w-full max-w-2xl">
                <div className="text-center">
                  <div className="text-lg font-semibold tracking-tight">How can I help with UX today?</div>
                  <p className="mt-1 text-sm text-muted-foreground">Choose a starting point or type your own request below.</p>
                </div>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDraft(suggestion)}
                      className="rounded-xl border bg-card p-3 text-left text-sm leading-5 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 z-10 shrink-0 bg-background/80 backdrop-blur">
              <AgentInput
                className="p-4"
                value={draft}
                onChange={setDraft}
                files={files}
                onFilesChange={setFiles}
                isDisabled={!draft.trim() && files.length === 0}
                onSubmit={submitMessage}
              />
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
                    const hasFiles = Array.isArray(parts)
                      ? parts.some(isFileUIPart)
                      : false

                    if (!hasText && !hasTools && !hasFiles) return null

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex max-w-[92%] flex-col gap-2 rounded-xl px-4 py-3 text-sm",
                          message.role === "user"
                            ? "ml-auto border-primary/20 bg-primary/10"
                            : "mr-auto border-border bg-card"
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
                                      className="prose-p:my-0 prose-ol:my-0 prose-ul:my-0"
                                    />
                                  </div>
                                )
                              }

                              if (isToolUIPart(part)) {
                                return (
                                  <AgentToolCallBlock
                                    key={`${message.id}-tool-${part.toolCallId}-${idx}`}
                                    part={part}
                                  />
                                )
                              }

                              if (isFileUIPart(part)) {
                                const isImage = part.mediaType.startsWith("image/")
                                const label =
                                  part.filename?.trim() ||
                                  (isImage ? "Image" : "Document")
                                const size = part.url.startsWith("data:")
                                  ? Math.max(0, Math.floor((part.url.length * 3) / 4) - 2)
                                  : 0

                                return (
                                  <div
                                    key={`${message.id}-file-${idx}`}
                                    className="rounded-lg border bg-background/60 p-2"
                                  >
                                    {isImage ? (
                                      <img
                                        src={part.url}
                                        alt={label}
                                        className="mb-2 max-h-44 rounded-md border object-contain"
                                      />
                                    ) : null}
                                    <div className="text-xs text-foreground">{label}</div>
                                    <div className="text-[11px] text-muted-foreground">
                                      {part.mediaType}
                                      {size > 0 ? ` · ${formatBytes(size)}` : ""}
                                    </div>
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
                  files={files}
                  onFilesChange={setFiles}
                  isDisabled={!draft.trim() && files.length === 0}
                  onSubmit={submitMessage}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
