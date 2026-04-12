export const DEFAULT_LIST_LIMIT = 20
export const MAX_LIST_LIMIT = 100

export type ListPageParams = {
  offset: number
  limit: number
  search?: string
}

export type ListPageResult<T> = {
  items: Array<T>
  total: number
}

export function sanitizeIlikeSearch(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined
  const t = raw.trim()
  if (!t) return undefined
  return t.replace(/[%_\\]/g, "")
}

export function normalizeListPageParams(
  input: Partial<ListPageParams> | undefined,
): ListPageParams {
  const limitRaw = input?.limit ?? DEFAULT_LIST_LIMIT
  const limit = Math.min(
    MAX_LIST_LIMIT,
    Math.max(1, Number.isFinite(limitRaw) ? limitRaw : DEFAULT_LIST_LIMIT),
  )
  const offsetRaw = input?.offset ?? 0
  const offset = Math.max(
    0,
    Number.isFinite(offsetRaw) ? Math.trunc(offsetRaw) : 0,
  )
  const search = sanitizeIlikeSearch(input?.search)
  return { offset, limit, search }
}

export function searchPattern(search: string): string {
  return `%${search}%`
}
