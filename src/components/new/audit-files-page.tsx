"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FileImage, FileText, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { auditApi } from "@/lib/audit-api"

export function AuditFilesPage({ auditId }: { auditId: string }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()
  const filesQuery = useQuery({ queryKey: ["audit", auditId, "files"], queryFn: () => auditApi.getAuditFiles(auditId) })
  const uploadMutation = useMutation({
    mutationFn: (files: Array<File>) => auditApi.uploadAuditFiles(auditId, files),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["audit", auditId, "files"] })
      await queryClient.invalidateQueries({ queryKey: ["audits"] })
    },
  })

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-5">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Audit files</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Evidence library</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload PDFs and screenshots to be indexed for the audit.</p>
        </div>
        <Button onClick={() => inputRef.current?.click()}><Upload className="size-4" /> Upload files</Button>
      </header>
      <input ref={inputRef} type="file" multiple accept="application/pdf,image/*" className="hidden" onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) uploadMutation.mutate(files); event.target.value = "" }} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        {filesQuery.isLoading ? <Skeleton className="h-64 rounded-2xl" /> : (
          <div className="grid gap-3 lg:grid-cols-2">
            {filesQuery.data?.map((file) => {
              const Icon = file.type === "PDF" ? FileText : FileImage
              return (
                <div key={file.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted"><Icon className="size-5 text-muted-foreground" /></div>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{file.name}</div><div className="mt-1 text-xs text-muted-foreground">{file.type} · {file.size} · {file.indexedChunks ?? 0} chunks</div></div>
                  <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">{file.status}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
