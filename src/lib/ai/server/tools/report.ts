import { tool } from "ai"
import { z } from "zod"

const reportMarkdownSchema = z
  .string()
  .trim()
  .min(1, "Report markdown is required")

const reportTitleSchema = z
  .string()
  .trim()
  .max(120, "Report title is too long")
  .optional()

const reportLineSchema = z.number().int().min(1)

const reportBaseSchema = z.object({
  markdown: reportMarkdownSchema,
  title: reportTitleSchema,
})

const reportHeadingSchema = z
  .string()
  .trim()
  .min(1, "Section heading is required")

const reportSectionContentSchema = z
  .string()
  .trim()
  .min(1, "Section content is required")

export const reportToolNames = [
  "open_report_artifact",
  "view_report_lines",
  "search_report_text",
  "patch_report_lines",
  "replace_report_section",
  "append_report_section",
] as const

type ReportDraft = {
  markdown: string
  title?: string
}

function normalizeTitle(title: string | undefined): string | undefined {
  return title && title.length > 0 ? title : undefined
}

function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/\r\n/g, "\n")
}

function splitLines(markdown: string): Array<string> {
  return normalizeMarkdown(markdown).split("\n")
}

function buildStagedReport(markdown: string, title: string | undefined): ReportDraft {
  return {
    markdown,
    title: normalizeTitle(title),
  }
}

function clampLineRange(input: {
  startLine: number
  endLine: number
  totalLines: number
}): { ok: true; startIdx: number; endIdx: number } | { ok: false; error: string } {
  const { startLine, endLine, totalLines } = input
  if (startLine > endLine) {
    return { ok: false, error: "startLine must be less than or equal to endLine" }
  }
  if (startLine < 1 || endLine < 1) {
    return { ok: false, error: "Line numbers must be >= 1" }
  }
  if (totalLines === 0) {
    return { ok: false, error: "Report is empty" }
  }
  if (startLine > totalLines || endLine > totalLines) {
    return {
      ok: false,
      error: `Line range is out of bounds. Report has ${totalLines} line(s).`,
    }
  }
  return { ok: true, startIdx: startLine - 1, endIdx: endLine - 1 }
}

function normalizeHeadingText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

function findSectionRange(lines: Array<string>, heading: string) {
  const target = normalizeHeadingText(heading)
  const headingRegex = /^(#{1,6})\s+(.*)$/

  let start = -1
  let level = -1
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(headingRegex)
    if (!match) continue
    const candidate = normalizeHeadingText(match[2])
    if (candidate !== target) continue
    start = i
    level = match[1].length
    break
  }

  if (start < 0 || level < 0) return null

  let end = lines.length - 1
  for (let i = start + 1; i < lines.length; i++) {
    const match = lines[i].match(headingRegex)
    if (!match) continue
    const nextLevel = match[1].length
    if (nextLevel <= level) {
      end = i - 1
      break
    }
  }

  return { start, end }
}

