const TRAILING_ID = /\s*\(id:\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\)/gi

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/\n/g, " ")
}

function transformOutsideFencedCode(markdown: string, mapOutside: (s: string) => string): string {
  const parts = markdown.split(/(```[\s\S]*?```)/g)
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part
      return mapOutside(part)
    })
    .join("")
}

function markdownInlineAppPathsToChipSyntax(s: string): string {
  return s.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (_full, label: string, path: string) => {
    const t = label.trim()
    const p = path.trim()
    if (!p.startsWith("/")) return _full
    return `[[${t}:${p}]]`
  })
}

function replaceCopilotChips(s: string): string {
  return s.replace(/\[\[([\s\S]+?):(\/[^\]]+)\]\]/g, (full, title: string, href: string) => {
    const t = title.trim()
    const h = href.trim()
    if (!h.startsWith("/")) return full
    return `<copilot-chip data-title="${escapeHtmlAttr(t)}" data-href="${escapeHtmlAttr(h)}"></copilot-chip>`
  })
}

function applyCopilotSyntax(s: string): string {
  return replaceCopilotChips(markdownInlineAppPathsToChipSyntax(s))
}

const UUID_RE = String.raw`[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`

function stripIdDisclosurePhrases(s: string): string {
  return s.replace(
    new RegExp(String.raw`\s*[—–-]\s*ID:\s*${UUID_RE}`, "gi"),
    "",
  )
}

function assistantProseTransforms(s: string): string {
  return applyCopilotSyntax(stripIdDisclosurePhrases(s))
}

export function preprocessAssistantMarkdown(markdown: string): string {
  let s = markdown.replace(TRAILING_ID, "")
  s = transformOutsideFencedCode(s, assistantProseTransforms)
  return s
}
