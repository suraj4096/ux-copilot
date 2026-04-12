import { getToolName, isToolUIPart } from "ai"
import type { UIMessage } from "ai"

export function lastOpenFormEditorInvocation(
  messages: Array<UIMessage>,
): { toolCallId: string; output: unknown } | undefined {
  for (let mi = messages.length - 1; mi >= 0; mi--) {
    const m = messages[mi]
    if (m.role !== "assistant") continue
    const parts = m.parts
    for (let pi = parts.length - 1; pi >= 0; pi--) {
      const part = parts[pi]
      if (!isToolUIPart(part)) continue
      if (getToolName(part) !== "open_form_editor") continue
      if (part.state !== "output-available") continue
      if ("preliminary" in part && part.preliminary === true) continue
      return { toolCallId: part.toolCallId, output: part.output }
    }
  }
  return undefined
}

export function lastOpenFormEditorOutput(
  messages: Array<UIMessage>,
): unknown | undefined {
  return lastOpenFormEditorInvocation(messages)?.output
}
