"use client"

import * as React from "react"
import { convertFileListToFileUIParts, type FileUIPart } from "ai"
import { ArrowUp, ChevronDown, FileImage, FileText, Plus, X } from "lucide-react"

import { CurrentContextChip } from "@/components/agent/current-context-chip"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAgentMode } from "@/contexts/agent-context"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

function coerceAgentMode(value: unknown): ReturnType<typeof useAgentMode>["mode"] {
  if (value === "auto" || value === "survey" || value === "draw" || value === "report") {
    return value
  }
  if (value && typeof value === "object") {
    const maybeValue = (value as any).value
    if (
      maybeValue === "auto" ||
      maybeValue === "survey" ||
      maybeValue === "draw" ||
      maybeValue === "report"
    ) {
      return maybeValue
    }
  }
  return "auto"
}

function labelForMode(mode: ReturnType<typeof useAgentMode>["mode"]): string {
  switch (mode) {
    case "auto":
      return "Auto"
    case "survey":
      return "Survey"
    case "draw":
      return "Draw"
    case "report":
      return "Report"
  }
}

export function AgentInput({
  value,
  onChange,
  files,
  onFilesChange,
  onSubmit,
  isDisabled,
  className,
}: {
  value: string
  onChange: (value: string) => void
  files: Array<FileUIPart>
  onFilesChange: (files: Array<FileUIPart>) => void
  onSubmit: () => void
  isDisabled?: boolean
  className?: string
}) {
  const { mode, setMode } = useAgentMode()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const appendFileList = React.useCallback(
    async (fileList: FileList | null | undefined) => {
      if (!fileList || fileList.length === 0) return
      const selected = Array.from(fileList)
      const allowed = selected.filter((file) => {
        if (file.type === "application/pdf") return true
        return file.type.startsWith("image/")
      })
      if (allowed.length === 0) return

      const dt = new DataTransfer()
      for (const file of allowed) dt.items.add(file)

      const next = await convertFileListToFileUIParts(dt.files)
      if (next.length === 0) return
      onFilesChange([...files, ...next])
    },
    [files, onFilesChange],
  )

  const removeFileAt = React.useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index))
    },
    [files, onFilesChange],
  )

  const formatBytes = React.useCallback((bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }, [])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className={cn("bg-background/95 backdrop-blur", className)}
    >
      <div className="rounded-4xl border bg-card p-3 shadow-xs">
        <div className="mb-2 flex items-center justify-between gap-2">
          <CurrentContextChip className="min-w-0" />
        </div>
        <Textarea
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
          }}
          onPaste={(event) => {
            const clipboardFiles = event.clipboardData?.files
            if (!clipboardFiles || clipboardFiles.length === 0) return
            event.preventDefault()
            void appendFileList(clipboardFiles)
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }}
          placeholder="Ask anything..."
          rows={4}
          className="min-h-20 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
        />
        {files.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2 px-1">
            {files.map((file, idx) => {
              const isImage = file.mediaType.startsWith("image/")
              const label = file.filename?.trim() || (isImage ? "image" : "document")
              const size = file.url.startsWith("data:")
                ? Math.max(0, Math.floor((file.url.length * 3) / 4) - 2)
                : 0

              return (
                <div
                  key={`${file.url}-${idx}`}
                  className="inline-flex max-w-full items-center gap-2 rounded-lg border bg-muted/40 px-2 py-1"
                >
                  {isImage ? (
                    <FileImage className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="max-w-44 truncate text-xs text-foreground">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{formatBytes(size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFileAt(idx)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Remove ${label}`}
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </div>
              )
            })}
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={(event) => {
                void appendFileList(event.currentTarget.files)
                event.currentTarget.value = ""
              }}
            />

            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                {labelForMode(mode)}
                <ChevronDown className="size-3.5" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuRadioGroup
                  value={mode}
                  onValueChange={(value) => {
                    const next = coerceAgentMode(value)
                    // eslint-disable-next-line no-console
                    console.log("[AgentMode] selected", value, "=>", next)
                    setMode(next)
                  }}
                >
                  <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="survey">
                    Survey
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="draw">Draw</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="report">
                    Report
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={isDisabled}
            className="rounded-full px-4"
          >
            <ArrowUp className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
      <p className="px-4 py-2 text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for a new line. You can attach images or PDFs.
      </p>
    </form>
  )
}
