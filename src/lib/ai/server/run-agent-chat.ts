import { convertToModelMessages, stepCountIs, streamText } from "ai"
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

function normalizeAgentMode(mode: unknown): AgentMode {
  if (typeof mode !== "string") return "auto"
  const normalized = mode.trim().toLowerCase()
  if (agentModes.includes(normalized as AgentMode)) {
    return normalized as AgentMode
  }
  return "auto"
}

function formatToolAvailability(mode: AgentMode): string {
  const names = listToolNamesForMode(mode)
  const namesText = names.length > 0 ? names.join(", ") : "none"
  return `Current agent mode: ${mode}. Available tools: ${namesText}.`
}

function buildSystemPrompt(options: {
  mode: AgentMode
  clientContext?: unknown
}): string {
  const modeLine = formatToolAvailability(options.mode)

  const parsed = agentClientContextSchema.safeParse(options.clientContext)
  const contextSection = parsed.success
    ? `\n\n${formatAgentClientContextForSystem(parsed.data)}`
    : ""

  return `${agentSystemPrompt}\n\n${modeLine}${contextSection}`
}

export async function runAgentChatStream(options: {
  messages: Array<UIMessage>
  ownerEmail: string
  mode?: unknown
  clientContext?: unknown
}) {
  const mode = normalizeAgentMode(options.mode)
  requireOpenAIApiKey()
  const model = createOpenAIModel(getAgentChatModelId())
  const tools = createAgentTools(options.ownerEmail, mode)
  const hasTools = Object.keys(tools).length > 0
  const messages = hasTools
    ? await convertToModelMessages(options.messages, { tools })
    : await convertToModelMessages(options.messages)

  const system = buildSystemPrompt({
    mode,
    clientContext: options.clientContext,
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
