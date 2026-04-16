const STORAGE_PREFIX = "uxcopilot_agent_draw_draft_v1:"

export function stageAgentDrawDraft(draftId: string, diagram: unknown) {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.setItem(STORAGE_PREFIX + draftId, JSON.stringify(diagram))
}

export function readAgentDrawDraft(draftId: string): unknown | undefined {
  if (typeof sessionStorage === "undefined") return undefined
  const raw = sessionStorage.getItem(STORAGE_PREFIX + draftId)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
}

export function discardAgentDrawDraft(draftId: string) {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.removeItem(STORAGE_PREFIX + draftId)
}

