import { convertToModelMessages, isTextUIPart, stepCountIs, streamText } from "ai"
import type { UIMessage } from "ai"

import {
  agentClientContextSchema,
  formatAgentClientContextForSystem,
} from "@/lib/ai/client-agent-context"
import {
  getAgentChatModelId,
  getAgentMaxSteps,
  requireOpenAIApiKey,
} from "@/lib/ai/config"
import { agentSystemPrompt } from "@/lib/ai/prompts/agent-system"
import {
  agentModes,
  createAgentTools,
  createOpenAIModel,
  listToolNamesForMode,
  type AgentMode,
} from "@/lib/ai/server/agent-tools"

type AgentCurrentContext = { screen: string; context: string } | null | undefined

function normalizeAgentMode(mode: unknown): AgentMode {
  if (typeof mode !== "string") return "auto"
  const normalized = mode.trim().toLowerCase()
  if (agentModes.includes(normalized as AgentMode)) {
    return normalized as AgentMode
  }
  return "auto"
}

function formatToolAvailability(mode: AgentMode, routedMode: AgentMode): string {
  const names = listToolNamesForMode(routedMode)
  const namesText = names.length > 0 ? names.join(", ") : "none"
  if (mode === "auto") {
    return `Current agent mode: auto (routed to ${routedMode}). Available tools: ${namesText}.`
  }
  return `Current agent mode: ${mode}. Available tools: ${namesText}.`
}

function uiMessageToText(message: UIMessage): string {
  const parts = (message as any).parts ?? []
  const text = Array.isArray(parts)
    ? parts
        .filter(isTextUIPart)
        .map((p: any) => p.text)
        .join("\n")
    : ""
  return text.trim()
}

function formatTranscriptBlock(messages: Array<UIMessage>): {
  previous: string
  current: string
} {
  if (messages.length === 0) return { previous: "(none)", current: "(none)" }
  const prev = messages.slice(0, -1)
  const cur = messages.at(-1)!
  const prevLines = prev.length
    ? prev
        .map((m) => {
          const t = uiMessageToText(m)
          const short = t ? t : "(non-text message)"
          return `- ${m.role}: ${short}`
        })
        .join("\n")
    : "(none)"
  const curText = uiMessageToText(cur) || "(non-text message)"
  return { previous: prevLines, current: `${cur.role}: ${curText}` }
}

function buildSystemPrompt(options: {
  mode: AgentMode
  routedMode: AgentMode
  clientContext?: unknown
  currentContext?: AgentCurrentContext
  messages: Array<UIMessage>
}): string {
  const modeLine = formatToolAvailability(options.mode, options.routedMode)

  const parsed = agentClientContextSchema.safeParse(options.clientContext)
  const contextSection = parsed.success
    ? `\n\n${formatAgentClientContextForSystem(parsed.data)}`
    : ""

  const currentContextSection =
    options.currentContext && typeof options.currentContext === "object"
      ? `\n\n## Current context\nscreen: ${options.currentContext.screen}\ncontext: ${options.currentContext.context}`
      : "\n\n## Current context\n(none)"

  const transcript = formatTranscriptBlock(options.messages)

  return [
    "## System prompt",
    agentSystemPrompt,
    "",
    "## Tools",
    modeLine,
    contextSection.trim() ? `\n\n${contextSection.trim()}` : "",
    currentContextSection,
    "",
    "## Previous messages (last 4)",
    transcript.previous,
    "",
    "## Current message",
    transcript.current,
  ]
    .filter(Boolean)
    .join("\n")
}

export async function runAgentChatStream(options: {
  messages: Array<UIMessage>
  ownerEmail: string
  mode?: unknown
  clientContext?: unknown
  currentContext?: AgentCurrentContext
}) {
  const mode = normalizeAgentMode(options.mode)
  const routedMode = resolveAutoMode({
    mode,
    currentContext: options.currentContext,
    messages: options.messages,
  })
  // eslint-disable-next-line no-console
  console.log("[runAgentChat] mode", mode, "routedMode", routedMode)
  requireOpenAIApiKey()
  const model = createOpenAIModel(getAgentChatModelId())
  const tools = createAgentTools(options.ownerEmail, routedMode)
  // eslint-disable-next-line no-console
  console.log("[runAgentChat] tools", Object.keys(tools))
  const hasTools = Object.keys(tools).length > 0

  const windowedMessages = options.messages.slice(-5)
  const messages = hasTools
    ? await convertToModelMessages(windowedMessages, { tools })
    : await convertToModelMessages(windowedMessages)

  const system = buildSystemPrompt({
    mode,
    routedMode,
    clientContext: options.clientContext,
    currentContext: options.currentContext,
    messages: windowedMessages,
  })

  if (!hasTools) {
    return streamText({ model, system, messages })
  }

  return streamText({
    model,
    system,
    messages,
    tools,
    stopWhen: stepCountIs(getAgentMaxSteps()),
  })
}

function resolveAutoMode(options: {
  mode: AgentMode
  currentContext?: AgentCurrentContext
  messages: Array<UIMessage>
}): AgentMode {
  if (options.mode !== "auto") return options.mode

  const screen = options.currentContext?.screen?.trim().toLowerCase() ?? ""
  if (screen === "draw" || screen.includes("draw")) return "draw"
  if (screen === "survey" || screen.includes("survey") || screen.includes("form")) {
    return "survey"
  }

  const latest = options.messages.at(-1)
  const latestText = latest ? uiMessageToText(latest) : ""
  const t = latestText.toLowerCase()

  const looksLikeDrawIntent =
    /\b(user flow|user-flow|flowchart|diagram|wireflow|draw|decision|diamond|start|end)\b/.test(
      t,
    ) || /\bvalidate_draw_json\b/.test(t)

  if (looksLikeDrawIntent) return "draw"
  return "survey"
}
