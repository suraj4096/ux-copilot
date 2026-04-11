import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { loginFn } from "@/lib/auth.functions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    const redirect =
      typeof search.redirect === "string" ? search.redirect : "/"
    return { redirect }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const { refetch } = useAuth()
  const [email, setEmail] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await loginFn({ data: { email } })
      if (!res.ok) {
        setError(res.error)
        return
      }
      await refetch()
      await navigate({ href: redirect })
    } catch {
      setError("Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="mx-auto w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <div className="text-base font-medium">Login</div>
          <div className="text-sm text-muted-foreground">
            Enter your email. If it exists, you’ll be signed in for 7 days.
          </div>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-2">
            <div className="text-sm font-medium">Email</div>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          {error ? (
            <div className="text-sm text-destructive" role="alert">
              {error}
            </div>
          ) : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
}
