export function requireOpenAIApiKey(): string {
  const key = process.env.OPENAI_API_KEY
  if (!key?.trim()) {
    throw new Error("Missing OPENAI_API_KEY")
  }
  return key.trim()
}

export function isBedrockEnvironment(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID?.trim() ||
      process.env.AWS_SECRET_ACCESS_KEY?.trim() ||
      process.env.AWS_BEARER_TOKEN_BEDROCK?.trim() ||
      process.env.AWS_REGION?.trim() ||
      process.env.AWS_SESSION_TOKEN?.trim(),
  )
}

export function getAgentOpenAIModelId(): string {
  return process.env.AI_AGENT_MODEL?.trim() || "gpt-4o-mini"
}

export function getAgentBedrockModelId(): string | undefined {
  const explicit = process.env.AI_AGENT_BEDROCK_MODEL?.trim()
  if (explicit) return explicit
  if (isBedrockEnvironment()) return "us.amazon.nova-premier-v1:0"
  return undefined
}

export function getAgentChatModelId(): string {
  return getAgentBedrockModelId() ?? getAgentOpenAIModelId()
}

export function getAgentMaxSteps(): number {
  const raw = process.env.AI_AGENT_MAX_STEPS?.trim()
  if (!raw) return 20
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 1 && n <= 50 ? n : 20
}
