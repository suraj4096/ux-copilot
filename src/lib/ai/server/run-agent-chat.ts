import {  convertToModelMessages, stepCountIs, streamText } from "ai"
import type {UIMessage} from "ai";

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
import { createAgentTools, createOpenAIModel } from "@/lib/ai/server/agent-tools"

export async function runAgentChatStream(options: {
  messages: Array<UIMessage>
  ownerEmail: string
  clientContext?: unknown
}) {
  requireOpenAIApiKey()
  const model = createOpenAIModel(getAgentChatModelId())
  const tools = createAgentTools(options.ownerEmail)
  const messages = await convertToModelMessages(options.messages, { tools })

  const parsed = agentClientContextSchema.safeParse(options.clientContext)
  const system =
    parsed.success
      ? `${agentSystemPrompt}\n\n${formatAgentClientContextForSystem(parsed.data)}`
      : agentSystemPrompt

  return streamText({
    model,
    system,
    messages,
    tools,
    stopWhen: stepCountIs(getAgentMaxSteps()),
  })
}
