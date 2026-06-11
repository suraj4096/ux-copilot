"use client"

import * as React from "react"

import type { AuditStep } from "@/components/ux-audit/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type EditableSlideDraft = Pick<AuditStep, "title" | "description" | "artifact" | "slide">
type JsonValue = string | number | boolean | null | Array<JsonValue> | { [key: string]: JsonValue }
type Path = Array<string | number>

const hiddenKeys = new Set(["id", "type", "kind", "orientation", "mode", "status"])

function cloneDraft(step: AuditStep): EditableSlideDraft {
  return structuredClone({
    title: step.title,
    description: step.description,
    artifact: step.artifact,
    slide: step.slide,
  })
}

function labelFromKey(key: string | number) {
  if (typeof key === "number") return `Item ${key + 1}`
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())
}

function updateAtPath(value: JsonValue, path: Path, nextValue: JsonValue): JsonValue {
  if (path.length === 0) return nextValue
  const [head, ...rest] = path

  if (Array.isArray(value)) {
    return value.map((item, index) => index === head ? updateAtPath(item, rest, nextValue) : item)
  }

  if (value && typeof value === "object") {
    return {
      ...value,
      [head]: updateAtPath((value as Record<string, JsonValue>)[head], rest, nextValue),
    }
  }

  return value
}

function FieldEditor({
  name,
  value,
  path,
  depth = 0,
  onChange,
}: {
  name: string | number
  value: JsonValue
  path: Path
  depth?: number
  onChange: (path: Path, value: JsonValue) => void
}) {
  if (value === null) return null

  if (typeof value === "string") {
    const multiline = value.length > 72 || value.includes("\n")
    return (
      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{labelFromKey(name)}</span>
        {multiline ? (
          <textarea
            value={value}
            rows={4}
            onChange={(event) => onChange(path, event.target.value)}
            className="min-h-24 rounded-lg border bg-background p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <input
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
            className="h-9 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        )}
      </label>
    )
  }

  if (typeof value === "number") {
    return (
      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{labelFromKey(name)}</span>
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(path, Number(event.target.value))}
          className="h-9 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
    )
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
          className="size-4 rounded border"
        />
        {labelFromKey(name)}
      </label>
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null
    return (
      <section className={cn("space-y-2", depth > 0 && "space-y-2")}>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{labelFromKey(name)}</div>
        <div className="space-y-3">
          {value.map((item, index) => (
            <FieldEditor key={index} name={index} value={item} path={[...path, index]} depth={depth + 1} onChange={onChange} />
          ))}
        </div>
      </section>
    )
  }

  const entries = Object.entries(value).filter(([key, item]) => !hiddenKeys.has(key) && item !== null)
  if (entries.length === 0) return null

  return (
    <section className={cn("space-y-3", depth > 0 && "space-y-3")}>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{labelFromKey(name)}</div>
      {entries.map(([key, item]) => (
        <FieldEditor key={key} name={key} value={item} path={[...path, key]} depth={depth + 1} onChange={onChange} />
      ))}
    </section>
  )
}

export function EditSlideDialog({
  step,
  open,
  onOpenChange,
  onSave,
}: {
  step: AuditStep
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (step: AuditStep) => void
}) {
  const [draft, setDraft] = React.useState<EditableSlideDraft>(() => cloneDraft(step))

  React.useEffect(() => {
    if (open) setDraft(cloneDraft(step))
  }, [open, step])

  const handleChange = React.useCallback((path: Path, value: JsonValue) => {
    setDraft((current) => updateAtPath(current as unknown as JsonValue, path, value) as unknown as EditableSlideDraft)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] !w-[calc(100vw-2rem)] !max-w-7xl flex-col overflow-hidden p-0" showCloseButton>
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Edit slide</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <div className="space-y-5">
            <FieldEditor name="Slide" value={draft as unknown as JsonValue} path={[]} onChange={handleChange} />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onSave({ ...step, ...draft })
              onOpenChange(false)
            }}
          >
            Apply edits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
