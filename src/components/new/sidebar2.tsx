"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { Maximize2, PanelRightClose, PanelRightOpen } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const SIDEBAR2_WIDTH = "12.5rem"
const SIDEBAR2_WIDTH_ICON = "3rem"
const SIDEBAR2_SIDECAR_WIDTH = "24rem"
const SIDEBAR2_SIDECAR_WIDTH_FULL = "36rem"
const SIDEBAR2_HOVER_DELAY_MS = 200

type Sidebar2ContextValue = {
  pinned: boolean
  hovered: boolean
  state: "expanded" | "collapsed"
  sidecarOpen: boolean
  sidecarExpanded: boolean
  sidecarMounted: boolean
  setHovered: (value: boolean) => void
  togglePinned: () => void
  setSidecarOpen: (value: boolean | ((value: boolean) => boolean)) => void
  expandSidecar: () => void
  collapseSidecar: () => void
  toggleSidecar: () => void
  setSidecarMounted: (value: boolean) => void
}

const Sidebar2Context = React.createContext<Sidebar2ContextValue | null>(null)

function useSidebar2() {
  const context = React.useContext(Sidebar2Context)
  if (!context) {
    throw new Error("useSidebar2 must be used within a Sidebar2Provider.")
  }

  return context
}

function Sidebar2Provider({
  defaultPinned = false,
  defaultSidecarOpen = false,
  pinned: pinnedProp,
  onPinnedChange,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultPinned?: boolean
  pinned?: boolean
  onPinnedChange?: (value: boolean) => void
  defaultSidecarOpen?: boolean
}) {
  const [_pinned, _setPinned] = React.useState(defaultPinned)
  const pinned = pinnedProp ?? _pinned
  const [hovered, setHovered] = React.useState(false)
  const [sidecarOpen, setSidecarOpen] = React.useState(defaultSidecarOpen)
  const [sidecarExpanded, setSidecarExpanded] = React.useState(defaultSidecarOpen)
  const [sidecarMounted, setSidecarMounted] = React.useState(false)

  const setPinned = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(pinned) : value
      if (onPinnedChange) {
        onPinnedChange(next)
      } else {
        _setPinned(next)
      }
    },
    [onPinnedChange, pinned],
  )

  const togglePinned = React.useCallback(() => {
    const nextPinned = !pinned

    if (nextPinned && sidecarOpen) {
      setSidecarOpen(false)
    }

    setPinned(nextPinned)
  }, [pinned, sidecarOpen, setPinned])

  const toggleSidecar = React.useCallback(() => {
    setSidecarOpen((current) => {
      const next = !current
      setSidecarExpanded(next)
      return next
    })
  }, [])

  const expandSidecar = React.useCallback(() => {
    setSidecarOpen(true)
    setSidecarExpanded(true)
  }, [])

  const collapseSidecar = React.useCallback(() => {
    setSidecarExpanded(false)
  }, [])

  React.useEffect(() => {
    if (sidecarOpen) {
      setPinned(false)
      setHovered(false)
    } else {
      setSidecarExpanded(false)
    }
  }, [sidecarOpen, setPinned])

  const state = pinned || hovered ? "expanded" : "collapsed"

  const value = React.useMemo<Sidebar2ContextValue>(
    () => ({
      pinned,
      hovered,
      state,
      sidecarOpen,
      sidecarExpanded,
      sidecarMounted,
      setHovered,
      togglePinned,
      setSidecarOpen,
      expandSidecar,
      collapseSidecar,
      toggleSidecar,
      setSidecarMounted,
    }),
    [
      pinned,
      hovered,
      state,
      sidecarOpen,
      sidecarExpanded,
      sidecarMounted,
      togglePinned,
      expandSidecar,
      collapseSidecar,
      toggleSidecar,
    ],
  )

  return (
    <Sidebar2Context.Provider value={value}>
      <div
        data-slot="sidebar2-wrapper"
        data-state={state}
        data-pinned={pinned}
        data-hovered={hovered}
        style={
          {
            "--sidebar2-width": SIDEBAR2_WIDTH,
            "--sidebar2-width-icon": SIDEBAR2_WIDTH_ICON,
            "--sidebar2-sidecar-width": SIDEBAR2_SIDECAR_WIDTH,
            "--sidebar2-sidecar-width-full": SIDEBAR2_SIDECAR_WIDTH_FULL,
            ...style,
          } as React.CSSProperties
        }
        className={cn("group/sidebar2-wrapper flex min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </Sidebar2Context.Provider>
  )
}

function Sidebar2({
  side = "left",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
}) {
  const { pinned, hovered, state, setHovered } = useSidebar2()
  const hoverTimerRef = React.useRef<number | null>(null)

  const width = state === "collapsed" ? SIDEBAR2_WIDTH_ICON : SIDEBAR2_WIDTH

  const clearHoverTimer = React.useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }, [])

  const handleMouseEnter = React.useCallback(() => {
    clearHoverTimer()
    hoverTimerRef.current = window.setTimeout(() => {
      setHovered(true)
      hoverTimerRef.current = null
    }, SIDEBAR2_HOVER_DELAY_MS)
  }, [clearHoverTimer, setHovered])

  const handleMouseLeave = React.useCallback(() => {
    clearHoverTimer()
    setHovered(false)
  }, [clearHoverTimer, setHovered])

  React.useEffect(() => clearHoverTimer, [clearHoverTimer])

  return (
    <div
      data-slot="sidebar2"
      data-side={side}
      data-state={state}
      data-pinned={pinned}
      data-hovered={hovered}
      className={cn("peer hidden text-sidebar-foreground md:block", className)}
      {...props}
    >
      <div
        data-slot="sidebar2-container"
        data-side={side}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed inset-y-0 left-0 z-40 hidden h-svh flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground/90 transition-[width,box-shadow] duration-200 ease-linear will-change-[width,box-shadow] md:flex"
        style={{ width }}
      >
        <div data-slot="sidebar2-inner" className="flex size-full flex-col bg-sidebar">
          {children}
        </div>
      </div>
    </div>
  )
}

