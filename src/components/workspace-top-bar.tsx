"use client"

import { useRouterState } from "@tanstack/react-router"

import { NewSurveyDialog } from "@/components/new-survey-dialog"
import { WorkspaceBreadcrumb } from "@/components/workspace-breadcrumb"

function isSurveysWorkspacePath(pathname: string) {
  return (
    pathname === "/surveys" ||
    pathname === "/surveys/" ||
    pathname.startsWith("/surveys/")
  )
}

export function WorkspaceTopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showSurveyNew = isSurveysWorkspacePath(pathname)

  return (
    <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3 py-2">
      <WorkspaceBreadcrumb />
      <div className="flex shrink-0 items-center gap-1.5">
        {showSurveyNew ? (
          <NewSurveyDialog triggerSize="sm">+ New</NewSurveyDialog>
        ) : null}
      </div>
    </div>
  )
}
