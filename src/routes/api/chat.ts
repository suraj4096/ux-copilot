import { createFileRoute } from "@tanstack/react-router"

import type { UIMessage } from "ai"
import { getUserFromAuthCookie } from "@/lib/auth.server"
import { runAgentChatStream } from "@/lib/ai/server/run-agent-chat"
import type { AgentCurrentContext } from "@/contexts/agent-context"

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await getUserFromAuthCookie()
        if (!user) {
          return new Response("Unauthorized", { status: 401 })
        }

        let body: {
          messages?: Array<UIMessage>
          mode?: unknown
          clientContext?: unknown
          currentContext?: AgentCurrentContext | null
        }
        try {
          body = (await request.json()) as {
            messages?: Array<UIMessage>
            mode?: unknown
            clientContext?: unknown
            currentContext?: AgentCurrentContext | null
          }
        } catch {
          return new Response("Invalid JSON", { status: 400 })
        }

        const messages = body.messages
        if (!Array.isArray(messages)) {
          return new Response("Expected messages array", { status: 400 })
        }

        try {
          const result = await runAgentChatStream({
            messages,
            ownerEmail: user.email,
            mode: body.mode,
            clientContext: body.clientContext,
            currentContext: body.currentContext,
          })
          return result.toUIMessageStreamResponse()
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Chat request failed"
          const status =
            message.includes("OPENAI_API_KEY") ||
            message.includes("Missing OPENAI")
              ? 503
              : 500
          return new Response(message, { status })
        }
      },
    },
  },
})

