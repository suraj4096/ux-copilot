"use client"

import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { FileSearch, Files, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { auditApi } from "@/lib/audit-api"

export function AuditListPage() {
  const auditsQuery = useQuery({ queryKey: ["audits"], queryFn: auditApi.listAudits })

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="border-b px-6 py-5">
        <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Workspace</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">UX Audit chats</h1>
        <p className="mt-1 text-sm text-muted-foreground">Select an audit scenario to open the generated report workspace.</p>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-6">
        {auditsQuery.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {auditsQuery.data?.map((audit) => (
              <article key={audit.id} className="rounded-2xl border bg-card p-5 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <FileSearch className="size-4 text-chart-3" aria-hidden />
                      <span className="truncate">{audit.projectTitle}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{audit.description}</p>
                  </div>
                  <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-xs capitalize text-muted-foreground">{audit.status}</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-xl bg-muted/40 p-3"><div className="text-xs text-muted-foreground">Files</div><div className="font-semibold">{audit.fileCount}</div></div>
                  <div className="rounded-xl bg-muted/40 p-3"><div className="text-xs text-muted-foreground">Slides</div><div className="font-semibold">{audit.stepCount}</div></div>
                  <div className="rounded-xl bg-muted/40 p-3"><div className="text-xs text-muted-foreground">Done</div><div className="font-semibold">{audit.completedSteps}</div></div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Files className="size-3.5" /> Updated {new Date(audit.updatedAt).toLocaleDateString()}</div>
                  <Button size="sm" render={<Link to="/new/$auditId" params={{ auditId: audit.id }} />}>Open audit</Button>
                </div>
              </article>
            ))}
          </div>
        )}
        {auditsQuery.isFetching && !auditsQuery.isLoading ? <Loader2 className="mt-4 size-4 animate-spin text-muted-foreground" /> : null}
      </div>
    </main>
  )
}
