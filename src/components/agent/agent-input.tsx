"use client"

import { ArrowUp, ChevronDown } from "lucide-react"

import { CurrentContextChip } from "@/components/agent/current-context-chip"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAgentMode } from "@/contexts/agent-context"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

function labelForMode(mode: ReturnType<typeof useAgentMode>["mode"]): string {
  switch (mode) {
    case "auto":
      return "Auto"
    case "survey":
      return "Survey"
    case "draw":
      return "Draw"
  }
}

export function AgentInput({
  value,
  onChange,
  onSubmit,
  isDisabled,
  className,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isDisabled?: boolean
  className?: string
}) {
  const { mode, setMode } = useAgentMode()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className={cn("bg-background/95 backdrop-blur", className)}
    >
      <div className="rounded-4xl border bg-card p-3 shadow-xs">
        <div className="mb-2 flex items-center justify-between gap-2">
          <CurrentContextChip className="min-w-0" />
        </div>
        <Textarea
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }}
          placeholder="Ask anything..."
          rows={4}
          className="min-h-20 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {labelForMode(mode)}
              <ChevronDown className="size-3.5" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuRadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as typeof mode)}
              >
                <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="survey">
                  Survey
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="draw">Draw</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="submit"
            size="icon"
            disabled={isDisabled}
            className="rounded-full px-4"
          >
            <ArrowUp className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
      <p className="px-4 py-2 text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for a new line.
      </p>
    </form>
  )
}
