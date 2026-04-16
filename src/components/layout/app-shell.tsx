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

export function AppShell({
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
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <ArtifactTopBar />
                    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-2">
                      <section className="min-h-0 flex-1 overflow-auto bg-background p-4 text-foreground">
                        {children}
                      </section>
                    </div>
                  </div>
                </ArtifactActionsProvider>
              </div>

              <div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
                <ResizablePanelGroup>
                  <ResizablePanel defaultSize={46} minSize={28}>
                    <AgentPanel className="flex-1" />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={54} minSize={32}>
                    <ArtifactActionsProvider>
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                        <ArtifactTopBar />
                        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-2">
                          <section className="min-h-0 flex-1 overflow-auto bg-background p-4 text-foreground">
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
