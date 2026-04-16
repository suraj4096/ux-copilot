import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"
import type { QueryClient } from "@tanstack/react-query"
import { AgenticShell } from "@/components/layout/app-shell"
import { Providers } from "@/components/providers"
import { WorkspaceAgentRuntimeProvider } from "@/contexts/agent-chat-context"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "UX Copilot",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-dvh overflow-hidden">
      <head>
        <HeadContent />
      </head>
      <body className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background antialiased">
        <Providers>{children}</Providers>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isPublicLayout = pathname === "/login"

  if (isPublicLayout) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <WorkspaceAgentRuntimeProvider key="workspace-agent">
        <AgenticShell>
          <Outlet />
        </AgenticShell>
      </WorkspaceAgentRuntimeProvider>
    </div>
  )
}
