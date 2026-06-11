"use client"

import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { auditApi } from "@/lib/audit-api"

export function AuditSettingsPage({ auditId }: { auditId: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const auditsQuery = useQuery({ queryKey: ["audits"], queryFn: auditApi.listAudits })
  const settingsQuery = useQuery({ queryKey: ["audit", auditId, "settings"], queryFn: () => auditApi.getAuditSettings(auditId) })
  const [instructions, setInstructions] = React.useState("")
  const [webSearchEnabled, setWebSearchEnabled] = React.useState(false)
  const [maskingRules, setMaskingRules] = React.useState<Array<{ keyword: string; replacement: string }>>([])

  React.useEffect(() => {
    if (!settingsQuery.data) return
    setInstructions(settingsQuery.data.customInstructions)
    setWebSearchEnabled(settingsQuery.data.webSearchEnabled)
    setMaskingRules(settingsQuery.data.maskingRules)
  }, [settingsQuery.data])

  const updateMutation = useMutation({
    mutationFn: () => auditApi.updateAuditSettings(auditId, { customInstructions: instructions, webSearchEnabled, maskingRules }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["audit", auditId, "settings"] }),
  })

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="border-b px-6 py-5">
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground"><Settings className="size-4" /> Audit settings</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Configuration</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tune audit instructions, web search, and masking rules.</p>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-6">
        {settingsQuery.isLoading ? <Skeleton className="h-80 rounded-2xl" /> : (
          <div className="max-w-3xl space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">Web search</div>
                  <p className="mt-1 text-sm text-muted-foreground">Allow the audit agent to enrich uploaded evidence with public market and competitor signals.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={webSearchEnabled}
                    onChange={(event) => setWebSearchEnabled(event.target.checked)}
                    className="size-4 rounded border"
                  />
                  Enabled
                </label>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Masking rules</div>
                  <p className="mt-1 text-sm text-muted-foreground">Terms replaced before audit prompts are sent to the model.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaskingRules((current) => [...current, { keyword: "", replacement: "" }])}
                >
                  Add rule
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {maskingRules.map((rule, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={rule.keyword}
                      onChange={(event) => setMaskingRules((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, keyword: event.target.value } : item))}
                      placeholder="Sensitive term"
                      className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <input
                      value={rule.replacement}
                      onChange={(event) => setMaskingRules((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, replacement: event.target.value } : item))}
                      placeholder="Replacement"
                      className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMaskingRules((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {maskingRules.length === 0 ? <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">No masking rules configured.</div> : null}
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <label className="text-sm font-medium">Custom instructions</label>
              <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows={8} className="mt-2 w-full rounded-lg border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <div className="mt-3 flex justify-end"><Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving…" : "Save settings"}</Button></div>
            </section>

            <section className="pt-2">
              <label className="text-xs font-medium text-muted-foreground">Playable scenario</label>
              <select
                value={auditId}
                onChange={(event) => void navigate({ to: "/new/$auditId/settings", params: { auditId: event.target.value } })}
                className="mt-1 h-8 w-fit max-w-full rounded-md border bg-background px-2 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {auditsQuery.data?.map((audit) => <option key={audit.id} value={audit.id}>{audit.projectTitle}</option>)}
              </select>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
