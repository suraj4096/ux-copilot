import { createFileRoute } from "@tanstack/react-router"

import type { UIMessage } from "ai"
import { getUserFromAuthCookie } from "@/lib/auth.server"
import { runDrawAgentChatStream } from "@/lib/ai/server/run-draw-agent-chat"

export const Route = createFileRoute("/api/chat/draw")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await getUserFromAuthCookie()
        if (!user) {
          return new Response("Unauthorized", { status: 401 })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response("Invalid JSON", { status: 400 })
        }

        if (!body || typeof body !== "object") {
          return new Response("Invalid body", { status: 400 })
        }

        const raw = body as Record<string, unknown>
        const messages = raw.messages
        if (!Array.isArray(messages)) {
          return new Response("Expected messages array", { status: 400 })
        }

        let diagramContext: { generationNumber: number; mermaid: string } | undefined
        const dc = raw.diagramContext
        if (dc && typeof dc === "object" && !Array.isArray(dc)) {
          const o = dc as Record<string, unknown>
          const generationNumber = o.generationNumber
          const mermaid = o.mermaid
          if (
            typeof generationNumber === "number" &&
            Number.isInteger(generationNumber) &&
            generationNumber > 0 &&
            typeof mermaid === "string" &&
            mermaid.trim().length > 0
          ) {
            diagramContext = {
              generationNumber,
              mermaid: mermaid.trim(),
            }
          }
        }

        try {
          const result = await runDrawAgentChatStream({
            messages: messages as Array<UIMessage>,
            diagramContext,
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
