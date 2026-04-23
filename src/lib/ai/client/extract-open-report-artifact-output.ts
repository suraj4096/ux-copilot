import { getToolName, isToolUIPart } from "ai"
import type { UIMessage } from "ai"
import { isReportDraftToolOutput } from "@/lib/ai/client/apply-open-report-artifact"

const reportToolNames = new Set([
  "open_report_artifact",
  "patch_report_lines",
  "replace_report_section",
  "append_report_section",
])

export function lastOpenReportArtifactInvocation(
  messages: Array<UIMessage>,
): { toolCallId: string; output: unknown } | undefined {
  for (let mi = messages.length - 1; mi >= 0; mi--) {
    const m = messages[mi]
    if (m.role !== "assistant") continue
    const parts = m.parts
    for (let pi = parts.length - 1; pi >= 0; pi--) {
      const part = parts[pi]
      if (!isToolUIPart(part)) continue
      if (!reportToolNames.has(getToolName(part))) continue
      if (part.state !== "output-available") continue
      if ("preliminary" in part && part.preliminary === true) continue
      if (!isReportDraftToolOutput(part.output)) continue
      return { toolCallId: part.toolCallId, output: part.output }
    }
  }
  return undefined
}
