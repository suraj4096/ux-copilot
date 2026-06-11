"use client"

import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  ChevronUp,
  FileSearch,
  FileText,
  FolderOpen,
  LayoutPanelLeft,
  LogOut,
  MessageSquare,
  Pencil,
  Pin,
  Settings,
  User,
} from "lucide-react"

import { AppLogo } from "@/components/app-logo"
import {
  Sidebar2,
  Sidebar2Content,
  Sidebar2Footer,
  Sidebar2Group,
  Sidebar2GroupContent,
  Sidebar2GroupLabel,
  Sidebar2Header,
  Sidebar2Menu,
  Sidebar2MenuButton,
  Sidebar2MenuItem,
  useSidebar2,
} from "@/components/new/sidebar2"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { surveysListSearchDefaults } from "@/lib/router-search-defaults"
import { cn } from "@/lib/utils"

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => part[0].toUpperCase()).join("")
  return letters || value.slice(0, 2).toUpperCase()
}

function SidebarUserFooter() {
  const [open, setOpen] = React.useState(false)
  const { state } = useSidebar2()
  const { identity } = useAuth()
  const name = identity?.name ?? "User"
  const email = identity?.email ?? "Signed in"

  React.useEffect(() => {
    if (state === "collapsed") setOpen(false)
  }, [state])

  return (
    <Sidebar2MenuItem className="relative overflow-visible rounded-xl transition-colors">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "group flex w-full items-center gap-1.5 rounded-xl border border-transparent px-2 py-2 text-left transition-colors outline-none group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:gap-0 group-data-[state=collapsed]/sidebar2-wrapper:px-0 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring",
          open && "rounded-t-none border-border bg-background"
        )}
      >
        <Avatar className="size-8 shrink-0">
          <AvatarFallback>{initials(name || email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 text-left group-data-[state=collapsed]/sidebar2-wrapper:hidden">
          <div className="truncate text-sm font-medium text-sidebar-foreground">
            {name}
          </div>
          <div className="truncate text-xs text-sidebar-foreground/70">
            {email}
          </div>
        </div>
        <ChevronUp
          className={cn(
            "size-4 shrink-0 text-sidebar-foreground/60 transition-transform group-data-[state=collapsed]/sidebar2-wrapper:hidden",
            open && "rotate-180"
          )}
        />
      </button>

      {open && state !== "collapsed" ? (
        <div className="absolute right-0 bottom-full left-0 z-50 rounded-t-xl border border-b-0 bg-background py-1 shadow-lg">
          <button
            type="button"
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <User className="mr-2 size-4" /> Account
          </button>
          <button
            type="button"
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="mr-2 size-4" /> Sign out
          </button>
        </div>
      ) : null}
    </Sidebar2MenuItem>
  )
}

function isActivePath(pathname: string, target: string) {
  if (target === "/") return pathname === "/"
  return pathname === target || pathname.startsWith(`${target}/`)
}

export function SidecarToggle() {
  const { sidecarOpen, toggleSidecar } = useSidebar2()

  if (sidecarOpen) return null

  return (
    <Button
      variant="default"
      size="lg"
      className="fixed right-4 bottom-4 z-50 cursor-pointer rounded-full bg-sidebar-primary px-4 text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary"
      onClick={toggleSidecar}
      aria-label="Open assistant"
    >
      <MessageSquare className="size-4!" aria-hidden />
      Assistant
    </Button>
  )
}

