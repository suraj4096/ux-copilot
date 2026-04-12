"use client"

import { Link } from "@tanstack/react-router"
import { ClipboardList, Home, PenLine } from "lucide-react"

import { surveysListSearchDefaults } from "@/lib/router-search-defaults"

const railItemClass =
  "flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-md text-center text-[10px] font-medium leading-tight transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const railItemInactive =
  "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
const railItemActive = "bg-primary/40 text-primary-foreground border border-primary-foreground/40"

export function AppNavRail() {
  return (
    <nav
      className="flex w-18 shrink-0 flex-col gap-1 border-r border-border bg-background px-2 py-2"
      aria-label="Main navigation"
    >
      <Link
        to="/"
        activeOptions={{ exact: true }}
        className={railItemClass}
        inactiveProps={{ className: railItemInactive }}
        activeProps={{ className: railItemActive }}
      >
        <Home className="size-5 shrink-0" aria-hidden />
        Home
      </Link>
      <Link
        to="/surveys"
        search={surveysListSearchDefaults}
        activeOptions={{ exact: false, includeSearch: false }}
        className={railItemClass}
        inactiveProps={{ className: railItemInactive }}
        activeProps={{ className: railItemActive }}
      >
        <ClipboardList className="size-5 shrink-0" aria-hidden />
        Surveys
      </Link>
      <Link
        to="/draw"
        activeOptions={{ exact: true }}
        className={railItemClass}
        inactiveProps={{ className: railItemInactive }}
        activeProps={{ className: railItemActive }}
      >
        <PenLine className="size-5 shrink-0" aria-hidden />
        Draw
      </Link>
    </nav>
  )
}
