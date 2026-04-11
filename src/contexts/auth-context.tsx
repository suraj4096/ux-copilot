import * as React from "react"
import { useServerFn } from "@tanstack/react-start"
import { useRouterState } from "@tanstack/react-router"

import { getCurrentUserFn } from "@/lib/auth.functions"

type AuthUser = { email: string }

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  refetch: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const getCurrentUser = useServerFn(getCurrentUserFn)
  const locationKey = useRouterState({ select: (s) => s.location.href })
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const refetch = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const next = await getCurrentUser()
      setUser(next)
    } finally {
      setIsLoading(false)
    }
  }, [getCurrentUser])

  React.useEffect(() => {
    void refetch()
  }, [refetch, locationKey])

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
