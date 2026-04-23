import { createOpenAI } from "@ai-sdk/openai"

import {
  createSurveyTools,
  surveyToolNames,
} from "@/lib/ai/server/tools/survey"
import { createDrawTools, drawToolNames } from "@/lib/ai/server/tools/draw"
import {
  createReportTools,
  reportToolNames,
} from "@/lib/ai/server/tools/report"

export function createOpenAIModel(modelId: string) {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openai(modelId)
}

export const agentModes = ["auto", "survey", "draw", "report"] as const
export type AgentMode = (typeof agentModes)[number]

export function listToolNamesForMode(mode: AgentMode): Array<string> {
  if (mode === "survey") return [...surveyToolNames]
  if (mode === "draw") return [...drawToolNames]
  if (mode === "report") return [...reportToolNames]
  return []
}

export function createAgentTools(ownerEmail: string, mode: AgentMode) {
  if (mode === "survey") return createSurveyTools(ownerEmail)
  if (mode === "draw") return createDrawTools(ownerEmail)
  if (mode === "report") return createReportTools(ownerEmail)
  return {}
}
