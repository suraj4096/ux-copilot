"use client"

import { useMemo } from "react"

import type { ResponseTableRow } from "@/lib/forms/response-display"
import type { FormSchema } from "@/lib/forms/types"
import { questionColumnPreset } from "@/components/form/form-responses-presentation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function formatSubmittedAt(value: Date | string) {
  return typeof value === "string"
    ? value
    : new Date(value).toLocaleString()
}

export function FormResponseViewDialog({
  form,
  row,
  open,
  onOpenChange,
}: {
  form: FormSchema
  row: ResponseTableRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const presets = useMemo(
    () => form.questions.map((q) => questionColumnPreset(q)),
    [form.questions],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[min(90dvh,880px)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
        )}
      >
        {row ? (
          <>
            <DialogHeader className="shrink-0 space-y-2 border-b px-6 py-4 pr-12 text-left">
              <DialogTitle className="leading-snug">{form.title}</DialogTitle>
              <DialogDescription>
                Submitted {formatSubmittedAt(row.submittedAt)}
              </DialogDescription>
              <p className="font-mono text-xs text-muted-foreground">
                Response ID: {row.responseId}
              </p>
              {row.payloadErrors.length > 0 ? (
                <div
                  className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  role="alert"
                >
                  {row.payloadErrors.join(" · ")}
                </div>
              ) : null}
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <ol className="space-y-8">
                {row.cells.map((cell, i) => {
                  const question = form.questions.find((q) => q.id === cell.questionId)
                  if (question === undefined) return null
                  const { Icon, typeLabel } = presets[i]
                  return (
                    <li key={cell.questionId} className="scroll-mt-4">
                      <div className="flex gap-4">
                        <span
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/80 text-muted-foreground"
                          aria-hidden
                        >
                          <Icon className="size-4" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-xs font-medium text-muted-foreground">
                              {typeLabel}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {question.id}
                            </span>
                          </div>
                          <h3 className="text-base font-medium leading-snug text-foreground">
                            {question.label}
                            {question.required ? (
                              <span className="text-destructive" aria-hidden>
                                {" "}
                                *
                              </span>
                            ) : null}
                          </h3>
                          <div
                            className={cn(
                              "wrap-break-word rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground",
                              question.type === "long_text" && "whitespace-pre-wrap",
                            )}
                          >
                            {cell.display}
                          </div>
                          {cell.error ? (
                            <p className="text-sm text-destructive">{cell.error}</p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
            <DialogFooter className="m-0 shrink-0 rounded-none border-t bg-muted/50 px-6 py-3 sm:justify-end">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Close
              </DialogClose>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
