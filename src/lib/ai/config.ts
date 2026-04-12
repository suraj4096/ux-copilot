export function requireOpenAIApiKey(): string {
  const key = process.env.OPENAI_API_KEY
  if (!key?.trim()) {
    throw new Error("Missing OPENAI_API_KEY")
  }
  return key.trim()
}

export function getAgentChatModelId(): string {
  return process.env.AI_AGENT_MODEL?.trim() || "gpt-4o-mini"
}

export function getAgentMaxSteps(): number {
  const raw = process.env.AI_AGENT_MAX_STEPS?.trim()
  if (!raw) return 20
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 1 && n <= 50 ? n : 20
}
