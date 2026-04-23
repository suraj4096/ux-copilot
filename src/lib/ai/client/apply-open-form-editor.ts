import { stageAgentFormDraft } from "@/lib/ai/client/agent-draft-storage"

export type NavigateToAgentFormEditor = (opts: {
  to: "/surveys/$surveyId/form"
  params: { surveyId: string }
  search?: { cloneFrom?: string; agentDraft?: string }
}) => void | Promise<void>

type OpenFormEditorOk = {
  ok: true
  form: unknown | null
  surveyId?: string | null
}

export function isOpenFormEditorOk(value: unknown): value is OpenFormEditorOk {
  if (value === null || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return o.ok === true && "form" in o
}

export function applyOpenFormEditorResult(
  navigate: NavigateToAgentFormEditor,
  result: unknown,
  context?: { surveyId?: string; cloneFromFormId?: string | null },
) {
  if (!isOpenFormEditorOk(result)) return

  const surveyId = result.surveyId ?? context?.surveyId
  if (result.form != null && surveyId) {
    stageAgentFormDraft(result.form)
    navigate({
      to: "/surveys/$surveyId/form",
      params: { surveyId },
      search: { agentDraft: `${Date.now()}` },
    })
    return
  }

  if (context?.cloneFromFormId && surveyId) {
    navigate({
      to: "/surveys/$surveyId/form",
      params: { surveyId },
      search: { cloneFrom: context.cloneFromFormId },
    })
    return
  }

  if (surveyId) {
    navigate({
      to: "/surveys/$surveyId/form",
      params: { surveyId },
      search: {},
    })
  }
}