function Sidebar2Inset({ className, style, ...props }: React.ComponentProps<"main">) {
  const { pinned, state } = useSidebar2()
  const reservedWidth = pinned ? "var(--sidebar2-width)" : "var(--sidebar2-width-icon)"

  return (
    <main
      data-slot="sidebar2-inset"
      data-pinned={pinned}
      data-state={state}
      style={{
        marginLeft: reservedWidth,
        width: `calc(100% - ${reservedWidth})`,
        ...style,
      }}
      className={cn(
        "relative flex min-h-0 flex-1 bg-sidebar transition-[margin-left,width] duration-200 ease-linear",
        className,
      )}
      {...props}
    />
  )
}

function Sidebar2Sidecar({ className, children, ...props }: React.ComponentProps<"aside">) {
  const {
    sidecarOpen,
    sidecarExpanded,
    sidecarMounted,
    setSidecarMounted,
    expandSidecar,
    collapseSidecar,
    setSidecarOpen,
  } = useSidebar2()

  React.useEffect(() => {
    setSidecarMounted(true)
    return () => setSidecarMounted(false)
  }, [setSidecarMounted])

  if (!sidecarMounted) return null

  const state = sidecarOpen ? (sidecarExpanded ? "expanded-full" : "expanded") : "collapsed"
  const width = sidecarOpen
    ? sidecarExpanded
      ? "var(--sidebar2-sidecar-width-full)"
      : "var(--sidebar2-sidecar-width)"
    : "0px"

  return (
    <aside
      data-slot="sidebar2-sidecar"
      data-state={state}
      className={cn(
        "hidden h-full shrink-0 flex-col overflow-hidden border-l bg-sidebar text-sidebar-foreground transition-[width,opacity] duration-200 ease-linear will-change-[width,opacity] md:flex",
        sidecarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
      style={{ width }}
      {...props}
    >
      <div className="relative flex size-full min-w-0 flex-col pl-1">
        {sidecarOpen ? (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
            <button
              type="button"
              onClick={sidecarExpanded ? collapseSidecar : expandSidecar}
              className="inline-flex size-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={sidecarExpanded ? "Collapse sidecar" : "Expand sidecar"}
            >
              {sidecarExpanded ? <PanelRightClose className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSidecarOpen(false)}
              className="inline-flex size-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label="Close sidecar"
            >
              <PanelRightOpen className="size-4" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </aside>
  )
}

function Sidebar2SidecarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar2-sidecar-header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function Sidebar2SidecarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar2-sidecar-content"
      className={cn("no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)}
      {...props}
    />
  )
}

function Sidebar2SidecarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar2-sidecar-footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function Sidebar2Header({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar2-header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function Sidebar2Footer({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar2-footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function Sidebar2Content({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar2-content"
      className={cn("no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)}
      {...props}
    />
  )
}

function Sidebar2Group({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar2-group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
}

function Sidebar2GroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar2-group-content" className={cn("w-full text-sm", className)} {...props} />
}

function Sidebar2GroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div"> & React.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/60 outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[state=collapsed]/sidebar2-wrapper:hidden group-data-[state=collapsed]/sidebar2-wrapper:-mt-8 group-data-[state=collapsed]/sidebar2-wrapper:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "sidebar2-group-label" },
  })
}

function Sidebar2Menu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar2-menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
}

function Sidebar2MenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar2-menu-item" className={cn("group/menu-item relative", className)} {...props} />
}

function Sidebar2MenuButton({
  render,
  isActive = false,
  tooltip,
  className,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  }) {
  const { state } = useSidebar2()
  const button = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "peer/menu-button group/menu-button relative flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-active:bg-sidebar-accent data-active:pl-3 data-active:font-medium data-active:text-sidebar-accent-foreground group-data-[state=collapsed]/sidebar2-wrapper:data-active:pl-0 data-active:before:absolute data-active:before:inset-y-2 data-active:before:left-0 data-active:before:w-1 data-active:before:rounded-full data-active:before:bg-sidebar-primary data-active:before:content-[''] group-data-[state=collapsed]/sidebar2-wrapper:data-active:before:hidden [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate group-data-[state=collapsed]/sidebar2-wrapper:[&>span:last-child]:hidden group-data-[state=collapsed]/sidebar2-wrapper:h-8 group-data-[state=collapsed]/sidebar2-wrapper:w-8 group-data-[state=collapsed]/sidebar2-wrapper:justify-center group-data-[state=collapsed]/sidebar2-wrapper:p-0",
          className,
        ),
        ...(isActive ? ({ "data-active": "true" } as Record<string, string>) : {}),
      },
      props,
    ),
    render: !tooltip ? render : <TooltipTrigger render={render} />,
    state: { slot: "sidebar2-menu-button", active: isActive },
  })

  if (!tooltip) return button

  if (typeof tooltip === "string") {
    tooltip = { children: tooltip }
  }

  return (
    <Tooltip>
      {button}
      <TooltipContent side="right" align="center" hidden={state !== "collapsed"} {...tooltip} />
    </Tooltip>
  )
}

export {
  Sidebar2,
  Sidebar2Content,
  Sidebar2Footer,
  Sidebar2Group,
  Sidebar2GroupContent,
  Sidebar2GroupLabel,
  Sidebar2Header,
  Sidebar2Inset,
  Sidebar2Menu,
  Sidebar2MenuButton,
  Sidebar2MenuItem,
  Sidebar2Provider,
  Sidebar2Sidecar,
  Sidebar2SidecarContent,
  Sidebar2SidecarFooter,
  Sidebar2SidecarHeader,
  useSidebar2,
}
