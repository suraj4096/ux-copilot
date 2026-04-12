"use client"

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
  if (pathname === "/draw" || pathname === "/draw/") return "Draw"
  return "App"
}

export function AgentTopBar({ pathname }: { pathname: string }) {
  return (
    <div className="flex shrink-0 items-center border-b border-border bg-background px-3 py-2">
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        {humanizeRoutePath(pathname)}
      </span>
    </div>
  )
}
