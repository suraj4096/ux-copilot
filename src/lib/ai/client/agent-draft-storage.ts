const STORAGE_PREFIX = "uxcopilot_agent_form_draft_v2:"

export function stageAgentFormDraft(draftId: string, form: unknown) {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.setItem(STORAGE_PREFIX + draftId, JSON.stringify(form))
}

export function readAgentFormDraft(draftId: string): unknown | undefined {
  if (typeof sessionStorage === "undefined") return undefined
  const raw = sessionStorage.getItem(STORAGE_PREFIX + draftId)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
}

export function discardAgentFormDraft(draftId: string) {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.removeItem(STORAGE_PREFIX + draftId)
}
