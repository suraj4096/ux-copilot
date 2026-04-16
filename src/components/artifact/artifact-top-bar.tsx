"use client"

import { useRouterState } from "@tanstack/react-router"

import { NewSurveyDialog } from "@/components/new-survey-dialog"
import { ArtifactBreadcrumb } from "@/components/artifact/artifact-breadcrumb"
import { useArtifactActions } from "@/components/artifact/artifact-actions-context"

function isSurveysArtifactPath(pathname: string) {
  return (
    pathname === "/surveys" ||
    pathname === "/surveys/" ||
    pathname.startsWith("/surveys/")
  )
}

export function ArtifactTopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showSurveyNew = isSurveysArtifactPath(pathname)
  const { actions } = useArtifactActions()

  return (
    <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3 py-2">
      <ArtifactBreadcrumb />
      <div className="flex shrink-0 items-center gap-1.5">
        {actions ? (
          actions
        ) : showSurveyNew ? (
          <NewSurveyDialog triggerSize="sm">+ New</NewSurveyDialog>
        ) : null}
      </div>
    </div>
  )
}