export function NewAppSidebar() {
  const { pinned, togglePinned, setHovered } = useSidebar2()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const auditId = pathname.match(/^\/new\/([^/]+)/)?.[1]

  return (
    <Sidebar2>
      <Sidebar2Header>
        <Sidebar2Group>
          <Sidebar2GroupContent className="flex items-center justify-between gap-2">
            <AppLogo />

            <Sidebar2MenuButton
              tooltip={pinned ? "Unpin sidebar" : "Pin sidebar"}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              className="w-fit shrink-0 cursor-pointer"
              onClick={() => {
                togglePinned()
                if (pinned) setHovered(false)
              }}
            >
              <Pin className={cn("size-4", pinned && "fill-current")} />
            </Sidebar2MenuButton>
          </Sidebar2GroupContent>
        </Sidebar2Group>
      </Sidebar2Header>

      <Sidebar2Content>
        <Sidebar2Group>
          <Sidebar2GroupLabel>Workspace</Sidebar2GroupLabel>
          <Sidebar2GroupContent>
            <Sidebar2Menu>
              <Sidebar2MenuItem>
                <Sidebar2MenuButton
                  isActive={!auditId ? isActivePath(pathname, "/new") : pathname === `/new/${auditId}` || pathname === `/new/${auditId}/`}
                  tooltip="UX Audit"
                  render={
                    auditId ? (
                      <Link
                        to="/new/$auditId"
                        params={{ auditId }}
                        className="flex w-full items-center gap-2 rounded-md px-2 group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:px-0"
                      >
                        <FileSearch className="size-4.5!" aria-hidden />
                        <span>UX Audit</span>
                      </Link>
                    ) : (
                      <Link
                        to="/new"
                        className="flex w-full items-center gap-2 rounded-md px-2 group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:px-0"
                      >
                        <FileSearch className="size-4.5!" aria-hidden />
                        <span>UX Audit</span>
                      </Link>
                    )
                  }
                />
              </Sidebar2MenuItem>
              <Sidebar2MenuItem>
                <Sidebar2MenuButton
                  isActive={Boolean(auditId) && isActivePath(pathname, `/new/${auditId}/files`)}
                  tooltip="Files"
                  disabled={!auditId}
                  render={
                    auditId ? (
                      <Link to="/new/$auditId/files" params={{ auditId }} className="flex w-full items-center gap-2 rounded-md px-2 group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:px-0">
                        <FolderOpen className="size-4.5!" aria-hidden />
                        <span>Files</span>
                      </Link>
                    ) : undefined
                  }
                >
                  {!auditId ? <><FolderOpen className="size-4.5!" aria-hidden /><span>Files</span></> : null}
                </Sidebar2MenuButton>
              </Sidebar2MenuItem>
              <Sidebar2MenuItem>
                <Sidebar2MenuButton
                  isActive={Boolean(auditId) && isActivePath(pathname, `/new/${auditId}/settings`)}
                  tooltip="Settings"
                  disabled={!auditId}
                  render={
                    auditId ? (
                      <Link to="/new/$auditId/settings" params={{ auditId }} className="flex w-full items-center gap-2 rounded-md px-2 group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:px-0">
                        <Settings className="size-4.5!" aria-hidden />
                        <span>Settings</span>
                      </Link>
                    ) : undefined
                  }
                >
                  {!auditId ? <><Settings className="size-4.5!" aria-hidden /><span>Settings</span></> : null}
                </Sidebar2MenuButton>
              </Sidebar2MenuItem>
            </Sidebar2Menu>
          </Sidebar2GroupContent>
        </Sidebar2Group>

        <Sidebar2Group>
          <Sidebar2GroupLabel>UX Tools</Sidebar2GroupLabel>
          <Sidebar2GroupContent>
            <Sidebar2Menu>
              <Sidebar2MenuItem>
                <Sidebar2MenuButton
                  isActive={isActivePath(pathname, "/surveys")}
                  tooltip="Survey"
                  render={
                    <Link
                      to="/surveys"
                      search={surveysListSearchDefaults}
                      className="flex w-full items-center gap-2 rounded-md px-2 group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:px-0"
                    >
                      <LayoutPanelLeft className="size-4.5!" aria-hidden />
                      <span>Survey</span>
                    </Link>
                  }
                />
              </Sidebar2MenuItem>
              <Sidebar2MenuItem>
                <Sidebar2MenuButton
                  isActive={isActivePath(pathname, "/draw")}
                  tooltip="Draw"
                  render={
                    <Link
                      to="/draw"
                      search={{ draft: undefined }}
                      className="flex w-full items-center gap-2 rounded-md px-2 group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:px-0"
                    >
                      <Pencil className="size-4.5!" aria-hidden />
                      <span>Draw</span>
                    </Link>
                  }
                />
              </Sidebar2MenuItem>
              <Sidebar2MenuItem>
                <Sidebar2MenuButton
                  isActive={isActivePath(pathname, "/report")}
                  tooltip="Report"
                  render={
                    <Link
                      to="/report"
                      search={{ draft: undefined }}
                      className="flex w-full items-center gap-2 rounded-md px-2 group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:px-0"
                    >
                      <FileText className="size-4.5!" aria-hidden />
                      <span>Report</span>
                    </Link>
                  }
                />
              </Sidebar2MenuItem>
            </Sidebar2Menu>
          </Sidebar2GroupContent>
        </Sidebar2Group>
      </Sidebar2Content>

      <Sidebar2Footer>
        <Sidebar2Menu>
          <SidebarUserFooter />
        </Sidebar2Menu>
      </Sidebar2Footer>
    </Sidebar2>
  )
}
