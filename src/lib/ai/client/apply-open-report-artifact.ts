import {
  stageAgentReportDraft,
  type AgentReportDraft,
} from "@/lib/ai/client/agent-report-storage"

export type NavigateToReport = (opts: {
  to: "/report"
  search?: { draft?: string }
}) => void | Promise<void>

type OpenReportArtifactOk = {
  ok: true
  stagedReport: AgentReportDraft | null
}

export function isReportDraftToolOutput(
  value: unknown,
): value is OpenReportArtifactOk {
  if (value === null || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  if (o.ok !== true || !("stagedReport" in o)) return false
  const report = o.stagedReport
  if (report === null) return true
  if (typeof report !== "object") return false
  const maybeReport = report as Record<string, unknown>
  if (typeof maybeReport.markdown !== "string") return false
  if (
    maybeReport.title !== undefined &&
    (typeof maybeReport.title !== "string" || maybeReport.title.trim().length === 0)
  ) {
    return false
  }
  return true
}

export const isOpenReportArtifactOk = isReportDraftToolOutput

export function applyOpenReportArtifactResult(
  navigate: NavigateToReport,
  result: unknown,
) {
  if (!isOpenReportArtifactOk(result)) return

  if (result.stagedReport != null) {
    const draftId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    stageAgentReportDraft(draftId, result.stagedReport)
    navigate({ to: "/report", search: { draft: draftId } })
    return
  }

  navigate({ to: "/report", search: {} })
}
