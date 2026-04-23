"use client"

import * as React from "react"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import { LogOut, SquarePen } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { logoutFn } from "@/lib/auth.functions"
import { useAuth } from "@/contexts/auth-context"
import { useOptionalAgentActions } from "@/contexts/agent-context"
import { initialFromName } from "@/lib/user-identity"
import { AppLogo } from "../app-logo"

export function AppNavbar() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isLoginRoute = pathname === "/login"
  const { identity, isLoading, refetch } = useAuth()
  const agentActions = useOptionalAgentActions()
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
    <header className="sticky top-0 z-40 flex h-(--app-navbar-height) shrink-0 items-center gap-2 border-b bg-background px-2 text-foreground">
      <AppLogo />

      <Link to="/" className="truncate text-sm font-medium">
        UX Copilot
      </Link>
      <div className="flex flex-1" />
      {isLoading ? (
        <Skeleton
          className="size-8 shrink-0 rounded-full"
          aria-busy
          aria-label="Loading account"
        />
      ) : identity ? (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="New chat"
            onClick={() => {
              agentActions?.resetAgent()
            }}
          >
            <SquarePen className="size-4" aria-hidden />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Avatar>
                <AvatarFallback className="bg-primary/15 text-sm font-medium text-foreground">
                  {initialFromName(identity.name)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate text-sm font-normal text-foreground">
                    {identity.email}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isSigningOut}
                  onClick={() => {
                    void onSignOut()
                  }}
                >
                  {isSigningOut ? (
                    <Spinner className="size-4" aria-hidden />
                  ) : (
                    <LogOut className="size-4" aria-hidden />
                  )}
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : isLoginRoute ? null : (
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
