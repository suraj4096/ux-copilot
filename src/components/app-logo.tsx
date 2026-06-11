import { Link } from "@tanstack/react-router"

export function AppLogo() {
  return (
    <Link to="/" className="inline-flex items-center gap-1">
      <div className="inline-block size-6 rounded-full border-5 border-foreground bg-brand -ml-1" />
      <span className="text-xl tracking-tight group-data-[state=collapsed]/sidebar2-wrapper:hidden">
        <b>Neo</b>UX
      </span>
    </Link>
  )
}
