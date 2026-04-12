"use client"

import { useMemo, useState } from "react"

import type { FormSchema } from "@/lib/forms/types"
import type {ResponseTableRow} from "@/lib/forms/response-display";
import { FormResponseViewDialog } from "@/components/form-response-view-dialog"
import { questionColumnPreset } from "@/components/form-responses-presentation"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { buildResponseTableRows } from "@/lib/forms/response-display"
import { copilotResponseAnchorId } from "@/lib/copilot-links"
import { cn } from "@/lib/utils"

export function FormResponsesCards({
  form,
  responses,
  deletePendingId,
  highlightResponseId,
  assignCopilotAnchorId,
  onDeleteResponse,
}: {
  form: FormSchema
  responses: Array<{
    id: string
    submittedAt: Date | string
    answers: unknown
  }>
  deletePendingId: string | null
  highlightResponseId?: string
  assignCopilotAnchorId?: boolean
  onDeleteResponse: (responseId: string) => void
}) {
  const rows = useMemo(
    () => buildResponseTableRows(form, responses),
    [form, responses],
  )

  const presets = useMemo(
    () => form.questions.map((q) => questionColumnPreset(q)),
    [form.questions],
  )

  const [detailRow, setDetailRow] = useState<ResponseTableRow | null>(null)

  function formatSubmittedAt(value: Date | string) {
    return typeof value === "string"
      ? value
      : new Date(value).toLocaleString()
  }

  return (
    <TooltipProvider delay={250}>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {rows.map((row) => (
          <article
            id={
              assignCopilotAnchorId
                ? copilotResponseAnchorId(row.responseId)
                : undefined
            }
            key={row.responseId}
            className={cn(
              "flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm scroll-mt-4",
              highlightResponseId === row.responseId
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : row.payloadErrors.length > 0 &&
                    "ring-2 ring-destructive/25 ring-offset-2 ring-offset-background",
            )}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {formatSubmittedAt(row.submittedAt)}
                </p>
                {row.payloadErrors.length > 0 ? (
                  <p
                    className="text-xs text-destructive"
                    title={row.payloadErrors.join(" · ")}
                  >
                    Stored answers did not fully validate
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="View full response"
                  onClick={() => setDetailRow(row)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deletePendingId === row.responseId}
                  onClick={() => onDeleteResponse(row.responseId)}
                >
                  {deletePendingId === row.responseId ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </header>
            <div className="divide-y">
              {row.cells.map((cell, i) => {
                const question = form.questions.find((q) => q.id === cell.questionId)
                if (question === undefined) return null
                const { Icon, typeLabel } = presets[i]
                return (
                  <div
                    key={cell.questionId}
                    className="flex gap-3 px-4 py-3"
                  >
                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/80 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label={`${typeLabel} question`}
                      >
                        <Icon className="size-3.5" strokeWidth={2} />
                      </TooltipTrigger>
                      <TooltipContent side="right" align="start" className="max-w-xs">
                        <span className="font-medium">{question.label}</span>
                        <p className="mt-1 text-xs text-background/85">
                          {typeLabel}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-background/70">
                          {question.id}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {question.label}
                        {question.required ? (
                          <span className="text-destructive" aria-hidden>
                            {" "}
                            *
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 wrap-break-word text-sm text-foreground">
                        {cell.display}
                      </p>
                      {cell.error ? (
                        <p className="mt-1 text-xs text-destructive">
                          {cell.error}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </div>
      <FormResponseViewDialog
        form={form}
        row={detailRow}
        open={detailRow !== null}
        onOpenChange={(next) => {
          if (!next) setDetailRow(null)
        }}
      />
    </TooltipProvider>
  )
}
