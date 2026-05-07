"use client"

import * as React from "react"
import { ChevronDown, FileText, Search, Sparkles, Wrench } from "lucide-react"
import type { FileUIPart } from "ai"

import type { AuditChatMessage, AuditStep, AuditToolCall } from "@/components/ux-audit/data"
import { AgentInput } from "@/components/agent/agent-input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

function ToolCallBlock({ tool, loading }: { tool: AuditToolCall; loading?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const Icon = tool.name.includes("search") ? Search : tool.name.includes("generate") ? Sparkles : Wrench
  const isRunning = loading || tool.status === "running"

  return (
    <div className="rounded-lg border bg-background/70 p-2">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-2 text-left text-xs text-muted-foreground">
        <Icon className={cn("size-3.5", isRunning && "animate-pulse")} aria-hidden />
        <span className={cn("flex-1", isRunning && "agent-tool-name-shimmer")}>{tool.label}</span>
        {isRunning ? <Spinner className="size-3.5" /> : <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />}
      </button>
      {open && !isRunning ? (
        <div className="mt-2 rounded-md bg-muted/40 p-2">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Output</div>
          <p className="mt-1 text-xs text-foreground/90">{tool.output}</p>
        </div>
      ) : null}
      {isRunning ? <div className="mt-2 text-[11px] text-muted-foreground">Running federated audit tool…</div> : null}
    </div>
  )
}

function ChatBubble({ message, loading }: { message: AuditChatMessage; loading?: boolean }) {
  const user = message.role === "user"
  return (
    <div className={cn("flex", user ? "justify-end" : "justify-start")}>
      <div className={cn("px-4 py-3 text-sm", user ? "max-w-[92%] rounded-xl border-primary/20 bg-primary/10" : "w-full")}>
        <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
        {message.files?.length ? (
          <div className="mt-3 grid gap-2">
            {message.files.map((file) => (
              <div key={file.name} className="flex items-center gap-2 rounded-lg border bg-background/70 px-2 py-1.5">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{file.name}</div>
                  <div className="text-[10px] text-muted-foreground">{file.type} · {file.size}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {message.tools?.length ? (
          <div className="mt-3 grid gap-2">
            {message.tools.map((tool, index) => (
              <ToolCallBlock key={tool.id} tool={tool} loading={loading && index === message.tools!.length - 1} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function AuditChatPanel({ step, isLoading }: { step: AuditStep; isLoading?: boolean }) {
  const [draft, setDraft] = React.useState("Generate the next report section and cite the evidence used.")
  const [files, setFiles] = React.useState<Array<FileUIPart>>([])
  const messages = step.chat

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-background shadow-xs">
      <div className="min-h-0 flex-1 overflow-auto px-4 py-4 pb-28">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          {messages.map((message, index) => (
            <ChatBubble key={message.id} message={message} loading={isLoading && index === messages.length - 1} />
          ))}
          {isLoading ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground shadow-xs">
                <Spinner className="size-3.5" /> Synthesizing slide artifact…
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="sticky bottom-0 z-10 shrink-0 bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl">
          <AgentInput
            className="p-4"
            value={draft}
            onChange={setDraft}
            files={files}
            onFilesChange={setFiles}
            onSubmit={() => setDraft("Generate the next report section and cite the evidence used.")}
            isDisabled={!draft.trim() && files.length === 0}
          />
        </div>
      </div>
    </section>
  )
}
