"use client"

import * as React from "react"

type NewShellSidecarContextValue = {
  setSidecarContent: (content: React.ReactNode | null) => void
}

const NewShellSidecarContext = React.createContext<NewShellSidecarContextValue | null>(null)

export function NewShellSidecarProvider({
  children,
  defaultSidecar,
}: {
  children: (sidecarContent: React.ReactNode) => React.ReactNode
  defaultSidecar: React.ReactNode
}) {
  const [customSidecar, setCustomSidecar] = React.useState<React.ReactNode | null>(null)
  const value = React.useMemo(() => ({ setSidecarContent: setCustomSidecar }), [])

  return (
    <NewShellSidecarContext.Provider value={value}>
      {children(customSidecar ?? defaultSidecar)}
    </NewShellSidecarContext.Provider>
  )
}

export function useNewShellSidecar(content: React.ReactNode) {
  const context = React.useContext(NewShellSidecarContext)

  React.useEffect(() => {
    if (!context) return
    context.setSidecarContent(content)
    return () => context.setSidecarContent(null)
  }, [context, content])
}
