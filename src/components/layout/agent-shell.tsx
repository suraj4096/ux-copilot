"use client"

import * as React from "react"
import { isTextUIPart } from "ai"
import { ArrowUp, Sparkles, SquarePen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useAgentChat } from "@/contexts/agent-chat-context"
import { greetingByHour } from "@/lib/user-identity"
import { cn } from "@/lib/utils"

function getMessageText(message: { parts?: Array<any> }): string {
  const parts = message.parts ?? []
  return parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("\n")
}

export function AgentShell({ className }: { className?: string }) {
  const { identity, isLoading } = useAuth()
  const chat = useAgentChat()
  const [draft, setDraft] = React.useState("")

  const greeting = greetingByHour(new Date())
  const name = identity?.name || "there"
  const hasMessages = chat.messages.length > 0

  return (
    <section className={cn("flex min-h-0 flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="size-3.5" aria-hidden />
            Canvas
          </div>
          <h2 className="text-sm font-medium text-foreground">
            {isLoading ? "Loading..." : `${greeting}, ${name}`}
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            chat.stop()
            setDraft("")
          }}
        >
          <SquarePen className="size-3.5" aria-hidden />
          New chat
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-b from-background via-background to-muted/15">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 py-4 md:px-6">
          {!hasMessages ? (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-3xl border border-dashed bg-card/70 px-6 py-10 text-center shadow-sm">
              <div className="max-w-xl space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Agentic terminal
                </p>
                <h3 className="text-balance text-2xl font-semibold tracking-tight md:text-4xl">
                  Ask for a survey workflow, a form edit, or a response summary.
                </h3>
                <p className="text-sm text-muted-foreground md:text-base">
                  The chat stays persistent while the route content acts like a canvas or artifact panel.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {chat.messages.map((message) => {
                const text = getMessageText(message)
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex max-w-[92%] rounded-2xl border px-4 py-3 text-sm shadow-sm",
                      message.role === "user"
                        ? "ml-auto border-primary/20 bg-primary/10"
                        : "mr-auto border-border bg-card",
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        {message.role === "user" ? "You" : "UX Copilot"}
                      </div>
                      <div className="whitespace-pre-wrap leading-6 text-foreground">
                        {text}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!draft.trim()) return
            void chat.sendMessage({ text: draft.trim() })
            setDraft("")
          }}
          className="border-t bg-background/95 px-4 py-4 backdrop-blur md:px-6"
        >
          <div className="rounded-3xl border bg-card p-3 shadow-sm">
            <Textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.shiftKey) return
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }}
              placeholder="Ask UX Copilot anything..."
              rows={4}
              className="min-h-24 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for a new line.
              </p>
              <Button type="submit" size="sm" disabled={!draft.trim()} className="rounded-full px-4">
                <ArrowUp className="size-3.5" aria-hidden />
                Send
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}