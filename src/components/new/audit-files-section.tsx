"use client"

import * as React from "react"
import {
  CheckCircle2,
  FileImage,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuditEvidenceFile = {
  id: string
  name: string
  size: number
  type: string
  kind: "PDF" | "Image"
  status: "indexing" | "indexed"
  previewUrl?: string
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function isSupportedFile(file: File) {
  return file.type === "application/pdf" || file.type.startsWith("image/")
}

export function AuditFilesSection() {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = React.useState<Array<AuditEvidenceFile>>([])
  const [dragActive, setDragActive] = React.useState(false)

  const addFiles = React.useCallback((items: FileList | Array<File>) => {
    const nextFiles = Array.from(items)
      .filter(isSupportedFile)
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        kind: file.type === "application/pdf" ? "PDF" as const : "Image" as const,
        status: "indexing" as const,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }))

    if (!nextFiles.length) return
    setFiles((current) => [...nextFiles, ...current])
  }, [])

  React.useEffect(() => {
    const timers = files
      .filter((file) => file.status === "indexing")
      .map((file, index) => window.setTimeout(() => {
        setFiles((current) => current.map((item) => item.id === file.id ? { ...item, status: "indexed" } : item))
      }, 900 + index * 250))

    return () => timers.forEach(window.clearTimeout)
  }, [files])

  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
      })
    }
  }, [files])

  return (
    <section className="border-b bg-background">
      <div className="space-y-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence files</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">PDFs and images for audit indexing</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="size-3.5" aria-hidden /> Upload
          </Button>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files)
            event.target.value = ""
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragActive(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            event.preventDefault()
            setDragActive(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragActive(false)
            addFiles(event.dataTransfer.files)
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-3 py-4 text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/25 hover:bg-muted/40",
          )}
        >
          <Upload className="size-4 text-muted-foreground" aria-hidden />
          <span className="mt-1 text-xs font-medium">Drop files here</span>
          <span className="text-[11px] text-muted-foreground">PDF, PNG, JPG, GIF, WebP</span>
        </button>

        {files.length ? (
          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {files.map((file) => {
              const Icon = file.kind === "PDF" ? FileText : FileImage
              return (
                <div key={file.id} className="flex items-center gap-2 rounded-xl border bg-card p-2">
                  <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {file.previewUrl ? (
                      <img src={file.previewUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <Icon className="size-4 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">{file.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>{file.kind}</span>
                      <span>·</span>
                      <span>{formatBytes(file.size)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {file.status === "indexed" ? (
                      <CheckCircle2 className="size-3.5 text-chart-2" aria-label="Indexed" />
                    ) : (
                      <Loader2 className="size-3.5 animate-spin text-chart-4" aria-label="Indexing" />
                    )}
                    <button
                      type="button"
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
                        setFiles((current) => current.filter((item) => item.id !== file.id))
                      }}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
