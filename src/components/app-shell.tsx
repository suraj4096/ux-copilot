"use client"

import * as React from "react"

import { AgentPanel } from "@/components/agent-panel"
import { AppNavRail } from "@/components/app-nav-rail"
import { AppNavbar } from "@/components/app-navbar"
import { AppSlot } from "@/components/app-slot"
import { WorkspaceTopBar } from "@/components/workspace-top-bar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function AppShell({
  children,
  mode = "workspace",
}: {
  children: React.ReactNode
  mode?: "home" | "workspace"
}) {
  const [agentVisible, setAgentVisible] = React.useState(true)

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <AppNavbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AppNavRail />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {mode === "home" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
              <AppSlot>{children}</AppSlot>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <WorkspaceTopBar
                agentVisible={agentVisible}
                onToggleAgent={() => setAgentVisible((v) => !v)}
              />
              <div className="min-h-0 flex-1 overflow-hidden">
                {agentVisible ? (
                  <ResizablePanelGroup
                    id="app-shell-layout"
                    orientation="horizontal"
                    className="h-full min-h-0"
                  >
                    <ResizablePanel
                      id="main"
                      defaultSize="75%"
                      minSize="45%"
                      className="flex min-h-0 min-w-0 flex-col"
                    >
                      <div className="flex min-h-0 flex-1 flex-col overflow-auto p-2">
                        <AppSlot>{children}</AppSlot>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                      id="agent"
                      defaultSize="25%"
                      minSize="240px"
                      maxSize="40rem"
                      className="flex min-h-0 min-w-0 flex-col"
                    >
                      <AgentPanel />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col overflow-auto p-2">
                    <AppSlot>{children}</AppSlot>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
