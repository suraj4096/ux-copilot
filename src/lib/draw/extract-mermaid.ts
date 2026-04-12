import { isTextUIPart } from "ai"
import type { UIMessage } from "ai"

function messagePlainText(message: UIMessage): string {
  const parts = message.parts
  if (parts && parts.length > 0) {
    return parts
      .filter(isTextUIPart)
      .map((p) => p.text)
      .join("\n")
  }
  if ("content" in message && message.content) {
    return String(message.content)
  }
  return ""
}

export function extractMermaidFromAssistantMessage(
  message: UIMessage,
): string | null {
  if (message.role !== "assistant") return null
  const text = messagePlainText(message)
  const match = text.match(/```mermaid\s*([\s\S]*?)```/i)
  if (!match) return null
  const inner = match[1].trim()
  return inner.length > 0 ? inner : null
}

export function listMermaidGenerationsFromMessages(
  messages: Array<UIMessage>,
): Array<{ id: number; mermaid: string }> {
  let nextId = 1
  const out: Array<{ id: number; mermaid: string }> = []
  for (const m of messages) {
    const mm = extractMermaidFromAssistantMessage(m)
    if (!mm) continue
    out.push({ id: nextId++, mermaid: mm })
  }
  return out
}

export function mapAssistantMessageIdToMermaidGeneration(
  messages: Array<UIMessage>,
): Map<string, number> {
  const map = new Map<string, number>()
  let nextId = 1
  for (const m of messages) {
    if (m.role !== "assistant") continue
    const mm = extractMermaidFromAssistantMessage(m)
    if (!mm) continue
    map.set(m.id, nextId++)
  }
  return map
}

export function extractLastMermaidFromMessages(
  messages: Array<UIMessage>,
): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== "assistant") continue
    const mm = extractMermaidFromAssistantMessage(m)
    if (mm) return mm
  }
  return null
}
