"use client"

import { useRouterState } from "@tanstack/react-router"
import { PanelRightClose, PanelRightOpen } from "lucide-react"

import { NewSurveyDialog } from "@/components/new-survey-dialog"
import { WorkspaceBreadcrumb } from "@/components/workspace-breadcrumb"
import { Button } from "@/components/ui/button"

function isSurveysWorkspacePath(pathname: string) {
  return (
    pathname === "/surveys" ||
    pathname === "/surveys/" ||
    pathname.startsWith("/surveys/")
  )
}

export function WorkspaceTopBar({
  agentVisible,
  onToggleAgent,
}: {
  agentVisible: boolean
  onToggleAgent: () => void
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showSurveyNew = isSurveysWorkspacePath(pathname)

  return (
    <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3 py-2">
      <WorkspaceBreadcrumb />
      <div className="flex shrink-0 items-center gap-1.5">
        {showSurveyNew ? (
          <NewSurveyDialog triggerSize="sm">+ New</NewSurveyDialog>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onToggleAgent}
          aria-pressed={agentVisible}
          aria-label={agentVisible ? "Hide assistant" : "Show assistant"}
          title={agentVisible ? "Hide assistant" : "Show assistant"}
        >
          {agentVisible ? (
            <PanelRightClose className="size-4" aria-hidden />
          ) : (
            <PanelRightOpen className="size-4" aria-hidden />
          )}
        </Button>
      </div>
    </div>
  )
}
