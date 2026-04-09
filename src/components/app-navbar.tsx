"use client"

import { Link } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppNavbar() {
  return (
    <header className="flex items-center gap-2 border-b bg-background px-2 py-2 text-foreground">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <Link to="/" className="truncate text-sm font-medium">
        UX Copilot
      </Link>
      <div className="flex flex-1" />
      <div className="text-sm text-muted-foreground">Signed out</div>
    </header>
  )
}

