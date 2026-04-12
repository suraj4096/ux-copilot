import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { AppNavbar } from "@/components/app-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/contexts/auth-context"
import { loginFn } from "@/lib/auth.functions"
import { loginSearchSchema } from "@/lib/router-search-schemas"

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) =>
    loginSearchSchema.parse(search),
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
    <div className="flex min-h-0 flex-1 flex-col">
      <AppNavbar />
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
        <div className="mx-auto w-full max-w-xs space-y-4">
          <div className="text-lg font-medium">Login</div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Enter your email to continue.
              </div>
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

            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" aria-hidden />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
