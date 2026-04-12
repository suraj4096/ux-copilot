import { z } from "zod"

import { DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT } from "@/lib/db/list-query-shared"

function asRecord(raw: unknown): Record<string, unknown> {
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  return {}
}

function coerceNonNegInt(v: unknown, fallback: number): number {
  const n =
    typeof v === "string"
      ? Number.parseInt(v, 10)
      : typeof v === "number"
        ? v
        : fallback
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : fallback
}

function coerceClampedLimit(v: unknown): number {
  const n = coerceNonNegInt(v, DEFAULT_LIST_LIMIT)
  const x = n === 0 ? DEFAULT_LIST_LIMIT : n
  return Math.min(MAX_LIST_LIMIT, Math.max(1, x))
}

export const loginSearchSchema = z.unknown().transform((raw) => {
  const search = asRecord(raw)
  return {
    redirect: typeof search.redirect === "string" ? search.redirect : "/",
  }
})

export const newFormSearchSchema = z.unknown().transform((raw) => {
  const search = asRecord(raw)
  return {
    cloneFrom:
      typeof search.cloneFrom === "string" && search.cloneFrom.trim()
        ? search.cloneFrom.trim()
        : undefined,
    agentDraft:
      typeof search.agentDraft === "string" && search.agentDraft.trim()
        ? search.agentDraft.trim()
        : undefined,
  }
})

export const surveysListSearchSchema = z.unknown().transform((raw) => {
  const search = asRecord(raw)
  const q =
    typeof search.q === "string" && search.q.trim() ? search.q.trim() : undefined
  return {
    q,
    offset: coerceNonNegInt(search.offset, 0),
    limit: coerceClampedLimit(search.limit),
  }
})

export const surveyDetailSearchSchema = z.unknown().transform((raw) => {
  const search = asRecord(raw)
  const fq =
    typeof search.fq === "string" && search.fq.trim() ? search.fq.trim() : undefined
  return {
    fq,
    foffset: coerceNonNegInt(search.foffset, 0),
    flimit: coerceClampedLimit(search.flimit),
  }
})

export const formResponsesSearchSchema = z.unknown().transform((raw) => {
  const search = asRecord(raw)
  const rq =
    typeof search.rq === "string" && search.rq.trim() ? search.rq.trim() : undefined
  const highlightResponseRaw = search.highlightResponse
  const highlightResponse =
    typeof highlightResponseRaw === "string" &&
    highlightResponseRaw.trim().length > 0
      ? highlightResponseRaw.trim()
      : undefined
  return {
    rq,
    roffset: coerceNonNegInt(search.roffset, 0),
    rlimit: coerceClampedLimit(search.rlimit),
    highlightResponse,
  }
})
