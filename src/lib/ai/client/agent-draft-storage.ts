const STORAGE_KEY = "uxcopilot_agent_form_draft_v2"

export function stageAgentFormDraft(form: unknown) {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
}

export function readAgentFormDraft(): unknown | undefined {
  if (typeof localStorage === "undefined") return undefined
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
}

export function discardAgentFormDraft() {
  if (typeof localStorage === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
