import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock"
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

export function createBedrockModel(modelId: string) {
  const settings: Parameters<typeof createAmazonBedrock>[0] = {}

  if (process.env.AWS_REGION?.trim()) {
    settings.region = process.env.AWS_REGION.trim()
  }
  if (process.env.AWS_ACCESS_KEY_ID?.trim()) {
    settings.accessKeyId = process.env.AWS_ACCESS_KEY_ID.trim()
  }
  if (process.env.AWS_SECRET_ACCESS_KEY?.trim()) {
    settings.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY.trim()
  }
  if (process.env.AWS_SESSION_TOKEN?.trim()) {
    settings.sessionToken = process.env.AWS_SESSION_TOKEN.trim()
  }
  if (process.env.AWS_BEARER_TOKEN_BEDROCK?.trim()) {
    settings.apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK.trim()
  }
  if (process.env.BEDROCK_BASE_URL?.trim()) {
    settings.baseURL = process.env.BEDROCK_BASE_URL.trim()
  }

  const bedrock = createAmazonBedrock(settings)
  return bedrock(modelId)
}

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
