"use client"

import * as React from "react"

import { AgentPanel } from "@/components/agent-panel"
import { AppNavbar } from "@/components/app-navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppSlot } from "@/components/app-slot"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="flex min-h-svh w-full flex-col">
      <AppNavbar />
      <div className="flex min-h-0 min-w-0 flex-1">
        <AppSidebar />
        <SidebarInset className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <ResizablePanelGroup
            id="app-shell-layout"
            orientation="horizontal"
            className="min-h-0 flex-1"
          >
            <ResizablePanel
              id="main"
              defaultSize="75%"
              minSize="45%"
              className="min-w-0"
            >
              <div className="flex h-full min-h-0 flex-col p-2">
                <AppSlot>{children}</AppSlot>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="agent"
              defaultSize="25%"
              minSize="240px"
              maxSize="40rem"
              className="min-w-0"
            >
              <AgentPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
