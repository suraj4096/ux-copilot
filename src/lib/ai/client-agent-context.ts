import { z } from "zod"

export const agentRouteKindSchema = z.enum([
  "surveys-list",
  "survey-detail",
  "survey-forms",
  "form-detail",
  "report",
  "login",
  "home",
  "public-form",
  "other",
])

export const agentClientContextSchema = z.object({
  pathname: z.string(),
  search: z.string(),
  routeId: z.string(),
  params: z.record(z.string(), z.string()),
  hints: z.object({
    routeKind: agentRouteKindSchema,
    surveyId: z.string().optional(),
    surveyTitle: z.string().optional(),
    formId: z.string().optional(),
    formTitle: z.string().optional(),
    cloneFromFormId: z.string().optional(),
    agentDraftId: z.string().optional(),
  }),
})

export type AgentClientContext = z.infer<typeof agentClientContextSchema>

export function formatAgentClientContextForSystem(
  ctx: AgentClientContext,
): string {
  const { hints } = ctx
  const lines = [
    "The following describes where the user is in the app right now. Prefer surveyId / formId from here when the user says “this survey”, “these forms”, or “clone that form” without naming an id.",
    `- Path: ${ctx.pathname}${ctx.search}`,
    `- Matched route: ${ctx.routeId}`,
    `- Screen: ${hints.routeKind}`,
  ]
  if (hints.surveyId) lines.push(`- Active surveyId: ${hints.surveyId}`)
  if (hints.surveyTitle) lines.push(`- Active survey title: ${hints.surveyTitle}`)
  if (hints.formId) lines.push(`- Active formId: ${hints.formId}`)
  if (hints.formTitle) lines.push(`- Active form title: ${hints.formTitle}`)
  if (hints.cloneFromFormId) {
    lines.push(`- New-form page cloneFrom form id: ${hints.cloneFromFormId}`)
  }
  if (hints.agentDraftId) {
    lines.push(
      `- New-form page agent draft id (sessionStorage key, ephemeral): ${hints.agentDraftId}`,
    )
  }
  const paramLines = Object.entries(ctx.params).filter(([, v]) => v !== "")
  if (paramLines.length > 0) {
    lines.push(
      `- Route params: ${paramLines.map(([k, v]) => `${k}=${v}`).join(", ")}`,
    )
  }
  return lines.join("\n")
}
