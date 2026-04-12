import { stageAgentFormDraft } from "@/lib/ai/client/agent-draft-storage"

export type NavigateToAgentFormEditor = (opts: {
  to: "/surveys/$surveyId/form"
  params: { surveyId: string }
  search?: { cloneFrom?: string; agentDraft?: string }
}) => void | Promise<void>

type OpenFormEditorOk = {
  ok: true
  surveyId: string
  cloneFromFormId: string | null
  stagedForm: unknown | null
}

export function isOpenFormEditorOk(value: unknown): value is OpenFormEditorOk {
  if (value === null || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return (
    o.ok === true &&
    typeof o.surveyId === "string" &&
    (o.cloneFromFormId === null || typeof o.cloneFromFormId === "string")
  )
}

export function applyOpenFormEditorResult(
  navigate: NavigateToAgentFormEditor,
  result: unknown,
) {
  if (!isOpenFormEditorOk(result)) return

  if (result.stagedForm != null) {
    const draftId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    stageAgentFormDraft(draftId, result.stagedForm)
    navigate({
      to: "/surveys/$surveyId/form",
      params: { surveyId: result.surveyId },
      search: { agentDraft: draftId },
    })
    return
  }

  if (result.cloneFromFormId) {
    navigate({
      to: "/surveys/$surveyId/form",
      params: { surveyId: result.surveyId },
      search: { cloneFrom: result.cloneFromFormId },
    })
    return
  }

  navigate({
    to: "/surveys/$surveyId/form",
    params: { surveyId: result.surveyId },
    search: {},
  })
}
