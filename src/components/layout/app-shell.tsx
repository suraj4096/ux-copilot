"use client"

import * as React from "react"
import { useRouterState } from "@tanstack/react-router"

import { AgentPanel } from "@/components/agent/agent-panel"
import { AppNavbar } from "@/components/layout/app-navbar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ArtifactTopBar } from "@/components/artifact/artifact-top-bar"
import { ArtifactActionsProvider } from "@/components/artifact/artifact-actions-context"
import { cn } from "@/lib/utils"

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === "/"
  const isDraw = pathname === "/draw" || pathname === "/draw/"

  const artifactBodyClass = cn(
    "flex h-full min-h-0 flex-1 flex-col",
    isDraw ? "overflow-hidden p-0" : "overflow-auto p-2",
  )

  const artifactSectionClass = cn(
    "h-full min-h-0 flex-1 bg-background text-foreground",
    isDraw ? "flex min-w-0 flex-col overflow-hidden p-0" : "overflow-auto p-4",
  )

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <AppNavbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {isHome ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AgentPanel className="flex-1" />
            </div>
          ) : (
            <>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
                <AgentPanel className="min-h-0 flex-1 border-b border-border" />
                <ArtifactActionsProvider>
                  <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <ArtifactTopBar />
                    <div className={artifactBodyClass}>
                      <section className={artifactSectionClass}>
                        {children}
                      </section>
                    </div>
                  </div>
                </ArtifactActionsProvider>
              </div>

              <div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
                <ResizablePanelGroup>
                  <ResizablePanel defaultSize={46} minSize={28}>
                    <AgentPanel className="h-full" />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={54} minSize={32}>
                    <ArtifactActionsProvider>
                      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                        <ArtifactTopBar />
                        <div className={artifactBodyClass}>
                          <section className={artifactSectionClass}>
                            {children}
                          </section>
                        </div>
                      </div>
                    </ArtifactActionsProvider>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