export function createReportTools(_ownerEmail: string) {
  return {
    open_report_artifact: tool({
      description:
        "Open the report artifact panel with generated markdown content. Use this after composing a UX report in markdown.",
      inputSchema: reportBaseSchema,
      execute: ({ markdown, title }) => {
        return {
          ok: true as const,
          stagedReport: buildStagedReport(markdown, title),
        }
      },
    }),

    view_report_lines: tool({
      description:
        "View a specific inclusive line range from the current report markdown. Use this before precise edits.",
      inputSchema: reportBaseSchema.extend({
        startLine: reportLineSchema,
        endLine: reportLineSchema,
      }),
      execute: ({ markdown, startLine, endLine }) => {
        const lines = splitLines(markdown)
        const range = clampLineRange({ startLine, endLine, totalLines: lines.length })
        if (!range.ok) {
          return { ok: false as const, error: range.error, totalLines: lines.length }
        }

        const slice = lines
          .slice(range.startIdx, range.endIdx + 1)
          .map((line, idx) => ({
            lineNumber: startLine + idx,
            text: line,
          }))

        return {
          ok: true as const,
          totalLines: lines.length,
          startLine,
          endLine,
          lines: slice,
        }
      },
    }),

    search_report_text: tool({
      description:
        "Search for text in the report markdown and return matching lines with line numbers.",
      inputSchema: reportBaseSchema.extend({
        query: z.string().trim().min(1, "Search query is required"),
        caseSensitive: z.boolean().optional(),
        maxResults: z.number().int().min(1).max(100).optional(),
      }),
      execute: ({ markdown, query, caseSensitive, maxResults }) => {
        const lines = splitLines(markdown)
        const q = caseSensitive ? query : query.toLowerCase()
        const cap = maxResults ?? 20
        const matches: Array<{ lineNumber: number; text: string }> = []

        for (let i = 0; i < lines.length; i++) {
          const haystack = caseSensitive ? lines[i] : lines[i].toLowerCase()
          if (!haystack.includes(q)) continue
          matches.push({ lineNumber: i + 1, text: lines[i] })
          if (matches.length >= cap) break
        }

        return {
          ok: true as const,
          query,
          caseSensitive: caseSensitive ?? false,
          totalLines: lines.length,
          matchCount: matches.length,
          matches,
        }
      },
    }),

    patch_report_lines: tool({
      description:
        "Replace an inclusive line range in report markdown with new markdown text. Returns updated stagedReport.",
      inputSchema: reportBaseSchema.extend({
        startLine: reportLineSchema,
        endLine: reportLineSchema,
        replacement: z.string(),
      }),
      execute: ({ markdown, title, startLine, endLine, replacement }) => {
        const lines = splitLines(markdown)
        const range = clampLineRange({ startLine, endLine, totalLines: lines.length })
        if (!range.ok) {
          return { ok: false as const, error: range.error, totalLines: lines.length }
        }

        const replacementLines = splitLines(replacement)
        const nextLines = [
          ...lines.slice(0, range.startIdx),
          ...replacementLines,
          ...lines.slice(range.endIdx + 1),
        ]
        const nextMarkdown = nextLines.join("\n")

        return {
          ok: true as const,
          changedLines: {
            startLine,
            endLine,
            replacementLineCount: replacementLines.length,
          },
          stagedReport: buildStagedReport(nextMarkdown, title),
        }
      },
    }),

    replace_report_section: tool({
      description:
        "Replace a markdown section by heading text. Matches exact heading text ignoring case and extra spaces. Returns updated stagedReport.",
      inputSchema: reportBaseSchema.extend({
        heading: reportHeadingSchema,
        sectionMarkdown: reportSectionContentSchema,
      }),
      execute: ({ markdown, title, heading, sectionMarkdown }) => {
        const lines = splitLines(markdown)
        const range = findSectionRange(lines, heading)
        if (!range) {
          return {
            ok: false as const,
            error: `Heading not found: ${heading}`,
          }
        }

        const replacementLines = splitLines(sectionMarkdown)
        const nextLines = [
          ...lines.slice(0, range.start),
          ...replacementLines,
          ...lines.slice(range.end + 1),
        ]
        const nextMarkdown = nextLines.join("\n")

        return {
          ok: true as const,
          replaced: {
            heading,
            startLine: range.start + 1,
            endLine: range.end + 1,
            replacementLineCount: replacementLines.length,
          },
          stagedReport: buildStagedReport(nextMarkdown, title),
        }
      },
    }),

    append_report_section: tool({
      description:
        "Append a new markdown section to the end of the report. Returns updated stagedReport.",
      inputSchema: reportBaseSchema.extend({
        sectionMarkdown: reportSectionContentSchema,
      }),
      execute: ({ markdown, title, sectionMarkdown }) => {
        const base = normalizeMarkdown(markdown).trimEnd()
        const section = normalizeMarkdown(sectionMarkdown).trim()
        const nextMarkdown = base.length > 0 ? `${base}\n\n${section}` : section

        return {
          ok: true as const,
          stagedReport: buildStagedReport(nextMarkdown, title),
        }
      },
    }),
  }
}
