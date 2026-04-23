import { stageAgentDrawDraft } from "@/lib/ai/client/agent-draw-storage"

export type NavigateToDraw = (opts: { to: "/draw"; search?: { draft?: string } }) => void | Promise<void>

type OpenDrawEditorOk = {
  ok: true
  diagram: unknown | null
}

export function isOpenDrawEditorOk(value: unknown): value is OpenDrawEditorOk {
  if (value === null || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return o.ok === true && "diagram" in o
}

export function applyOpenDrawEditorResult(navigate: NavigateToDraw, result: unknown) {
  if (!isOpenDrawEditorOk(result)) return

  if (result.diagram != null) {
    const draftId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    stageAgentDrawDraft(draftId, result.diagram)
    navigate({ to: "/draw", search: { draft: draftId } })
    return
  }

  navigate({ to: "/draw", search: {} })
}

