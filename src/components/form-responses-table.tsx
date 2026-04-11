"use client"

import { useMemo, useState } from "react"

import { FormResponseViewDialog } from "@/components/form-response-view-dialog"
import { questionColumnPreset } from "@/components/form-responses-presentation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  buildResponseTableRows,
  type ResponseTableRow,
} from "@/lib/forms/response-display"
import type { FormSchema } from "@/lib/forms/types"
import { cn } from "@/lib/utils"

const submittedStickyRightClass = "right-32"

export function FormResponsesTable({
  form,
  responses,
  deletePendingId,
  onDeleteResponse,
}: {
  form: FormSchema
  responses: Array<{
    id: string
    submittedAt: Date | string
    answers: unknown
  }>
  deletePendingId: string | null
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
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            {form.questions.map((q, i) => {
              const { widthClass, typeLabel, Icon } = presets[i]!
              return (
                <TableHead
                  key={q.id}
                  className={cn(
                    widthClass,
                    "align-middle whitespace-normal",
                  )}
                >
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      className={cn(
                        "flex w-full min-w-0 items-center gap-2 rounded-md py-1 pr-1 text-left font-medium",
                        "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {q.label}
                        {q.required ? (
                          <span className="text-destructive" aria-hidden>
                            {" "}
                            *
                          </span>
                        ) : null}
                      </span>
                      <span
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/80 text-muted-foreground"
                        aria-hidden
                      >
                        <Icon className="size-3.5" strokeWidth={2} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs flex flex-col gap-1.5 text-left"
                    >
                      <span className="font-medium leading-snug">
                        {q.label}
                      </span>
                      <span className="text-xs text-background/85">
                        {typeLabel}
                      </span>
                      <span className="font-mono text-[11px] leading-snug text-background/70">
                        {q.id}
                      </span>
                      {q.required ? (
                        <span className="text-xs text-background/85">
                          Required
                        </span>
                      ) : null}
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
              )
            })}
            <TableHead
              className={cn(
                "sticky z-20 min-w-40 max-w-52 bg-background align-middle shadow-[inset_1px_0_0_hsl(var(--border))]",
                submittedStickyRightClass,
              )}
            >
              Submitted
            </TableHead>
            <TableHead
              className={cn(
                "sticky right-0 z-30 w-32 min-w-32 max-w-32 bg-background text-right align-middle shadow-[inset_1px_0_0_hsl(var(--border))]",
              )}
            >
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.responseId}>
              {row.cells.map((cell, i) => (
                <TableCell
                  key={cell.questionId}
                  className={cn(
                    presets[i]!.cellWidthClass,
                    "align-top whitespace-normal",
                  )}
                >
                  <div className="wrap-break-word">{cell.display}</div>
                  {cell.error ? (
                    <div className="mt-1 text-xs text-destructive">
                      {cell.error}
                    </div>
                  ) : null}
                </TableCell>
              ))}
              <TableCell
                className={cn(
                  "sticky z-20 bg-background align-top whitespace-normal shadow-[inset_1px_0_0_hsl(var(--border))]",
                  submittedStickyRightClass,
                  row.payloadErrors.length > 0 &&
                    "border-l-2 border-l-destructive",
                )}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">
                    {formatSubmittedAt(row.submittedAt)}
                  </span>
                  {row.payloadErrors.length > 0 ? (
                    <span
                      className="text-xs text-destructive"
                      title={row.payloadErrors.join(" · ")}
                    >
                      Stored answers did not fully validate
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "sticky right-0 z-30 w-32 min-w-32 max-w-32 bg-background align-top shadow-[inset_1px_0_0_hsl(var(--border))]",
                )}
              >
                <div className="flex flex-col gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    aria-label="View full response"
                    onClick={() => setDetailRow(row)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={deletePendingId === row.responseId}
                    onClick={() => onDeleteResponse(row.responseId)}
                  >
                    {deletePendingId === row.responseId ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
