const STORAGE_PREFIX = "uxcopilot_agent_report_draft_v1:"

export type AgentReportDraft = {
  markdown: string
  title?: string
}

export function stageAgentReportDraft(draftId: string, report: AgentReportDraft) {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.setItem(STORAGE_PREFIX + draftId, JSON.stringify(report))
}

export function readAgentReportDraft(draftId: string): AgentReportDraft | undefined {
  if (typeof sessionStorage === "undefined") return undefined
  const raw = sessionStorage.getItem(STORAGE_PREFIX + draftId)
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed === null || typeof parsed !== "object") return undefined
    const report = parsed as Record<string, unknown>
    if (typeof report.markdown !== "string") return undefined
    if (
      report.title !== undefined &&
      (typeof report.title !== "string" || report.title.trim().length === 0)
    ) {
      return undefined
    }
    return {
      markdown: report.markdown,
      title: typeof report.title === "string" ? report.title : undefined,
    }
  } catch {
    return undefined
  }
}

export function discardAgentReportDraft(draftId: string) {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.removeItem(STORAGE_PREFIX + draftId)
}
