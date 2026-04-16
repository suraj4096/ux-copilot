"use client"

import * as React from "react"

type ArtifactActionsContextValue = {
  actions: React.ReactNode
  setActions: (actions: React.ReactNode) => void
  clearActions: () => void
}

const ArtifactActionsContext =
  React.createContext<ArtifactActionsContextValue | null>(null)

export function ArtifactActionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [actions, setActionsState] = React.useState<React.ReactNode>(null)

  const setActions = React.useCallback((next: React.ReactNode) => {
    setActionsState(next)
  }, [])

  const clearActions = React.useCallback(() => {
    setActionsState(null)
  }, [])

  return (
    <ArtifactActionsContext.Provider value={{ actions, setActions, clearActions }}>
      {children}
    </ArtifactActionsContext.Provider>
  )
}

export function useArtifactActions() {
  const ctx = React.useContext(ArtifactActionsContext)
  if (!ctx) {
    throw new Error("useArtifactActions must be used within ArtifactActionsProvider")
  }
  return ctx
}

