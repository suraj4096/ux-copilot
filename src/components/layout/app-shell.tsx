"use client"

import * as React from "react"
import { useRouterState } from "@tanstack/react-router"

import { AgentShell } from "@/components/layout/agent-shell"
import { AppNavRail } from "@/components/layout/app-nav-rail"
import { AppNavbar } from "@/components/layout/app-navbar"
import { AppSlot } from "@/components/layout/app-slot"
import { WorkspaceTopBar } from "@/components/workspace-top-bar"

export function AgenticShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === "/"

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <AppNavbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AppNavRail />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {isHome ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AgentShell className="flex-1" />
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
              <div className="min-h-0 border-b border-border lg:border-b-0 lg:border-r">
                <AgentShell className="flex-1" />
              </div>
              <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                <WorkspaceTopBar />
                <div className="flex min-h-0 flex-1 flex-col overflow-auto p-2">
                  <AppSlot>{children}</AppSlot>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
