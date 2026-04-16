import { Link } from "@tanstack/react-router"

export function AppLogo() {
  return (
    <Link to="/" className="inline-flex items-center gap-1">
      <div className="inline-block size-6 rounded-full border-5 border-foreground bg-brand" />
      <span className="text-xl tracking-tight">
        Status<b>Neo</b>
      </span>
    </Link>
  )
}
