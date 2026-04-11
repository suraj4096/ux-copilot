"use client"

import * as React from "react"
import { Link, useNavigate } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { logoutFn } from "@/lib/auth.functions"
import { useAuth } from "@/contexts/auth-context"

export function AppNavbar() {
  const navigate = useNavigate()
  const { user, isLoading, refetch } = useAuth()
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  async function onSignOut() {
    setIsSigningOut(true)
    try {
      await logoutFn()
      await refetch()
      await navigate({ to: "/login", search: { redirect: "/" } })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="flex items-center gap-2 border-b bg-background px-2 py-2 text-foreground">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <Link to="/" className="truncate text-sm font-medium">
        UX Copilot
      </Link>
      <div className="flex flex-1" />
      {isLoading ? (
        <div className="text-sm text-muted-foreground">…</div>
      ) : user ? (
        <div className="flex items-center gap-2">
          <div className="hidden text-sm text-muted-foreground sm:block">
            {user.email}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      ) : (
        <Link
          to="/login"
          search={{ redirect: "/" }}
          className="text-sm text-muted-foreground"
        >
          Sign in
        </Link>
      )}
    </header>
  )
}

