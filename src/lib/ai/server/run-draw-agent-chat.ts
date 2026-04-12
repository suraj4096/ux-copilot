import { convertToModelMessages, streamText } from "ai"
import type { UIMessage } from "ai"

import { drawAgentSystemPrompt } from "@/lib/ai/prompts/draw-agent-system"
import { getAgentChatModelId, requireOpenAIApiKey } from "@/lib/ai/config"
import { createOpenAIModel } from "@/lib/ai/server/agent-tools"

export async function runDrawAgentChatStream(options: {
  messages: Array<UIMessage>
  diagramContext?: { generationNumber: number; mermaid: string }
}) {
  requireOpenAIApiKey()
  const model = createOpenAIModel(getAgentChatModelId())
  const messages = await convertToModelMessages(options.messages)

  const diagramSection = options.diagramContext
    ? `\n\n---\nThe user is viewing diagram generation ${options.diagramContext.generationNumber}. Treat the following Mermaid flowchart as the baseline for the next reply when they ask to change, extend, or replace the diagram (unless they clearly describe a different flow from scratch):\n\n\`\`\`mermaid\n${options.diagramContext.mermaid}\n\`\`\`\n\nReply with one updated fenced \`\`\`mermaid block when a diagram is appropriate.`
    : ""

  return streamText({
    model,
    system: drawAgentSystemPrompt + diagramSection,
    messages,
  })
}
