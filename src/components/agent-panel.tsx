"use client"

import { Bot, MapPin } from "lucide-react"
import { useRouterState } from "@tanstack/react-router"

function formatLocationSearch(search: unknown): string {
  if (search == null) return ""
  if (typeof search === "string") return search
  if (typeof search === "object" && !Array.isArray(search)) {
    const o = search as Record<string, unknown>
    const q = new URLSearchParams()
    for (const [key, value] of Object.entries(o)) {
      if (value === undefined || value === null) continue
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        q.set(key, String(value))
      } else {
        q.set(key, JSON.stringify(value))
      }
    }
    const s = q.toString()
    return s ? `?${s}` : ""
  }
  return ""
}

function formatParamValue(value: unknown): string {
  if (value === undefined || value === null) return ""
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function humanizeRoutePath(pathname: string) {
  if (pathname === "/") return "Home"
  if (pathname === "/login") return "Login"
  if (pathname.startsWith("/f/")) return "Public form"
  if (pathname === "/surveys/" || pathname === "/surveys") return "Surveys list"
  if (/^\/surveys\/[^/]+\/?$/.test(pathname)) return "Survey detail"
  if (/^\/surveys\/[^/]+\/form\/?$/.test(pathname)) return "Survey forms"
  if (/^\/surveys\/[^/]+\/form\/[^/]+\/?$/.test(pathname)) {
    return "Form editor / responses"
  }
  return "App"
}

export function AgentPanel() {
  const route = useRouterState({
    select: (s) => {
      const leaf = s.matches.at(-1)
      return {
        pathname: s.location.pathname,
        search: s.location.search,
        href: s.location.href,
        routeId: leaf?.routeId ?? leaf?.id ?? "—",
        params: (leaf?.params ?? {}) as Record<string, unknown>,
      }
    },
  })

  const contextLabel = humanizeRoutePath(route.pathname)
  const searchDisplay = formatLocationSearch(route.search)
  const paramsEntries = Object.entries(route.params).filter(([, v]) => {
    if (v === undefined || v === null) return false
    if (typeof v === "string") return v !== ""
    return true
  })

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-border bg-muted/20">
      <header className="shrink-0 space-y-1 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Bot className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold tracking-tight">Agent</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-snug">
          Mock panel. Route context updates as you navigate.
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3 text-xs">
        <section className="space-y-1.5 rounded-lg border border-border/80 bg-background/60 p-2.5">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
            Current context
          </div>
          <p className="text-sm font-medium text-foreground">{contextLabel}</p>
          <p className="wrap-break-word font-mono text-[11px] text-muted-foreground">
            {route.pathname}
            {searchDisplay}
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="font-medium text-muted-foreground">Route</h3>
          <dl className="space-y-2 font-mono text-[11px]">
            <div>
              <dt className="text-muted-foreground">routeId</dt>
              <dd className="wrap-break-word text-foreground">
                {formatParamValue(route.routeId)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">href</dt>
              <dd className="wrap-break-word text-foreground">{route.href}</dd>
            </div>
          </dl>
        </section>

        {paramsEntries.length > 0 ? (
          <section className="space-y-1.5">
            <h3 className="font-medium text-muted-foreground">Params</h3>
            <ul className="space-y-1 font-mono text-[11px]">
              {paramsEntries.map(([key, value]) => (
                <li
                  key={key}
                  className="flex flex-wrap gap-x-2 gap-y-0.5 rounded-md bg-muted/40 px-2 py-1"
                >
                  <span className="text-muted-foreground">{key}</span>
                  <span className="wrap-break-word text-foreground">
                    {formatParamValue(value)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-lg border border-dashed border-border p-3 text-muted-foreground">
          <p className="leading-relaxed">
            Agent tools and suggestions for this screen will plug in here.
          </p>
        </section>
      </div>
    </aside>
  )
}
