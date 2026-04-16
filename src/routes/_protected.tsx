import { Outlet, createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/layout/app-shell"
import { AgentProvider } from "@/contexts/agent-context"

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return (
    <AgentProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </AgentProvider>
  )
}

