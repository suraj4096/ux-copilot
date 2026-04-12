"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import { googlecode } from "react-syntax-highlighter/dist/cjs/styles/hljs"
import rehypeRaw from "rehype-raw"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"

import { MarkdownCopilotChip } from "@/components/markdown-copilot-chip"
import { preprocessAssistantMarkdown } from "@/lib/assistant-markdown-preprocess"
import { cn } from "@/lib/utils"

const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "copilot-chip"],
  attributes: {
    ...defaultSchema.attributes,
    "copilot-chip": ["dataTitle", "dataHref"],
  },
}

type MarkdownCodeProps = React.ComponentPropsWithoutRef<"code"> & {
  inline?: boolean
  node?: unknown
}

function MarkdownCodeBlock({
  className,
  children,
  inline: inlineProp,
  node: _node,
  ...rest
}: MarkdownCodeProps) {
  const match = /language-(\w+)/.exec(className ?? "")
  const codeString = String(children).replace(/\n$/, "")
  const inline =
    inlineProp === true ||
    (!match && !codeString.includes("\n"))

  if (inline) {
    return (
      <code
        className={cn(
          "rounded bg-muted px-1 py-0.5 font-mono text-[0.875em]",
          className,
        )}
        {...rest}
      >
        {children}
      </code>
    )
  }

  const language = match?.[1] ?? "text"

  return (
    <div className="relative my-2 overflow-hidden rounded-md border border-border text-[13px]">
      <SyntaxHighlighter
        style={googlecode}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "0.75rem 1rem",
          background: "var(--muted)",
          fontSize: "0.8125rem",
          lineHeight: 1.55,
        }}
        codeTagProps={{
          className: "font-mono",
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  )
}

const markdownComponents = {
  code: MarkdownCodeBlock,
  pre({ children }) {
    return <>{children}</>
  },
  "copilot-chip": MarkdownCopilotChip,
} as Components

export interface MarkdownProps {
  markdown: string
  className?: string
}

function MarkdownComponent({ markdown, className }: MarkdownProps) {
  const processed = preprocessAssistantMarkdown(markdown)
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-foreground leading-relaxed tracking-wide",
        "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
        "prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm",
        "prose-p:text-sm prose-p:leading-relaxed",
        "prose-li:text-sm prose-li:marker:text-muted-foreground",
        "prose-ul:ps-4 prose-ol:ps-4 prose-li:ps-2",
        "prose-strong:text-foreground prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline",
        "prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-transparent prose-pre:p-0",
        "prose-blockquote:border-border prose-blockquote:text-muted-foreground",
        "prose-hr:border-border",
        "prose-table:text-sm",
        "dark:prose-invert",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]]}
        components={markdownComponents}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}

export const Markdown = memo(
  MarkdownComponent,
  (prev, next) =>
    prev.markdown === next.markdown && prev.className === next.className,
)
