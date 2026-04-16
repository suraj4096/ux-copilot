import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { currentUserQueryOptions } from "@/lib/query-options"
import { parseNameFromEmail } from "@/lib/user-identity"

type AuthUser = { email: string }

type AuthIdentity = {
  email: string
  name: string
}

type AuthContextValue = {
  user: AuthUser | null
  identity: AuthIdentity | null
  isLoading: boolean
  refetch: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const userQuery = useQuery(currentUserQueryOptions())
  const user = (userQuery.data ?? null) as AuthUser | null

  const identity = React.useMemo(() => {
    if (!user) return null
    return {
      email: user.email,
      name: parseNameFromEmail(user.email),
    }
  }, [user])

  const refetch = React.useCallback(async () => {
    await userQuery.refetch()
  }, [userQuery])

  return (
    <AuthContext.Provider
      value={{ user, identity, isLoading: userQuery.isPending, refetch }}
    >
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
