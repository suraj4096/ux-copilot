"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

function normalizeSearchText(s: string): string {
  return s.trim()
}

type DebouncedSearchFieldProps = {
  urlValue: string
  onDebouncedCommit: (value: string | undefined) => void
  isBusy?: boolean
  debounceMs?: number
  placeholder?: string
  className?: string
  inputId?: string
}

export function DebouncedSearchField({
  urlValue,
  onDebouncedCommit,
  isBusy = false,
  debounceMs = 300,
  placeholder = "Search…",
  className,
  inputId = "list-search",
}: DebouncedSearchFieldProps) {
  const [draft, setDraft] = React.useState(urlValue)
  const [isFocused, setIsFocused] = React.useState(false)
  const onCommitRef = React.useRef(onDebouncedCommit)
  onCommitRef.current = onDebouncedCommit

  React.useEffect(() => {
    if (isFocused) return
    setDraft(urlValue)
  }, [urlValue, isFocused])

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const trimmed = normalizeSearchText(draft) || undefined
      const urlTrimmed = normalizeSearchText(urlValue) || undefined
      if (trimmed === urlTrimmed) return
      onCommitRef.current(trimmed)
    }, debounceMs)
    return () => window.clearTimeout(t)
  }, [draft, debounceMs, urlValue])

  const isDirty =
    normalizeSearchText(draft) !== normalizeSearchText(urlValue)
  const showSpinner = isDirty || isBusy

  return (
    <div className={cn("relative min-w-48 flex-1", className)}>
      <label className="sr-only" htmlFor={inputId}>
        Search
      </label>
      <Input
        id={inputId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        aria-busy={showSpinner}
        className={cn(showSpinner && "pe-9")}
      />
      {showSpinner ? (
        <span
          className="pointer-events-none absolute inset-e-2 top-1/2 -translate-y-1/2"
          aria-hidden
        >
          <Spinner className="size-4 text-muted-foreground" />
        </span>
      ) : null}
    </div>
  )
}

type OffsetPaginationBarProps = {
  total: number
  offset: number
  limit: number
  buildSearch: (next: { offset: number }) => Record<string, unknown>
  className?: string
}

export function OffsetPaginationBar({
  total,
  offset,
  limit,
  buildSearch,
  className,
}: OffsetPaginationBarProps) {
  const start = total === 0 ? 0 : offset + 1
  const end = Math.min(offset + limit, total)
  const hasPrev = offset > 0
  const hasNext = offset + limit < total

  if (!hasPrev && !hasNext) {
    return null
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <p>
        {total === 0 ? "No results" : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex gap-2">
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          render={
            <Link
              to="."
              search={() => buildSearch({ offset: Math.max(0, offset - limit) })}
            />
          }
        >
          Previous
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          disabled={!hasNext}
          render={
            <Link
              to="."
              search={() => buildSearch({ offset: offset + limit })}
            />
          }
        >
          Next
        </Button>
      </div>
    </div>
  )
}

