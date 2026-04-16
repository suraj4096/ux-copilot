import { createFileRoute } from "@tanstack/react-router"

import { requireSession } from "@/lib/route-guards"

export const Route = createFileRoute("/_protected/")({
  beforeLoad: async ({ location }) => {
    await requireSession({ location })
  },
  component: HomePage,
})

function HomePage() {
  return null
}

