"use client"

import * as React from "react"
import { isFileUIPart, isTextUIPart, isToolUIPart, type FileUIPart } from "ai"
import { ClipboardList, FileText, Pencil } from "lucide-react"

import { AgentInput } from "@/components/agent/agent-input"
import { AgentToolCallBlock } from "@/components/agent-tool-call-block"
import { Markdown } from "@/components/markdown"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/contexts/auth-context"
import { useAgentRuntime } from "@/contexts/agent-context"
import { greetingByHour } from "@/lib/user-identity"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { buttonVariants } from "../ui/button"
import { surveysListSearchDefaults } from "@/lib/router-search-defaults"

export function AgentPanel({ className }: { className?: string }) {
  const runtime = useAgentRuntime()
  const { identity, isLoading } = useAuth()
  const [draft, setDraft] = React.useState("")
  const [files, setFiles] = React.useState<Array<FileUIPart>>([])
  const [isThinking, setIsThinking] = React.useState(false)
  const thinkingFromIndexRef = React.useRef(0)

  const greeting = greetingByHour(new Date())
  const name = identity?.name || "there"
  const hasMessages = runtime.messages.length > 0

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
                  files={files}
                  onFilesChange={setFiles}
                  isDisabled={!draft.trim() && files.length === 0}
                  onSubmit={submitMessage}
                />
              </div>

              <div className="mt-12 flex max-w-2xl w-full justify-center gap-2">
                <Link
                  to="/surveys"
                  search={surveysListSearchDefaults}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ClipboardList className="size-3.5" aria-hidden />
                  Survey
                </Link>
                <Link
                  to="/draw"
                  search={{ draft: undefined }}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Draw
                </Link>
                <Link
                  to="/report"
                  search={{ draft: undefined }}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <FileText className="size-3.5" aria-hidden />
                  Report
                </Link>
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
