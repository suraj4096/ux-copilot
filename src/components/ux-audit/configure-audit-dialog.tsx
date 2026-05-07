"use client"

import { FileText, Image, Search, Settings, Upload } from "lucide-react"

import type { AuditAgentConfig } from "@/components/ux-audit/data"
import { StatusChip } from "@/components/ux-audit/status-chip"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function ConfigureAuditDialog({ config }: { config: AuditAgentConfig }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Settings className="size-3.5" aria-hidden />
        Configure
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configure Agent</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 space-y-5 overflow-auto pt-4 pr-1">
          <section className="space-y-3 px-2">
            <div>
              <div className="text-sm font-semibold">Custom Instructions</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Provide specific guidelines or context to tailor the audit
                report
              </p>
            </div>
            <Textarea
              defaultValue={config.customInstructions}
              rows={6}
              className="max-h-32 min-h-32 resize-none"
            />
          </section>

          <div className="h-px bg-border" />

          <section className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Search className="size-4" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-semibold">Enable web search</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Search public sources and competitor touchpoints during
                    report generation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-pressed={config.webSearchEnabled}
                className="relative h-6 w-11 rounded-full bg-primary transition-colors"
              >
                <span className="absolute top-0.5 right-0.5 size-5 rounded-full bg-primary-foreground shadow-sm" />
              </button>
            </div>
          </section>

          <section className="space-y-3 px-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">
                  Web masking keywords
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sensitive keywords are replaced before external search and
                  synthesis.
                </p>
              </div>
              <StatusChip text="Enabled" color="chart2" />
            </div>
            <div className="space-y-2">
              {config.maskingRules.map((rule) => (
                <div
                  key={rule.keyword}
                  className="grid gap-2 rounded-lg border bg-background/70 p-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center"
                >
                  <div className="font-medium">{rule.keyword}</div>
                  <div className="text-xs text-muted-foreground">masked as</div>
                  <div className="text-muted-foreground">
                    {rule.replacement}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-border" />

          <section className="space-y-3 px-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">
                  Files and screenshots
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload audit references, product screenshots, and research
                  documents, then index them for retrieval.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="size-3.5" aria-hidden />
                  Upload
                </Button>
                <Button size="sm">Index sources</Button>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-2">
                {config.files.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3 rounded-lg border bg-background/70 p-3"
                  >
                    <FileText
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {file.type} · {file.size}
                      </div>
                    </div>
                    <StatusChip text={file.status} color="chart2" />
                  </div>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {config.screenshots.map((shot) => (
                  <div
                    key={shot.name}
                    className="flex items-center gap-3 rounded-lg border bg-background/70 p-2"
                  >
                    <div
                      className={`flex size-14 shrink-0 items-center justify-center rounded-md ${shot.color}`}
                    >
                      <Image
                        className="size-5 text-muted-foreground"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {shot.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {shot.area}
                      </div>
                    </div>
                    <StatusChip text={shot.status} color="chart2" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <DialogClose render={<Button />}>Save configuration</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
