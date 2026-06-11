"use client"

import * as React from "react"
import { useRouterState } from "@tanstack/react-router"

import { AgentPanel } from "@/components/agent/agent-panel"
import { ArtifactActionsProvider } from "@/components/artifact/artifact-actions-context"
import { ArtifactTopBar } from "@/components/artifact/artifact-top-bar"
import { NewAppSidebar, SidecarToggle } from "@/components/new/app-sidebar"
import { AuditListPage } from "@/components/new/audit-list-page"
import { NewShellSidecarProvider } from "@/components/new/new-shell-context"
import {
  Sidebar2Inset,
  Sidebar2Provider,
  Sidebar2Sidecar,
  Sidebar2SidecarContent,
} from "@/components/new/sidebar2"
import { cn } from "@/lib/utils"

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === "/"
  const isDraw = pathname === "/draw" || pathname === "/draw/"
  const isUxAudit = pathname === "/ux-audit" || pathname === "/ux-audit/"
  const isNewAudit = pathname === "/new" || pathname === "/new/" || pathname.startsWith("/new/")

  const artifactBodyClass = cn(
    "flex h-full min-h-0 flex-1 flex-col",
    isDraw ? "overflow-hidden p-0" : "overflow-auto p-2",
  )

  const artifactSectionClass = cn(
    "h-full min-h-0 flex-1 bg-background text-foreground",
    isDraw ? "flex min-w-0 flex-col overflow-hidden p-0" : "overflow-auto p-4",
  )

  return (
    <Sidebar2Provider defaultSidecarOpen={isHome || isNewAudit}>
      <NewAppSidebar />
      <SidecarToggle />
      <NewShellSidecarProvider
        defaultSidecar={
          <div className="flex size-full min-h-0 flex-col overflow-hidden bg-background">
            <Sidebar2SidecarContent className="p-0">
              <AgentPanel className="h-full" />
            </Sidebar2SidecarContent>
          </div>
        }
      >
        {(sidecarContent) => (
      <Sidebar2Inset className="h-svh min-h-0 overflow-hidden p-0">
        <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
          {isNewAudit ? (
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {children}
            </main>
          ) : isHome ? (
            <AuditListPage />
          ) : isUxAudit ? (
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {children}
            </main>
          ) : (
            <ArtifactActionsProvider>
              <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <ArtifactTopBar />
                <div className={artifactBodyClass}>
                  <section className={artifactSectionClass}>{children}</section>
                </div>
              </main>
            </ArtifactActionsProvider>
          )}
        </div>

        <Sidebar2Sidecar>{sidecarContent}</Sidebar2Sidecar>
      </Sidebar2Inset>
        )}
      </NewShellSidecarProvider>
    </Sidebar2Provider>
  )
}
